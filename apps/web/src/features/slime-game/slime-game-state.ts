import {
  SLIME_ACTIONS,
  SLIME_MAX_X,
  SLIME_STAGE,
  canStartSlimeJump,
  nextAttackCooldown,
  getSlimeActionFrame,
  resolveSlimeAttackTransition,
  resolveSlimeMoveDirectionAndFacing,
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
  attackCooldown: number;
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
  attackCooldown: 0,
};

export function nextState(prev: GameState, input: SlimeInputState): GameState {
  const { direction, facing } = resolveSlimeMoveDirectionAndFacing(
    prev.facing,
    {
      moveLeftPressed: wasControlPressed(input, "moveLeft"),
      moveRightPressed: wasControlPressed(input, "moveRight"),
      moveLeftHeld: isControlHeld(input, "moveLeft"),
      moveRightHeld: isControlHeld(input, "moveRight"),
    }
  );
  const x = clamp(
    prev.x + direction * SLIME_STAGE.moveSpeed,
    SLIME_STAGE.minX,
    SLIME_MAX_X
  );

  let groundOffset = prev.groundOffset;
  let jumpsUsed = isGroundedState(prev) ? 0 : prev.jumpsUsed;
  let velocityY = prev.velocityY;
  const wantsJump =
    isControlHeld(input, "jump") || wasControlPressed(input, "jump");

  const isGrounded = isGroundedState(prev);
  if (
    wantsJump &&
    canStartSlimeJump({
      isGrounded,
      velocityY,
      jumpsUsed,
    })
  ) {
    velocityY = SLIME_STAGE.jumpVelocity;
    jumpsUsed = isGrounded ? 1 : 2;
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
    attackCooldownRemaining: prev.attackCooldown,
    wantsAttack:
      isControlHeld(input, "attack") || wasControlPressed(input, "attack"),
  });
  const attackCooldown = nextAttackCooldown({
    prevAction: prev.action,
    prevAttackCooldown: prev.attackCooldown,
    startsAttack: nextAction.startsAttack,
  });

  return {
    x,
    groundOffset,
    velocityY,
    facing,
    tick: prev.tick + 1,
    action: nextAction.action,
    attackCooldown,
    jumpsUsed,
    actionTick: nextAction.action === prev.action ? prev.actionTick + 1 : 0,
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
  attackCooldownRemaining,
}: {
  prev: GameState;
  direction: number;
  groundOffset: number;
  velocityY: number;
  wantsAttack: boolean;
  attackCooldownRemaining: number;
}): { action: SlimeActionId; startsAttack: boolean } {
  const attackTransition = resolveSlimeAttackTransition({
    prevAction: prev.action,
    prevActionTick: prev.actionTick,
    wantsAttack,
    attackDurationTicks: SLIME_ACTIONS.attack.durationTicks ?? 0,
    attackCooldownRemaining,
  });

  if (attackTransition.startsAttack || attackTransition.isContinuingAttack) {
    return { action: "attack", startsAttack: true };
  }

  if (groundOffset > 0 || velocityY !== 0) {
    return { action: "jump", startsAttack: false };
  }
  if (direction !== 0) {
    return { action: "walk", startsAttack: false };
  }
  return { action: "idle", startsAttack: false };
}

function isGroundedState(state: GameState) {
  return state.groundOffset <= 0 && state.velocityY === 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
