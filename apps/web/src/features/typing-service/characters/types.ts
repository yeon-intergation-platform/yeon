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
  credit?: { source: string; license: string };
};
