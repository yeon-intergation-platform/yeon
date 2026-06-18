"use client";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import type { RefObject } from "react";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonText,
  YeonView,
  type YeonTextAreaElement,
} from "@yeon/ui";
import { TYPING_SPEED_STYLE } from "@yeon/race-shared";
import type { TypingDeckPassageOption } from "./use-typing-settings";

type TypingRaceSoloPracticeContentProps = {
  passage: TypingDeckPassageOption;
  promptChars: string[];
  input: string;
  inputChars: string[];
  mismatches: number[];
  textareaRef: RefObject<YeonTextAreaElement | null>;
};

type TypingRaceSoloPracticeMetricsProps = {
  speedStyle: (typeof TYPING_SPEED_STYLE)[keyof typeof TYPING_SPEED_STYLE];
  displaySpeed: number;
  displayUnit: string;
  cpm: number;
  accuracy: number;
  progress: number;
  elapsedSeconds: number;
};

type TypingRaceSoloPracticeStateProps = {
  completed: boolean;
  countdownRemaining: number;
};

type TypingRaceSoloPracticeLabels = {
  result: string;
  speedLabel: string;
  accuracy: string;
  progress: string;
  time: string;
  restart: string;
  typingInput: string;
  startingIn: string;
  typeHere: string;
};

type TypingRaceSoloPracticeActions = {
  onInputChange: (value: string) => void;
  onRestart: () => void;
};

type TypingRaceSoloPracticePanelProps = TypingRaceSoloPracticeContentProps &
  TypingRaceSoloPracticeMetricsProps &
  TypingRaceSoloPracticeStateProps & {
    labels: TypingRaceSoloPracticeLabels;
  } & TypingRaceSoloPracticeActions;

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
      <YeonView
        className={`${TYPING_SERVICE_COMMON_CLASS.raceStatRowBase} flex-wrap gap-x-6 gap-y-2${
          countdownRemaining > 0 ? " opacity-40" : ""
        }`}
        aria-hidden={countdownRemaining > 0}
      >
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {speedStyle === TYPING_SPEED_STYLE.KO_JASO
            ? labels.speedLabel
            : "WPM"}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
        >
          {displaySpeed}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {displayUnit}
        </YeonText>
        {speedStyle !== TYPING_SPEED_STYLE.KO_JASO && (
          <>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
            >
              ·
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] text-[#666]"
            >
              CPM
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
            >
              {cpm}
            </YeonText>
          </>
        )}
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
        >
          ·
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {labels.accuracy}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
        >
          {accuracy}%
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
        >
          ·
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {labels.progress}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
        >
          {progress}%
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
        >
          ·
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {labels.time}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
        >
          {elapsedSeconds.toFixed(1)}s
        </YeonText>
      </YeonView>

      {completed && (
        <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceResultCard}>
          <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceStatValueRow}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
            >
              {labels.result}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.metricValue}
              >
                {displaySpeed}
              </YeonText>{" "}
              {displayUnit}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.metricValue}
              >
                {accuracy}
              </YeonText>{" "}
              % {labels.accuracy}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.metricValue}
              >
                {elapsedSeconds.toFixed(1)}
              </YeonText>
              s
            </YeonText>
          </YeonView>
          <YeonButton
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={onRestart}
          >
            <YeonIcon name="rotate-cw" size={13} />
            {labels.restart}
          </YeonButton>
        </YeonView>
      )}

      {!completed && (
        <YeonView className={TYPING_SERVICE_COMMON_CLASS.sectionBodyGap3}>
          <YeonView
            className={`${TYPING_SERVICE_COMMON_CLASS.racePromptTextPanel} break-keep`}
          >
            {promptChars.map((char, index) => {
              const typed = inputChars[index];
              const isCurrent = index === inputChars.length;
              const isMismatch = mismatches.includes(index);
              const isMatched = typed === char;

              return (
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  key={`${passage.id}-${index}`}
                  className={
                    isMismatch
                      ? TYPING_SERVICE_COMMON_CLASS.racePromptMismatchChar
                      : isMatched
                        ? TYPING_SERVICE_COMMON_CLASS.racePromptMatchedChar
                        : isCurrent
                          ? "border-b-2 border-[#111] bg-white text-[#111]"
                          : TYPING_SERVICE_COMMON_CLASS.racePromptPendingChar
                  }
                >
                  {char}
                </YeonText>
              );
            })}
          </YeonView>

          <YeonField
            as="textarea"
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
        </YeonView>
      )}
    </>
  );
}
