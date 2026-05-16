import {
  clearSpritePressedControls,
  createSpriteCell,
  createSpriteInputState,
  createSpriteViewHeight,
  getSpriteActionFrame,
  isSpriteControlCode,
  isSpriteControlHeld,
  pressSpriteControlOnce,
  pressSpriteInputCode,
  releaseSpriteInputCode,
  snapshotSpriteInputState,
  wasSpriteControlPressed,
} from "./sprite-action-tool";
import type {
  SpriteActionDefinition,
  SpriteControlDefinition,
  SpriteInputState,
} from "./sprite-action-tool";

export const SLIME_SPRITE_SHEET = {
  cols: 8,
  rows: 3,
  sourceWidth: 1881,
  sourceHeight: 836,
  viewWidth: 170,
} as const;

export const SLIME_SPRITE_CELL = createSpriteCell(SLIME_SPRITE_SHEET);
export const SLIME_SPRITE_VIEW_HEIGHT =
  createSpriteViewHeight(SLIME_SPRITE_SHEET);

export const SLIME_STAGE = {
  trackWidth: 760,
  minX: 24,
  groundBottom: 64,
  moveSpeed: 8.5,
  jumpVelocity: 20,
  gravity: 2.1,
} as const;

export const SLIME_MAX_X =
  SLIME_STAGE.trackWidth - SLIME_SPRITE_SHEET.viewWidth - SLIME_STAGE.minX;

export const SLIME_ACTION_IDS = ["idle", "walk", "jump", "attack"] as const;
export type SlimeActionId = (typeof SLIME_ACTION_IDS)[number];
const ATTACK_FRAMES = [10, 11, 12] as const;
const ATTACK_FRAME_TICKS = 3;
const ATTACK_DURATION_TICKS = ATTACK_FRAMES.length * ATTACK_FRAME_TICKS;
export const SLIME_ATTACK_COOLDOWN_TICKS = 8 as const;

export const SLIME_ACTIONS = {
  idle: {
    id: "idle",
    label: "대기",
    description: "0번 프레임 고정",
    frames: [0],
    frameTicks: 1,
    playback: "loop",
  },
  walk: {
    id: "walk",
    label: "이동",
    description: "좌우 이동 loop",
    frames: [3, 4, 5, 6],
    frameTicks: 5,
    playback: "loop",
  },
  jump: {
    id: "jump",
    label: "점프",
    description: "상승/하강 확인",
    frames: [8],
    frameTicks: 6,
    playback: "loop",
  },
  attack: {
    id: "attack",
    label: "공격",
    description: "빠른 검 베기와 칼끝 호 이펙트",
    frames: ATTACK_FRAMES,
    frameTicks: ATTACK_FRAME_TICKS,
    durationTicks: ATTACK_DURATION_TICKS,
    playback: "loop",
  },
} as const satisfies Record<
  SlimeActionId,
  SpriteActionDefinition<SlimeActionId>
>;

export const SLIME_ACTION_LIST = SLIME_ACTION_IDS.map(
  (id) => SLIME_ACTIONS[id]
);

export const SLIME_CONTROLS = {
  moveLeft: {
    id: "moveLeft",
    label: "왼쪽 이동",
    shortLabel: "A / ←",
    codes: ["ArrowLeft", "KeyA"],
  },
  moveRight: {
    id: "moveRight",
    label: "오른쪽 이동",
    shortLabel: "D / →",
    codes: ["ArrowRight", "KeyD"],
  },
  jump: {
    id: "jump",
    label: "점프 테스트",
    shortLabel: "Space",
    codes: ["Space"],
  },
  attack: {
    id: "attack",
    label: "공격 테스트",
    shortLabel: "J / K",
    codes: ["KeyJ", "KeyK"],
  },
} as const satisfies Record<string, SpriteControlDefinition<string>>;

export type SlimeControlId = keyof typeof SLIME_CONTROLS;

export const SLIME_CONTROL_IDS = Object.keys(
  SLIME_CONTROLS
) as SlimeControlId[];
export const SLIME_TEST_CONTROL_IDS = [
  "jump",
  "attack",
] as const satisfies readonly SlimeControlId[];

export type SlimeInputState = SpriteInputState;

export function createSlimeInputState(): SlimeInputState {
  return createSpriteInputState();
}

export function snapshotSlimeInputState(
  input: SlimeInputState
): SlimeInputState {
  return snapshotSpriteInputState(input);
}

export function isSlimeControlCode(code: string) {
  return isSpriteControlCode(SLIME_CONTROLS, code);
}

export function pressInputCode(input: SlimeInputState, code: string) {
  pressSpriteInputCode(input, code);
}

export function releaseInputCode(input: SlimeInputState, code: string) {
  releaseSpriteInputCode(input, code);
}

export function pressControlOnce(
  input: SlimeInputState,
  controlId: SlimeControlId
) {
  pressSpriteControlOnce(SLIME_CONTROLS, input, controlId);
}

export function clearPressedControls(input: SlimeInputState) {
  clearSpritePressedControls(input);
}

export function isControlHeld(
  input: SlimeInputState,
  controlId: SlimeControlId
) {
  return isSpriteControlHeld(SLIME_CONTROLS, input, controlId);
}

export function wasControlPressed(
  input: SlimeInputState,
  controlId: SlimeControlId
) {
  return wasSpriteControlPressed(SLIME_CONTROLS, input, controlId);
}

export type SlimeMoveInput = {
  moveLeftPressed: boolean;
  moveRightPressed: boolean;
  moveLeftHeld: boolean;
  moveRightHeld: boolean;
};

export function resolveSlimeMoveDirectionAndFacing(
  prevFacing: 1 | -1,
  moveInput: SlimeMoveInput
): { direction: -1 | 0 | 1; facing: 1 | -1 } {
  const { moveLeftPressed, moveRightPressed, moveLeftHeld, moveRightHeld } =
    moveInput;

  if (moveLeftHeld && moveRightHeld) {
    if (moveRightPressed && !moveLeftPressed) {
      return { direction: 1, facing: 1 };
    }
    if (moveLeftPressed && !moveRightPressed) {
      return { direction: -1, facing: -1 };
    }
    return { direction: prevFacing, facing: prevFacing };
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

export type SlimeAttackTransitionInput = {
  prevAction: string;
  prevActionTick: number;
  wantsAttack: boolean;
  attackDurationTicks: number;
  attackCooldownRemaining: number;
};

export type SlimeAttackTransition = {
  isContinuingAttack: boolean;
  startsAttack: boolean;
};

export function resolveSlimeAttackTransition({
  prevAction,
  prevActionTick,
  wantsAttack,
  attackDurationTicks,
  attackCooldownRemaining,
}: SlimeAttackTransitionInput): SlimeAttackTransition {
  const isContinuingAttack =
    prevAction === "attack" && prevActionTick < attackDurationTicks - 1;
  const startsAttack =
    wantsAttack &&
    attackCooldownRemaining <= 0 &&
    (prevAction !== "attack" ||
      (!isContinuingAttack && prevActionTick >= attackDurationTicks - 1));

  return { isContinuingAttack, startsAttack };
}

export function nextAttackCooldown({
  prevAction,
  prevAttackCooldown,
  startsAttack,
}: {
  prevAction: string;
  prevAttackCooldown: number;
  startsAttack: boolean;
}) {
  if (startsAttack) return SLIME_ATTACK_COOLDOWN_TICKS;
  if (prevAction === "attack") return prevAttackCooldown;
  return Math.max(0, prevAttackCooldown - 1);
}

export function canStartSlimeJump({
  isGrounded,
  velocityY,
  jumpsUsed,
  maxJumps = 2,
  canStartCondition = (v) => v <= 0,
}: {
  isGrounded: boolean;
  velocityY: number;
  jumpsUsed: number;
  maxJumps?: number;
  canStartCondition?: (velocityY: number) => boolean;
}) {
  if (isGrounded) return true;
  if (jumpsUsed >= maxJumps) return false;
  return canStartCondition(velocityY);
}

export function getSlimeActionFrame({
  action,
  actionTick,
  velocityY,
}: {
  action: SlimeActionId;
  actionTick: number;
  velocityY: number;
}) {
  void velocityY;
  return getSpriteActionFrame({
    definition: SLIME_ACTIONS[action],
    actionTick,
    playback: SLIME_ACTIONS[action].playback,
  });
}
