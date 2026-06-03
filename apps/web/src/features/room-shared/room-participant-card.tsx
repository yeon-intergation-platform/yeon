"use client";
import type { ReactNode } from "react";
import { joinClassNames, YeonText, YeonView } from "@yeon/ui";
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
  subtitleClassName = "text-[#aaa]",
}: RoomParticipantCardProps) {
  const hasParticipant = Boolean(title || characterId);
  const character = hasParticipant ? findCharacter(characterId) : null;

  return (
    <YeonView
      key={identityKey}
      className={joinClassNames(
        "rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-center data-[me=true]:border-[#111]",
        className
      )}
      data-me={isCurrent}
    >
      {character ? (
        <YeonView className="flex h-full flex-col justify-between gap-2">
          {badges ? <YeonView>{badges}</YeonView> : null}
          <YeonView className={spriteBoxClassName}>
            <CharacterSprite
              character={character}
              maxHeight={spriteMaxHeight}
              sequenceOverride={frameOverrides[character.id]}
            />
          </YeonView>
          <YeonView className="min-w-0">
            {title ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={joinClassNames("truncate", titleClassName)}
              >
                {title}
              </YeonText>
            ) : null}
            {subtitle ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={joinClassNames(
                  "mt-0.5 text-[11px]",
                  subtitleClassName
                )}
              >
                {subtitle}
              </YeonText>
            ) : null}
          </YeonView>
        </YeonView>
      ) : (
        <YeonView className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white text-[13px] font-semibold text-[#aaa]">
          {emptyLabel}
        </YeonView>
      )}
    </YeonView>
  );
}
