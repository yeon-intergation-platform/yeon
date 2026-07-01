import { CheckCircle2, Clock3, Timer } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonSurface,
  YeonText,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import {
  formatElapsedSeconds,
  formatRemainingSeconds,
} from "./focus-desk-format";
import {
  FOCUS_DESK_SESSION_MINUTES,
  type FocusDeskSessionMinutes,
  type FocusDeskSessionStatus,
  type FocusDeskSummary,
} from "./focus-desk-session";

function SegmentButton({
  children,
  disabled,
  selected,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
      }`}
    >
      {children}
    </button>
  );
}

export function FocusDeskTimerPanel({
  canStart,
  isFinished,
  minutes,
  remainingSeconds,
  sessionStatus,
  summary,
  onFinish,
  onMinutesSelect,
  onStartSession,
}: {
  canStart: boolean;
  isFinished: boolean;
  minutes: FocusDeskSessionMinutes;
  remainingSeconds: number;
  sessionStatus: FocusDeskSessionStatus;
  summary: FocusDeskSummary | null;
  onFinish: () => void;
  onMinutesSelect: (minutes: FocusDeskSessionMinutes) => void;
  onStartSession: () => void;
}): ReactElement {
  const isRunning = sessionStatus === "running";
  const showStartButton = !isFinished && !isRunning;

  return (
    <YeonSurface
      className={`border-[#e5e5e5] p-5 ${YEON_WEB_SHADOW_CLASS.cardSoft}`}
    >
      <YeonView className="flex items-center justify-between gap-3">
        <YeonView>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text12Soft}
          >
            {isFinished ? "세션 상태" : "현재 세션"}
          </YeonText>
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className="mt-1 block text-[34px] font-black text-[#111]"
            data-testid="focus-desk-timer"
          >
            {isFinished ? "완료" : formatRemainingSeconds(remainingSeconds)}
          </YeonText>
        </YeonView>
        {isFinished ? (
          <CheckCircle2 aria-hidden="true" size={42} className="text-[#111]" />
        ) : (
          <Clock3 aria-hidden="true" size={42} className="text-[#111]" />
        )}
      </YeonView>
      {isFinished && summary ? (
        <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Emphasis}
          >
            {summary.reviewed}장 채점 · 실제{" "}
            {formatElapsedSeconds(summary.elapsedSeconds)}
          </YeonText>
        </YeonView>
      ) : (
        <YeonView className="mt-4 grid grid-cols-3 gap-2">
          {FOCUS_DESK_SESSION_MINUTES.map((option) => (
            <SegmentButton
              key={option}
              selected={minutes === option}
              disabled={isRunning}
              onClick={() => onMinutesSelect(option)}
            >
              {option}분
            </SegmentButton>
          ))}
        </YeonView>
      )}
      {isRunning ? (
        <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-center">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Emphasis}
          >
            타이머 실행 중
          </YeonText>
        </YeonView>
      ) : null}
      {showStartButton ? (
        <YeonButton
          type="button"
          variant="primary"
          disabled={!canStart}
          onClick={onStartSession}
          className="mt-4 w-full gap-2 px-4 py-4 text-[14px]"
          data-testid="focus-desk-start"
        >
          <Timer aria-hidden="true" size={16} />
          집중 시작
        </YeonButton>
      ) : null}
      {isRunning ? (
        <YeonButton
          type="button"
          variant="secondary"
          onClick={onFinish}
          className="mt-2 w-full px-4 py-3 text-[13px]"
        >
          세션 종료하고 요약 보기
        </YeonButton>
      ) : null}
    </YeonSurface>
  );
}
