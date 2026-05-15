export type SpriteSheetDefinition = {
  cols: number;
  rows: number;
  sourceWidth: number;
  sourceHeight: number;
  viewWidth: number;
};

export type SpriteActionDefinition<ActionId extends string = string> = {
  id: ActionId;
  label: string;
  description: string;
  frames: readonly number[];
  frameTicks: number;
  durationTicks?: number;
};

export type SpriteControlDefinition<ControlId extends string = string> = {
  id: ControlId;
  label: string;
  shortLabel: string;
  codes: readonly string[];
};

export type SpriteInputState = {
  held: Record<string, boolean>;
  pressed: Record<string, boolean>;
};

export type SpriteFramePlayback = "loop" | "clamp";

export function createSpriteCell(sheet: SpriteSheetDefinition) {
  return {
    width: sheet.sourceWidth / sheet.cols,
    height: sheet.sourceHeight / sheet.rows,
  } as const;
}

export function createSpriteViewHeight(sheet: SpriteSheetDefinition) {
  const cell = createSpriteCell(sheet);
  return Math.round(sheet.viewWidth * (cell.height / cell.width));
}

export function createSpriteInputState(): SpriteInputState {
  return { held: {}, pressed: {} };
}

export function isSpriteControlCode<
  ControlId extends string,
  Controls extends Record<ControlId, SpriteControlDefinition<ControlId>>,
>(controls: Controls, code: string) {
  return Object.values<SpriteControlDefinition<ControlId>>(controls).some(
    (control) => control.codes.includes(code)
  );
}

export function pressSpriteInputCode(input: SpriteInputState, code: string) {
  if (!input.held[code]) input.pressed[code] = true;
  input.held[code] = true;
}

export function releaseSpriteInputCode(input: SpriteInputState, code: string) {
  input.held[code] = false;
}

export function pressSpriteControlOnce<
  ControlId extends string,
  Controls extends Record<ControlId, SpriteControlDefinition<ControlId>>,
>(controls: Controls, input: SpriteInputState, controlId: ControlId) {
  const code = controls[controlId].codes[0];
  if (!code) return;
  input.pressed[code] = true;
}

export function clearSpritePressedControls(input: SpriteInputState) {
  input.pressed = {};
}

export function isSpriteControlHeld<
  ControlId extends string,
  Controls extends Record<ControlId, SpriteControlDefinition<ControlId>>,
>(controls: Controls, input: SpriteInputState, controlId: ControlId) {
  return controls[controlId].codes.some((code) => input.held[code]);
}

export function wasSpriteControlPressed<
  ControlId extends string,
  Controls extends Record<ControlId, SpriteControlDefinition<ControlId>>,
>(controls: Controls, input: SpriteInputState, controlId: ControlId) {
  return controls[controlId].codes.some((code) => input.pressed[code]);
}

export function getSpriteActionFrame<ActionId extends string>({
  definition,
  actionTick,
  playback = "loop",
}: {
  definition: SpriteActionDefinition<ActionId>;
  actionTick: number;
  playback?: SpriteFramePlayback;
}) {
  const frameIndex =
    playback === "clamp"
      ? Math.min(
          definition.frames.length - 1,
          Math.floor(actionTick / definition.frameTicks)
        )
      : Math.floor(actionTick / definition.frameTicks) %
        definition.frames.length;

  return definition.frames[frameIndex] ?? definition.frames[0] ?? 0;
}
