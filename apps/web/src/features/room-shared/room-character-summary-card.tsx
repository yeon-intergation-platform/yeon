"use client";

import Link from "next/link";

import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import type { TypingLocale } from "@/features/typing-service/use-typing-settings";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { joinClassNames } from "@/components/yeon-ui";

type RoomCharacterSummaryCardProps = {
  loaded?: boolean;
  nickname: string;
  characterId: string;
  locale: TypingLocale;
  changeHref: string;
  className?: string;
  loadingLabel?: string;
};

export function RoomCharacterSummaryCard({
  loaded = true,
  nickname,
  characterId,
  locale,
  changeHref,
  className,
  loadingLabel = "프로필 불러오는 중",
}: RoomCharacterSummaryCardProps) {
  const character = findCharacter(characterId);
  const frameOverrides = useCharacterFrameOverrides();

  return (
    <div
      className={joinClassNames(
        "flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3",
        className
      )}
    >
      <div className="flex h-[72px] w-[72px] items-end justify-center overflow-hidden rounded-xl bg-white">
        {loaded ? (
          <CharacterSprite
            character={character}
            maxHeight={68}
            sequenceOverride={frameOverrides[character.id]}
          />
        ) : null}
      </div>
      <div>
        <p className={SHARED_FEATURE_CLASS.text13EmphasisMuted}>입장 캐릭터</p>
        <p className="mt-1 text-[16px] font-bold text-[#111]">
          {loaded ? `${nickname} · ${character.label[locale]}` : loadingLabel}
        </p>
        <Link
          href={changeHref}
          className={`mt-2 inline-flex ${SHARED_FEATURE_CLASS.text12EmphasisNeutral} underline underline-offset-4`}
        >
          캐릭터 바꾸기
        </Link>
      </div>
    </div>
  );
}
