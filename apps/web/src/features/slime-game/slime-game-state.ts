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
  jumpsUsed: number;
  facing: 1 | -1;
  tick: number;
  action: SlimeActionId;
  actionTick: number;
};

export const INITIAL_STATE: GameState = {
  x: 96,
  groundOffset: 0,
  velocityY: 0,
  jumpsUsed: 0,
  facing: 1,
  tick: 0,
  action: "idle",
  actionTick: 0,
};

export function nextState(prev: GameState, input: SlimeInputState): GameState {
  const { direction, facing } = resolveDirectionAndFacing(prev.facing, input);
  const x = clamp(
    prev.x + direction * SLIME_STAGE.moveSpeed,
    SLIME_STAGE.minX,
    SLIME_MAX_X
  );

  let groundOffset = prev.groundOffset;
  let jumpsUsed = isGrounded(prev) ? 0 : prev.jumpsUsed;
  let velocityY = prev.velocityY;
  const wantsJump =
    isControlHeld(input, "jump") || wasControlPressed(input, "jump");

  if (wantsJump && canStartJump({ prev, velocityY, jumpsUsed })) {
    velocityY = SLIME_STAGE.jumpVelocity;
    jumpsUsed = isGrounded(prev) ? 1 : 2;
  }

  groundOffset += velocityY;
  if (groundOffset > 0 || velocityY > 0) {
    velocityY -= SLIME_STAGE.gravity;
  }

  if (groundOffset <= 0) {
    groundOffset = 0;
    velocityY = 0;
    jumpsUsed = 0;
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
    jumpsUsed,
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

function resolveDirectionAndFacing(
  prevFacing: 1 | -1,
  input: SlimeInputState
): { direction: -1 | 0 | 1; facing: 1 | -1 } {
  const moveLeftPressed = wasControlPressed(input, "moveLeft");
  const moveRightPressed = wasControlPressed(input, "moveRight");
  const moveLeftHeld = isControlHeld(input, "moveLeft");
  const moveRightHeld = isControlHeld(input, "moveRight");

  if (moveLeftHeld && moveRightHeld) {
    if (moveRightPressed && !moveLeftPressed) {
      return { direction: 1, facing: 1 };
    }
    if (moveLeftPressed && !moveRightPressed) {
      return { direction: -1, facing: -1 };
    }
    return { direction: 0, facing: prevFacing };
  }

  const direction = ((moveRightHeld ? 1 : 0) - (moveLeftHeld ? 1 : 0)) as
    | -1
    | 0
    | 1;
  return {
    direction,
    facing: direction === 0 ? prevFacing : direction > 0 ? 1 : -1,
  };
}

function canStartJump({
  prev,
  velocityY,
  jumpsUsed,
}: {
  prev: GameState;
  velocityY: number;
  jumpsUsed: number;
}) {
  if (isGrounded(prev)) return true;
  if (jumpsUsed >= 2) return false;
  return velocityY <= 0;
}

function isGrounded(state: GameState) {
  return state.groundOffset <= 0 && state.velocityY === 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
