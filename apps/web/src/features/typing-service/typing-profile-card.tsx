"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterSprite } from "./character-sprite";
import { TYPING_CHARACTERS, findCharacter } from "./characters";
import type { TypingProfile } from "./use-typing-profile";
import type { TypingLocale } from "./use-typing-settings";

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
    `rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
      profile.characterId === id
        ? "border-[#111] bg-[#111] text-white"
        : "border-[#e5e5e5] text-[#555] hover:border-[#aaa]"
    }`;

  return (
    <div className="flex w-[380px] flex-col items-center rounded-2xl border border-[#e5e5e5] bg-white px-10 py-8">
      {/* 캐릭터 애니메이션 */}
      <div className="mb-6 flex h-[360px] items-end justify-center rounded-xl bg-[#f5f5f5] px-4 py-3">
        <CharacterSprite
          character={selectedChar}
          maxHeight={CARD_DISPLAY_MAX_HEIGHT}
        />
      </div>

      {/* 닉네임 */}
      <div className="mb-5 flex items-center gap-2">
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
            className="w-44 border-b border-[#111] bg-transparent text-center text-[20px] font-semibold text-[#111] outline-none"
          />
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 text-[20px] font-semibold text-[#111] hover:text-[#555]"
            onClick={() => setIsEditing(true)}
          >
            {profile.nickname}
            <span className="text-[13px] font-normal text-[#bbb]">✎</span>
          </button>
        )}
      </div>

      {/* 캐릭터 선택 */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
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
          <div className="flex flex-wrap justify-center gap-2">
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
          className="mt-1 text-[11px] text-[#aaa] hover:text-[#555]"
        >
          {expanded ? "접기 ↑" : `더 보기 (${rest.length}개) ↓`}
        </button>
      </div>
    </div>
  );
}
