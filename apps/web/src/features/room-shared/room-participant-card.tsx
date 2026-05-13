"use client";

import type { ReactNode } from "react";

import { joinClassNames } from "@/components/yeon-ui";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";

type RoomParticipantCardProps = {
  identityKey: string;
  title?: string;
  subtitle?: string;
  characterId?: string | null;
  isCurrent?: boolean;
  frameOverrides: Record<string, number[]>;
  badges?: ReactNode;
  emptyLabel?: string;
  className?: string;
  spriteBoxClassName?: string;
  spriteMaxHeight?: number;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function RoomParticipantCard({
  identityKey,
  title,
  subtitle,
  characterId,
  isCurrent = false,
  frameOverrides,
  badges,
  emptyLabel = "빈자리",
  className,
  spriteBoxClassName = "mx-auto flex h-[92px] items-end justify-center overflow-hidden rounded-xl bg-white",
  spriteMaxHeight = 86,
  titleClassName = "text-[13px] font-bold",
  subtitleClassName = "text-[#777]",
}: RoomParticipantCardProps) {
  const hasParticipant = Boolean(title || characterId);
  const character = hasParticipant ? findCharacter(characterId) : null;

  return (
    <div
      key={identityKey}
      className={joinClassNames(
        "rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-center data-[me=true]:border-[#111]",
        className
      )}
      data-me={isCurrent}
    >
      {character ? (
        <div className="flex h-full flex-col justify-between gap-2">
          {badges ? <div>{badges}</div> : null}
          <div className={spriteBoxClassName}>
            <CharacterSprite
              character={character}
              maxHeight={spriteMaxHeight}
              sequenceOverride={frameOverrides[character.id]}
            />
          </div>
          <div className="min-w-0">
            {title ? (
              <p className={joinClassNames("truncate", titleClassName)}>
                {title}
              </p>
            ) : null}
            {subtitle ? (
              <p
                className={joinClassNames(
                  "mt-0.5 text-[11px]",
                  subtitleClassName
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#ddd] bg-white text-[13px] font-semibold text-[#aaa]">
          {emptyLabel}
        </div>
      )}
    </div>
  );
}
