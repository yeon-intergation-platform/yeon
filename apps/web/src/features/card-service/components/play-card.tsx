"use client";
import {
  YeonButton,
  YeonText,
  YeonView,
  type YeonKeyboardEvent,
  type YeonButtonElement,
} from "@yeon/ui";
import { MarkdownContent } from "./markdown-content";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

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
  const handleKeyDown = (event: YeonKeyboardEvent<YeonButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <YeonButton
      type="button"
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      aria-label={
        isFlipped
          ? "뒷면: 클릭하거나 Space를 눌러 앞면으로"
          : "앞면: 클릭하거나 Space를 눌러 뒷면으로"
      }
      variant="ghost"
      size="sm"
      className="relative h-[380px] w-full max-w-[720px] cursor-pointer rounded-2xl border-0 bg-transparent p-0 text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[#111]"
    >
      <YeonView
        className={`relative h-full w-full [transform-style:preserve-3d] transition-transform duration-[350ms] ease-in-out ${
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        }`}
      >
        <YeonView className="absolute inset-0 flex flex-col rounded-2xl border border-[#e5e5e5] bg-white [backface-visibility:hidden]">
          <YeonView className="shrink-0 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-1.5">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={`${SHARED_FEATURE_CLASS.text11EmphasisSubtle} tracking-wide`}
            >
              질문
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-1 overflow-y-auto p-12 text-center">
            <YeonView
              className={`${SHARED_FEATURE_CLASS.text22Emphasis} my-auto w-full`}
            >
              <MarkdownContent>{frontText}</MarkdownContent>
            </YeonView>
          </YeonView>
        </YeonView>
        <YeonView className="absolute inset-0 flex flex-col rounded-2xl border border-[#e5e5e5] bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <YeonView className="shrink-0 bg-[#111] px-4 py-1.5">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-semibold tracking-wide text-white"
            >
              답변
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-1 overflow-y-auto p-12 text-center">
            <YeonView
              className={`${SHARED_FEATURE_CLASS.text22Emphasis} my-auto w-full`}
            >
              <MarkdownContent>{backText}</MarkdownContent>
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonButton>
  );
}
