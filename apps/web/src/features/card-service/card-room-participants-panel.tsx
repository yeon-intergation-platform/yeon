"use client";

import type { CardRoomParticipantDto } from "@yeon/race-shared";

import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { CARD_ROOM_ROLE_LABELS } from "./card-room-labels";

type CardRoomParticipantsPanelProps = {
  participants: readonly CardRoomParticipantDto[] | null;
  participantId: string | null;
  frameOverrides: Record<string, number[]>;
};

export function CardRoomParticipantsPanel({
  participants,
  participantId,
  frameOverrides,
}: CardRoomParticipantsPanelProps) {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
      <h2 className="text-[14px] font-bold text-[#111]">실제 참가자</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {participants?.map((participant) => {
          const character = findCharacter(participant.characterId);
          return (
            <div
              key={participant.id}
              className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-center data-[me=true]:border-[#111]"
              data-me={participant.id === participantId}
            >
              <div className="mx-auto flex h-[92px] items-end justify-center overflow-hidden rounded-xl bg-white">
                <CharacterSprite
                  character={character}
                  maxHeight={86}
                  sequenceOverride={frameOverrides[character.id]}
                />
              </div>
              <p className="mt-2 truncate text-[13px] font-bold">
                {participant.nickname}
              </p>
              <p className="mt-0.5 text-[11px] text-[#777]">
                {CARD_ROOM_ROLE_LABELS[participant.role]}
              </p>
            </div>
          );
        }) ?? <p className="text-[13px] text-[#777]">입장 중...</p>}
      </div>
    </div>
  );
}
