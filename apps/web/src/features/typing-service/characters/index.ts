import type { TypingRacePlayerCharacter } from "@yeon/typing-race-engine";
import type { CharacterDef } from "./types";

// 캐릭터 추가는 이 배열에 한 항목을 추가하면 끝.
// 자산 표준: scripts/sprites/extract-character-run.py 로 정규화한
// 8프레임 가로 시트 (frameWidth × frameHeight × 8) PNG.
export const TYPING_CHARACTERS: readonly CharacterDef[] = [
  {
    id: "camel",
    label: { ko: "낙타", en: "Camel" },
    sprite: "/sprites/camel-run.png",
    frameWidth: 96,
    frameHeight: 96,
    frameCount: 6,
    frameCols: 2,
    fps: 10,
  },
  {
    id: "asuna",
    label: { ko: "아스나", en: "Asuna" },
    sprite: "/sprites/characters/asuna/run.png",
    frameWidth: 192,
    frameHeight: 208,
    frameCount: 8,
    frameCols: 8,
    fps: 4,
    credit: {
      source:
        "Yuuki Asuna chibi sprite (사용자 부여 공개 배포 허가, 2026-05-03)",
      license: "approved",
    },
  },
  {
    id: "linnea",
    label: { ko: "린네아", en: "Linnea" },
    sprite: "/sprites/characters/linnea/run.png",
    frameWidth: 192,
    frameHeight: 208,
    frameCount: 8,
    frameCols: 8,
    fps: 4,
    credit: {
      source:
        "Augury Bird fae chibi sprite (사용자 부여 공개 배포 허가, 2026-05-03)",
      license: "approved",
    },
  },
];

export const DEFAULT_CHARACTER_ID = TYPING_CHARACTERS[0]!.id;

export function findCharacter(id: string | null | undefined): CharacterDef {
  if (!id) return TYPING_CHARACTERS[0]!;
  return TYPING_CHARACTERS.find((c) => c.id === id) ?? TYPING_CHARACTERS[0]!;
}

export function toEnginePlayerCharacter(
  character: CharacterDef
): TypingRacePlayerCharacter {
  return {
    id: character.id,
    spritePath: character.sprite,
    frameWidth: character.frameWidth,
    frameHeight: character.frameHeight,
    frameCount: character.frameCount,
    fps: character.fps,
  };
}

export type { CharacterDef };
