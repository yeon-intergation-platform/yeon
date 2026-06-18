"use client";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import type { TypingLocale } from "@/features/typing-service/use-typing-settings";
import { getTypingUiText } from "@/features/typing-service/typing-service-i18n";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { joinClassNames, YeonText, YeonView, YeonLink } from "@yeon/ui";

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
  loadingLabel,
}: RoomCharacterSummaryCardProps) {
  const character = findCharacter(characterId);
  const frameOverrides = useCharacterFrameOverrides();
  const text = getTypingUiText(locale);
  const resolvedLoadingLabel = loadingLabel ?? text.profile.loading;

  return (
    <YeonView
      className={joinClassNames(
        "flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3",
        className
      )}
    >
      <YeonView className="flex h-[72px] w-[72px] items-end justify-center overflow-hidden rounded-xl bg-white">
        {loaded ? (
          <CharacterSprite
            character={character}
            maxHeight={68}
            sequenceOverride={frameOverrides[character.id]}
          />
        ) : null}
      </YeonView>
      <YeonView>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisMuted}
        >
          {text.profile.entryCharacter}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="mt-1 text-[16px] font-bold text-[#111]"
        >
          {loaded
            ? `${nickname} · ${character.label[locale]}`
            : resolvedLoadingLabel}
        </YeonText>
        <YeonLink
          href={changeHref}
          aria-label={text.profile.changeCharacter}
          className="mt-2 inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#e5e5e5] bg-white px-3 text-[13px] font-semibold text-[#111]"
        >
          {text.profile.changeCharacter}
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-hidden="true"
            className="text-[16px] leading-none"
          >
            →
          </YeonText>
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}
