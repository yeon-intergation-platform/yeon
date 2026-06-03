"use client";
import { useEffect, useState } from "react";
import type { CharacterDef } from "./characters";
import { YeonSpriteFrame } from "@yeon/ui";
import {
  clearYeonInterval,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

// integer multiple(×1, ×2, ×3 ...)을 먼저 시도해 가장 큰 정수 배수를 반환한다.
// 정수 배수가 없으면 integer divisor(1/2, 1/3 ...)로 fallback.
// sub-pixel scale을 금지해 background-position 1px 어긋남(흔들림) 방지.
export function snapDisplayHeight(
  frameHeight: number,
  maxHeight: number
): number {
  const mult = Math.floor(maxHeight / frameHeight);
  if (mult >= 1) return frameHeight * mult;
  for (let divisor = 2; divisor <= 16; divisor++) {
    const candidate = frameHeight / divisor;
    if (candidate <= maxHeight) return Math.round(candidate);
  }
  return frameHeight;
}

export function CharacterSprite({
  character,
  maxHeight,
  sequenceOverride,
}: {
  character: CharacterDef;
  maxHeight: number;
  // JSON의 frameSequence보다 우선 적용. 관리자 UI에서 실시간 프리뷰에 사용.
  sequenceOverride?: number[];
}) {
  const {
    sprite,
    frameWidth,
    frameHeight,
    frameCount,
    frameCols,
    fps,
    frameSequence,
  } = character;
  const sequence =
    sequenceOverride ??
    frameSequence ??
    Array.from({ length: frameCount }, (_, i) => i);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalMs = Math.max(40, Math.round(1000 / fps));
    const id = scheduleYeonInterval(
      () => setTick((t) => (t + 1) % sequence.length),
      intervalMs
    );
    return () => clearYeonInterval(id);
  }, [sequence.length, fps]);

  const sheetFrame = sequence[tick % sequence.length]!;
  const displayHeight = snapDisplayHeight(frameHeight, maxHeight);

  return (
    <YeonSpriteFrame
      displayHeight={displayHeight}
      frameCols={frameCols}
      frameCount={frameCount}
      frameHeight={frameHeight}
      frameIndex={sheetFrame}
      frameWidth={frameWidth}
      source={sprite}
    />
  );
}
