import type { TypingRacePlayerCharacter } from "@yeon/typing-race-engine";
import { DEFAULT_CHARACTER_ID, TYPING_CHARACTERS } from "./registry.generated";
import type { CharacterDef } from "./types";

// 캐릭터 추가는 `apps/web/src/features/typing-service/characters/data/<id>.json` 한 파일을 만들면 끝.
// `scripts/build-character-registry.mjs` 가 prebuild에서 자동으로 registry.generated.ts 를 갱신한다.

export { DEFAULT_CHARACTER_ID, TYPING_CHARACTERS };

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
