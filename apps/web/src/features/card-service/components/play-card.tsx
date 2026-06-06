"use client";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  YeonButton,
  YeonText,
  YeonView,
  type YeonKeyboardEvent,
  type YeonButtonElement,
} from "@yeon/ui";
import { MarkdownContent } from "./markdown-content";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  CARD_PLAY_CARD_SIZE_LIMITS,
  clampCardPlayCardSize,
  type CardPlayCardSize,
} from "../utils/card-play-card-size";

interface PlayCardProps {
  frontText: string;
  backText: string;
  isFlipped: boolean;
  shouldAnimateFlip: boolean;
  size: CardPlayCardSize;
  onFlip: () => void;
  onSizeChange: (size: CardPlayCardSize) => void;
}

const CARD_RESIZE_KEYBOARD_STEP = 24;

function getCardResizeStyle(size: CardPlayCardSize): CSSProperties {
  return {
    width: size.width,
    height: size.height,
    minWidth: CARD_PLAY_CARD_SIZE_LIMITS.minWidth,
    minHeight: CARD_PLAY_CARD_SIZE_LIMITS.minHeight,
    maxWidth: "calc(100vw - 3rem)",
  };
}

export function PlayCard({
  frontText,
  backText,
  isFlipped,
  shouldAnimateFlip,
  size,
  onFlip,
  onSizeChange,
}: PlayCardProps) {
  const handleKeyDown = (event: YeonKeyboardEvent<YeonButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onFlip();
    }
  };

  const applySizeDelta = (widthDelta: number, heightDelta: number) => {
    onSizeChange(
      clampCardPlayCardSize({
        width: size.width + widthDelta,
        height: size.height + heightDelta,
      })
    );
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startSize = size;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      onSizeChange(
        clampCardPlayCardSize({
          width: startSize.width + moveEvent.clientX - startX,
          height: startSize.height + moveEvent.clientY - startY,
        })
      );
    };

    const handlePointerUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleResizeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      applySizeDelta(CARD_RESIZE_KEYBOARD_STEP, 0);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      applySizeDelta(-CARD_RESIZE_KEYBOARD_STEP, 0);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      applySizeDelta(0, CARD_RESIZE_KEYBOARD_STEP);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      applySizeDelta(0, -CARD_RESIZE_KEYBOARD_STEP);
    }
  };

  return (
    <YeonView
      className="relative w-full max-w-[1100px]"
      style={getCardResizeStyle(size)}
    >
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
        className="relative h-full w-full cursor-pointer rounded-2xl border-0 bg-transparent p-0 text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[#111]"
      >
        <YeonView
          className={`relative h-full w-full [transform-style:preserve-3d] ${
            shouldAnimateFlip ? "transition-transform duration-[350ms] ease-in-out" : ""
          } ${
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

      <YeonView
        role="separator"
        tabIndex={0}
        aria-label="카드 크기 조절"
        aria-valuetext={`${size.width} x ${size.height}`}
        onPointerDown={handleResizePointerDown}
        onKeyDown={handleResizeKeyDown}
        className="absolute bottom-2 right-2 z-10 h-7 w-7 cursor-nwse-resize rounded-lg border border-[#d4d4d4] bg-white/95 shadow-sm outline-none transition hover:border-[#111] focus-visible:ring-2 focus-visible:ring-[#111]"
      >
        <YeonView className="absolute bottom-[6px] right-[6px] h-3 w-3 border-b-2 border-r-2 border-[#777]" />
      </YeonView>
    </YeonView>
  );
}
