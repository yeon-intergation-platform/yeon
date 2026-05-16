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

export const SLIME_ACTIONS = {
  idle: {
    id: "idle",
    label: "대기",
    description: "0번 프레임 고정",
    frames: [0],
    frameTicks: 1,
  },
  walk: {
    id: "walk",
    label: "이동",
    description: "좌우 이동 loop",
    frames: [3, 4, 5, 6],
    frameTicks: 5,
  },
  jump: {
    id: "jump",
    label: "점프",
    description: "상승/하강 확인",
    frames: [7, 8],
    frameTicks: 6,
  },
  attack: {
    id: "attack",
    label: "공격",
    description: "빠른 검 베기와 칼끝 호 이펙트",
    frames: [10, 11, 12],
    frameTicks: 3,
    durationTicks: 11,
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
    shortLabel: "J",
    codes: ["KeyJ"],
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

export function getSlimeActionFrame({
  action,
  actionTick,
  velocityY,
}: {
  action: SlimeActionId;
  actionTick: number;
  velocityY: number;
}) {
  if (action === "jump") return velocityY >= 0 ? 7 : 8;

  return getSpriteActionFrame({
    definition: SLIME_ACTIONS[action],
    actionTick,
    playback: action === "attack" ? "clamp" : "loop",
  });
}
