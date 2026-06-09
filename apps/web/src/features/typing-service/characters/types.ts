import type { TypingLocale } from "../use-typing-settings";

export type CharacterIdentity = {
  id: string;
  label: Record<TypingLocale, string>;
};

export type CharacterSpriteSheet = {
  sprite: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameCols: number;
};

export type CharacterAnimationSpec = {
  fps: number;
  // 재생할 sheet frame 인덱스 순서. 없으면 0..frameCount-1 순서로 fallback.
  frameSequence?: number[];
};

export type CharacterCredit = {
  credit?: { source: string; license: string };
};

export type CharacterDef = CharacterIdentity &
  CharacterSpriteSheet &
  CharacterAnimationSpec &
  CharacterCredit;
