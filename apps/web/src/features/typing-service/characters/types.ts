import type { TypingLocale } from "../use-typing-settings";

export type CharacterDef = {
  id: string;
  label: Record<TypingLocale, string>;
  sprite: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameCols: number;
  fps: number;
  // 재생할 sheet frame 인덱스 순서. 없으면 0..frameCount-1 순서로 fallback.
  frameSequence?: number[];
  credit?: { source: string; license: string };
};
