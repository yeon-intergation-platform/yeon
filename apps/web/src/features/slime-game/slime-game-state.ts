export type Keys = Record<string, boolean>;
export type SlimeMotion = "idle" | "walk";

export type GameState = {
  x: number;
  facing: 1 | -1;
  tick: number;
  motion: SlimeMotion;
};

export const SPRITE_COLS = 8;
export const SPRITE_ROWS = 3;
export const SPRITE_SOURCE_WIDTH = 1881;
export const SPRITE_SOURCE_HEIGHT = 836;
export const SPRITE_CELL_WIDTH = SPRITE_SOURCE_WIDTH / SPRITE_COLS;
export const SPRITE_CELL_HEIGHT = SPRITE_SOURCE_HEIGHT / SPRITE_ROWS;
export const SPRITE_VIEW_WIDTH = 170;
export const SPRITE_VIEW_HEIGHT = Math.round(
  SPRITE_VIEW_WIDTH * (SPRITE_CELL_HEIGHT / SPRITE_CELL_WIDTH)
);
export const TRACK_WIDTH = 760;
export const MIN_X = 24;
export const MAX_X = TRACK_WIDTH - SPRITE_VIEW_WIDTH - 24;

const MOVE_SPEED = 5.5;
const WALK_FRAME_TICKS = 5;
const IDLE_FRAME_TICKS = 14;

const WALK_FRAMES = [3, 4, 5, 6] as const;
const IDLE_FRAMES = [0, 1, 0, 2] as const;

export const INITIAL_STATE: GameState = {
  x: 96,
  facing: 1,
  tick: 0,
  motion: "idle",
};

export function nextState(prev: GameState, keys: Keys): GameState {
  const wantsLeft = keys.ArrowLeft || keys.KeyA;
  const wantsRight = keys.ArrowRight || keys.KeyD;
  const direction = (wantsRight ? 1 : 0) - (wantsLeft ? 1 : 0);
  const x = clamp(prev.x + direction * MOVE_SPEED, MIN_X, MAX_X);

  return {
    x,
    facing: direction === 0 ? prev.facing : direction > 0 ? 1 : -1,
    tick: prev.tick + 1,
    motion: direction === 0 ? "idle" : "walk",
  };
}

export function slimeFrame(state: GameState) {
  if (state.motion === "walk") {
    return WALK_FRAMES[
      Math.floor(state.tick / WALK_FRAME_TICKS) % WALK_FRAMES.length
    ];
  }

  return IDLE_FRAMES[
    Math.floor(state.tick / IDLE_FRAME_TICKS) % IDLE_FRAMES.length
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
