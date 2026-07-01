import { FOCUS_DESK_MODES, type FocusDeskMode } from "./focus-desk-session";

export const FOCUS_DESK_MODE_OPTIONS: Array<{
  mode: FocusDeskMode;
  label: string;
  description: string;
}> = [
  {
    mode: FOCUS_DESK_MODES.review,
    label: "복습 우선",
    description: "어려움·복습 예정 카드를 먼저 봅니다.",
  },
  {
    mode: FOCUS_DESK_MODES.all,
    label: "전체 훑기",
    description: "덱의 현재 순서대로 진행합니다.",
  },
  {
    mode: FOCUS_DESK_MODES.exam,
    label: "시험 직전",
    description: "어려운 카드와 미복습 카드를 앞에 둡니다.",
  },
];

export function getFocusDeskModeLabel(mode: FocusDeskMode): string {
  return (
    FOCUS_DESK_MODE_OPTIONS.find((option) => option.mode === mode)?.label ??
    "복습 우선"
  );
}
