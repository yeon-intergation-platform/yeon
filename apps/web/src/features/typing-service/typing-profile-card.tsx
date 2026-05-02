"use client";

import { useEffect, useRef, useState } from "react";
import type { CharacterDef } from "./characters";
import { TYPING_CHARACTERS, findCharacter } from "./characters";
import type { TypingProfile } from "./use-typing-profile";
import type { TypingLocale } from "./use-typing-settings";

// 카드 캐릭터 디스플레이 height. 캐릭터 비율은 frameWidth/frameHeight 그대로 따라간다.
const CARD_DISPLAY_HEIGHT = 160;

function CharacterSprite({
  character,
  displayHeight,
}: {
  character: CharacterDef;
  displayHeight: number;
}) {
  const { sprite, frameWidth, frameHeight, frameCount, frameCols, fps } =
    character;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalMs = Math.max(40, Math.round(1000 / fps));
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frameCount),
      intervalMs
    );
    return () => clearInterval(id);
  }, [frameCount, fps]);

  const col = frame % frameCols;
  const row = Math.floor(frame / frameCols);
  const sheetRows = Math.max(1, Math.ceil(frameCount / frameCols));
  const scale = displayHeight / frameHeight;
  const displayWidth = frameWidth * scale;

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url('${sprite}')`,
        backgroundSize: `${frameWidth * frameCols * scale}px ${frameHeight * sheetRows * scale}px`,
        backgroundPosition: `-${col * displayWidth}px -${row * displayHeight}px`,
        imageRendering: "pixelated",
        flexShrink: 0,
      }}
    />
  );
}

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

  return (
    <div className="flex w-[340px] flex-col items-center rounded-2xl border border-[#e5e5e5] bg-white px-10 py-8">
      {/* 캐릭터 애니메이션 */}
      <div className="mb-6 flex h-[200px] items-end justify-center rounded-xl bg-[#f5f5f5] px-5 py-3">
        <CharacterSprite
          character={selectedChar}
          displayHeight={CARD_DISPLAY_HEIGHT}
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
      <div className="flex flex-wrap justify-center gap-2">
        {TYPING_CHARACTERS.map((char) => (
          <button
            key={char.id}
            type="button"
            onClick={() => onCharacterChange(char.id)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
              profile.characterId === char.id
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] text-[#555] hover:border-[#aaa]"
            }`}
          >
            {char.label[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
