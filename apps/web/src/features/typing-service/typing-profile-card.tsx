"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterSprite } from "./character-sprite";
import { TYPING_CHARACTERS, findCharacter } from "./characters";
import { useCharacterFrameOverrides } from "./use-character-frame-overrides";
import type { TypingProfile } from "./use-typing-profile";
import type { TypingLocale } from "./use-typing-settings";
import { TYPING_PROFILE_CARD_CLASS } from "./typing-profile-card.const";

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className={TYPING_PROFILE_CARD_CLASS.root}>
      {/* 캐릭터 애니메이션 */}
      <div className={TYPING_PROFILE_CARD_CLASS.spriteWrapper}>
        <CharacterSprite
          character={selectedChar}
          maxHeight={CARD_DISPLAY_MAX_HEIGHT}
          sequenceOverride={frameOverrides[selectedChar.id]}
        />
      </div>

      {/* 닉네임 */}
      <div className={TYPING_PROFILE_CARD_CLASS.nicknameRow}>
        {isEditing ? (
          <input
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
          <button
            type="button"
            className={TYPING_PROFILE_CARD_CLASS.nicknameButton}
            onClick={() => setIsEditing(true)}
          >
            {profile.nickname}
            <span className={TYPING_PROFILE_CARD_CLASS.nicknameEditIcon}>
              ✎
            </span>
          </button>
        )}
      </div>

      {/* 캐릭터 선택 */}
      <div className={TYPING_PROFILE_CARD_CLASS.characterListWrapper}>
        <div className={TYPING_PROFILE_CARD_CLASS.characterListStack}>
          {featured.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => onCharacterChange(char.id)}
              className={charBtnClass(char.id)}
            >
              {char.label[locale]}
            </button>
          ))}
        </div>
        {expanded && (
          <div className={TYPING_PROFILE_CARD_CLASS.characterListStack}>
            {rest.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => onCharacterChange(char.id)}
                className={charBtnClass(char.id)}
              >
                {char.label[locale]}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={TYPING_PROFILE_CARD_CLASS.characterToggle}
        >
          {expanded ? "접기 ↑" : `더 보기 (${rest.length}개) ↓`}
        </button>
      </div>
    </div>
  );
}

export function TypingProfileCardSkeleton() {
  return (
    <div className={TYPING_PROFILE_CARD_CLASS.root} aria-busy="true">
      <div className={TYPING_PROFILE_CARD_CLASS.skeletonSpriteWrapper}>
        <span className={TYPING_PROFILE_CARD_CLASS.skeletonText}>
          프로필을 불러오는 중
        </span>
      </div>
      <div className={TYPING_PROFILE_CARD_CLASS.skeletonNickname}>profile</div>
      <div className={TYPING_PROFILE_CARD_CLASS.characterListWrapper}>
        <div className={TYPING_PROFILE_CARD_CLASS.skeletonButtonRow}>
          <span className={TYPING_PROFILE_CARD_CLASS.skeletonButton} />
          <span className={TYPING_PROFILE_CARD_CLASS.skeletonButton} />
          <span className={TYPING_PROFILE_CARD_CLASS.skeletonButton} />
        </div>
      </div>
    </div>
  );
}
