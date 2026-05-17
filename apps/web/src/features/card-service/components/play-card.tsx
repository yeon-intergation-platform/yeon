"use client";

import type { KeyboardEvent } from "react";

import { MarkdownContent } from "./markdown-content";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

interface PlayCardProps {
  frontText: string;
  backText: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function PlayCard({
  frontText,
  backText,
  isFlipped,
  onFlip,
}: PlayCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <button
      type="button"
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      aria-label={
        isFlipped
          ? "뒷면: 클릭하거나 Space를 눌러 앞면으로"
          : "앞면: 클릭하거나 Space를 눌러 뒷면으로"
      }
      className="relative h-[380px] w-full max-w-[720px] cursor-pointer rounded-2xl border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#111]"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 350ms ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-[#e5e5e5] bg-white"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="shrink-0 border-b border-[#e5e5e5] bg-[#f5f5f5] px-4 py-1.5">
            <span
              className={`${SHARED_FEATURE_CLASS.text11EmphasisSubtle} tracking-wide`}
            >
              질문
            </span>
          </div>
          <div className="flex flex-1 overflow-y-auto p-12 text-center">
            <div
              className={`${SHARED_FEATURE_CLASS.text22Emphasis} my-auto w-full`}
            >
              <MarkdownContent>{frontText}</MarkdownContent>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-[#e5e5e5] bg-white"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="shrink-0 bg-[#111] px-4 py-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-white">
              답변
            </span>
          </div>
          <div className="flex flex-1 overflow-y-auto p-12 text-center">
            <div
              className={`${SHARED_FEATURE_CLASS.text22Emphasis} my-auto w-full`}
            >
              <MarkdownContent>{backText}</MarkdownContent>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
