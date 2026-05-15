import {
  SLIME_ACTIONS,
  SLIME_MAX_X,
  SLIME_STAGE,
  getSlimeActionFrame,
  isControlHeld,
  wasControlPressed,
} from "./slime-game-domain";
import type { SlimeActionId, SlimeInputState } from "./slime-game-domain";

export type GameState = {
  x: number;
  groundOffset: number;
  velocityY: number;
  facing: 1 | -1;
  tick: number;
  action: SlimeActionId;
  actionTick: number;
};

export const INITIAL_STATE: GameState = {
  x: 96,
  groundOffset: 0,
  velocityY: 0,
  facing: 1,
  tick: 0,
  action: "idle",
  actionTick: 0,
};

export function nextState(prev: GameState, input: SlimeInputState): GameState {
  const direction =
    (isControlHeld(input, "moveRight") ? 1 : 0) -
    (isControlHeld(input, "moveLeft") ? 1 : 0);
  const x = clamp(
    prev.x + direction * SLIME_STAGE.moveSpeed,
    SLIME_STAGE.minX,
    SLIME_MAX_X
  );
  const facing = direction === 0 ? prev.facing : direction > 0 ? 1 : -1;

  let groundOffset = prev.groundOffset;
  let velocityY = prev.velocityY;
  const wasGrounded = groundOffset <= 0 && velocityY === 0;
  if (wasControlPressed(input, "jump") && wasGrounded) {
    velocityY = SLIME_STAGE.jumpVelocity;
  }

  groundOffset += velocityY;
  if (groundOffset > 0 || velocityY > 0) {
    velocityY -= SLIME_STAGE.gravity;
  }
  if (groundOffset <= 0) {
    groundOffset = 0;
    velocityY = 0;
  }

  const nextAction = chooseNextAction({
    prev,
    direction,
    groundOffset,
    velocityY,
    wantsAttack: wasControlPressed(input, "attack"),
  });

  return {
    x,
    groundOffset,
    velocityY,
    facing,
    tick: prev.tick + 1,
    action: nextAction,
    actionTick: nextAction === prev.action ? prev.actionTick + 1 : 0,
  };
}

export function slimeFrame(state: GameState) {
  return getSlimeActionFrame({
    action: state.action,
    actionTick: state.actionTick,
    velocityY: state.velocityY,
  });
}

function chooseNextAction({
  prev,
  direction,
  groundOffset,
  velocityY,
  wantsAttack,
}: {
  prev: GameState;
  direction: number;
  groundOffset: number;
  velocityY: number;
  wantsAttack: boolean;
}): SlimeActionId {
  if (wantsAttack) return "attack";

  const attackTicks = SLIME_ACTIONS.attack.durationTicks ?? 0;
  if (prev.action === "attack" && prev.actionTick < attackTicks - 1) {
    return "attack";
  }

  if (groundOffset > 0 || velocityY !== 0) return "jump";
  if (direction !== 0) return "walk";
  return "idle";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
