"use client";

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
      <div className="mt-3 flex items-center gap-6 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-3 font-mono text-[13px]">
        <span className="text-[#888]">
          {speedStyle === TYPING_SPEED_STYLE.KO_JASO ? "타수" : "WPM"}
        </span>
        <span className="text-[18px] font-bold text-[#111]">
          {displaySpeed}
        </span>
        <span className="text-[#888]">{displayUnit}</span>
        {speedStyle !== TYPING_SPEED_STYLE.KO_JASO && (
          <>
            <span className="text-[#ddd]">·</span>
            <span className="text-[#888]">CPM</span>
            <span className="text-[18px] font-bold text-[#111]">{cpm}</span>
          </>
        )}
        <span className="text-[#ddd]">·</span>
        <span className="text-[#888]">acc</span>
        <span className="text-[18px] font-bold text-[#111]">{accuracy}%</span>
        <span className="text-[#ddd]">·</span>
        <span className="text-[#888]">progress</span>
        <span className="text-[18px] font-bold text-[#111]">{progress}%</span>
        <span className="text-[#ddd]">·</span>
        <span className="text-[#888]">time</span>
        <span className="text-[18px] font-bold text-[#111]">
          {elapsedSeconds.toFixed(1)}s
        </span>
      </div>

      {completed && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
          <div className="flex items-center gap-6 font-mono text-[13px]">
            <span className="text-[#888]">{labels.result}</span>
            <span className="text-[#111]">
              <span className="text-[20px] font-bold">{displaySpeed}</span>{" "}
              {displayUnit}
            </span>
            <span className="text-[#111]">
              <span className="text-[20px] font-bold">{accuracy}</span>%{" "}
              {labels.accuracy}
            </span>
            <span className="text-[#111]">
              <span className="text-[20px] font-bold">
                {elapsedSeconds.toFixed(1)}
              </span>
              s
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-[#e5e5e5] px-5 py-2 text-[13px] font-medium text-[#555] transition-colors hover:border-[#aaa]"
            onClick={onRestart}
          >
            <RotateCcw size={13} />
            {labels.restart}
          </button>
        </div>
      )}

      {!completed && (
        <div className="mt-3 grid gap-3">
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-6 py-5 font-mono text-[19px] leading-[2] tracking-[0.01em]">
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
                      ? "bg-red-100 text-red-500"
                      : isMatched
                        ? "text-[#111]"
                        : isCurrent
                          ? "bg-[#111] text-white"
                          : "text-[#ccc]"
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
            className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-5 py-4 font-mono text-[16px] leading-[1.7] text-[#111] outline-none transition-colors placeholder:text-[#ccc] focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-40"
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
