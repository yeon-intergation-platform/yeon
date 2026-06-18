"use client";
import { useEffect, useRef, useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonText,
  YeonView,
  type YeonInputElement,
} from "@yeon/ui";
import { CharacterSprite } from "./character-sprite";
import { TYPING_CHARACTERS, findCharacter } from "./characters";
import { useCharacterFrameOverrides } from "./use-character-frame-overrides";
import type { TypingProfile } from "./use-typing-profile";
import type { TypingLocale } from "./use-typing-settings";
import { TYPING_PROFILE_CARD_CLASS } from "./typing-profile-card.const";
import { getTypingUiText } from "./typing-service-i18n";

const CARD_DISPLAY_MAX_HEIGHT = 312;

// 접기/펼치기 기준 캐릭터 id
const FEATURED_IDS = ["camel", "guga", "yuki"] as const;

type TypingProfileCardProps = {
  profile: TypingProfile;
  onNicknameChange: (nickname: string) => void;
  onCharacterChange: (characterId: string) => void;
  locale: TypingLocale;
};

export function TypingProfileCard({
  profile,
  onNicknameChange,
  onCharacterChange,
  locale,
}: TypingProfileCardProps) {
  const frameOverrides = useCharacterFrameOverrides();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile.nickname);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<YeonInputElement>(null);
  const text = getTypingUiText(locale).profile;

  useEffect(() => {
    setDraft(profile.nickname);
  }, [profile.nickname]);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const submitNickname = () => {
    const trimmed = draft.trim();
    onNicknameChange(trimmed || profile.nickname);
    setDraft(trimmed || profile.nickname);
    setIsEditing(false);
  };

  const selectedChar = findCharacter(profile.characterId);

  const featured = TYPING_CHARACTERS.filter((c) =>
    (FEATURED_IDS as readonly string[]).includes(c.id)
  );
  const rest = TYPING_CHARACTERS.filter(
    (c) => !(FEATURED_IDS as readonly string[]).includes(c.id)
  );

  const charBtnClass = (id: string) =>
    `${TYPING_PROFILE_CARD_CLASS.ctaButtonBase} ${
      profile.characterId === id
        ? TYPING_PROFILE_CARD_CLASS.ctaButtonSelected
        : TYPING_PROFILE_CARD_CLASS.ctaButtonDefault
    }`;

  return (
    <YeonView className={TYPING_PROFILE_CARD_CLASS.root}>
      {/* 캐릭터 애니메이션 */}
      <YeonView className={TYPING_PROFILE_CARD_CLASS.spriteWrapper}>
        <CharacterSprite
          character={selectedChar}
          maxHeight={CARD_DISPLAY_MAX_HEIGHT}
          sequenceOverride={frameOverrides[selectedChar.id]}
        />
      </YeonView>

      {/* 닉네임 */}
      <YeonView className={TYPING_PROFILE_CARD_CLASS.nicknameRow}>
        {isEditing ? (
          <YeonField
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitNickname}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNickname();
              if (e.key === "Escape") {
                setDraft(profile.nickname);
                setIsEditing(false);
              }
            }}
            maxLength={20}
            className={TYPING_PROFILE_CARD_CLASS.nicknameInput}
          />
        ) : (
          <YeonButton
            type="button"
            variant="ghost"
            size="sm"
            className={TYPING_PROFILE_CARD_CLASS.nicknameButton}
            onClick={() => setIsEditing(true)}
            aria-label={text.editNickname}
            title={text.editNickname}
          >
            {profile.nickname}
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              aria-hidden="true"
              className={TYPING_PROFILE_CARD_CLASS.nicknameEditIcon}
            >
              ✎
            </YeonText>
          </YeonButton>
        )}
      </YeonView>

      {/* 캐릭터 선택 */}
      <YeonView className={TYPING_PROFILE_CARD_CLASS.characterListWrapper}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_PROFILE_CARD_CLASS.characterGroupLabel}
        >
          {text.characterSelect}
        </YeonText>
        <YeonView className={TYPING_PROFILE_CARD_CLASS.characterListStack}>
          {featured.map((char) => (
            <YeonButton
              key={char.id}
              type="button"
              onClick={() => onCharacterChange(char.id)}
              variant="secondary"
              size="sm"
              className={charBtnClass(char.id)}
            >
              {char.label[locale]}
            </YeonButton>
          ))}
        </YeonView>
        {expanded && (
          <YeonView className={TYPING_PROFILE_CARD_CLASS.characterListStack}>
            {rest.map((char) => (
              <YeonButton
                key={char.id}
                type="button"
                onClick={() => onCharacterChange(char.id)}
                variant="secondary"
                size="sm"
                className={charBtnClass(char.id)}
              >
                {char.label[locale]}
              </YeonButton>
            ))}
          </YeonView>
        )}
        <YeonButton
          type="button"
          onClick={() => setExpanded((v) => !v)}
          variant="ghost"
          size="sm"
          className={TYPING_PROFILE_CARD_CLASS.characterToggle}
        >
          {expanded ? text.collapse : text.showMore(rest.length)}
        </YeonButton>
      </YeonView>
    </YeonView>
  );
}

export function TypingProfileCardSkeleton({
  locale = "ko",
}: {
  locale?: TypingLocale;
} = {}) {
  const text = getTypingUiText(locale).profile;

  return (
    <YeonView className={TYPING_PROFILE_CARD_CLASS.root} aria-busy="true">
      <YeonView className={TYPING_PROFILE_CARD_CLASS.skeletonSpriteWrapper}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_PROFILE_CARD_CLASS.skeletonText}
        >
          {text.loading}
        </YeonText>
      </YeonView>
      <YeonView className={TYPING_PROFILE_CARD_CLASS.skeletonNickname}>
        profile
      </YeonView>
      <YeonView className={TYPING_PROFILE_CARD_CLASS.characterListWrapper}>
        <YeonView className={TYPING_PROFILE_CARD_CLASS.skeletonButtonRow}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_PROFILE_CARD_CLASS.skeletonButton}
          />
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_PROFILE_CARD_CLASS.skeletonButton}
          />
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_PROFILE_CARD_CLASS.skeletonButton}
          />
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
