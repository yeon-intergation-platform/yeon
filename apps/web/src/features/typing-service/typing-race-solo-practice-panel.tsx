"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

import type { RefObject } from "react";
import { RotateCcw } from "lucide-react";
import { TYPING_SPEED_STYLE } from "@yeon/race-shared";
import type { TypingDeckPassageOption } from "./use-typing-settings";

interface TypingRaceSoloPracticePanelProps {
  passage: TypingDeckPassageOption;
  promptChars: string[];
  input: string;
  inputChars: string[];
  mismatches: number[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  speedStyle: (typeof TYPING_SPEED_STYLE)[keyof typeof TYPING_SPEED_STYLE];
  displaySpeed: number;
  displayUnit: string;
  cpm: number;
  accuracy: number;
  progress: number;
  elapsedSeconds: number;
  completed: boolean;
  countdownRemaining: number;
  labels: {
    result: string;
    accuracy: string;
    restart: string;
    typingInput: string;
    startingIn: string;
    typeHere: string;
  };
  onInputChange: (value: string) => void;
  onRestart: () => void;
}

export function TypingRaceSoloPracticePanel({
  passage,
  promptChars,
  input,
  inputChars,
  mismatches,
  textareaRef,
  speedStyle,
  displaySpeed,
  displayUnit,
  cpm,
  accuracy,
  progress,
  elapsedSeconds,
  completed,
  countdownRemaining,
  labels,
  onInputChange,
  onRestart,
}: TypingRaceSoloPracticePanelProps) {
  return (
    <>
      <div
        className={`${TYPING_SERVICE_COMMON_CLASS.raceStatRowBase}${
          countdownRemaining > 0 ? " opacity-40" : ""
        }`}
        aria-hidden={countdownRemaining > 0}
      >
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
          {speedStyle === TYPING_SPEED_STYLE.KO_JASO ? "타수" : "WPM"}
        </span>
        <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
          {displaySpeed}
        </span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
          {displayUnit}
        </span>
        {speedStyle !== TYPING_SPEED_STYLE.KO_JASO && (
          <>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>
              ·
            </span>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
              CPM
            </span>
            <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
              {cpm}
            </span>
          </>
        )}
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>acc</span>
        <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
          {accuracy}%
        </span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
          progress
        </span>
        <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
          {progress}%
        </span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
        <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>time</span>
        <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
          {elapsedSeconds.toFixed(1)}s
        </span>
      </div>

      {completed && (
        <div className={TYPING_SERVICE_COMMON_CLASS.raceResultCard}>
          <div className={TYPING_SERVICE_COMMON_CLASS.raceStatValueRow}>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
              {labels.result}
            </span>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
              <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                {displaySpeed}
              </span>{" "}
              {displayUnit}
            </span>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
              <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                {accuracy}
              </span>{" "}
              % {labels.accuracy}
            </span>
            <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
              <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                {elapsedSeconds.toFixed(1)}
              </span>
              s
            </span>
          </div>
          <button
            type="button"
            className={SHARED_FEATURE_CLASS.smallInlineActionButton}
            onClick={onRestart}
          >
            <RotateCcw size={13} />
            {labels.restart}
          </button>
        </div>
      )}

      {!completed && (
        <div className={TYPING_SERVICE_COMMON_CLASS.sectionBodyGap3}>
          <div
            className={`${TYPING_SERVICE_COMMON_CLASS.racePromptTextPanel} break-keep`}
          >
            {promptChars.map((char, index) => {
              const typed = inputChars[index];
              const isCurrent = index === inputChars.length;
              const isMismatch = mismatches.includes(index);
              const isMatched = typed === char;

              return (
                <span
                  key={`${passage.id}-${index}`}
                  className={
                    isMismatch
                      ? TYPING_SERVICE_COMMON_CLASS.racePromptMismatchChar
                      : isMatched
                        ? TYPING_SERVICE_COMMON_CLASS.racePromptMatchedChar
                        : isCurrent
                          ? TYPING_SERVICE_COMMON_CLASS.racePromptCurrentChar
                          : TYPING_SERVICE_COMMON_CLASS.racePromptPendingChar
                  }
                >
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) =>
              onInputChange(
                Array.from(event.target.value)
                  .slice(0, promptChars.length)
                  .join("")
              )
            }
            disabled={countdownRemaining > 0}
            rows={3}
            spellCheck={false}
            aria-label={labels.typingInput}
            className={TYPING_SERVICE_COMMON_CLASS.raceInputArea}
            placeholder={
              countdownRemaining > 0
                ? `${countdownRemaining}${labels.startingIn}`
                : labels.typeHere
            }
          />
        </div>
      )}
    </>
  );
}
