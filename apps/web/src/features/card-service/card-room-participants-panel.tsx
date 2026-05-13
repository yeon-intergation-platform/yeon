"use client";

import type { CardRoomParticipantDto } from "@yeon/race-shared";

import { RoomParticipantCard } from "@/features/room-shared";
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
        {participants?.map((participant) => (
          <RoomParticipantCard
            key={participant.id}
            identityKey={participant.id}
            title={participant.nickname}
            subtitle={CARD_ROOM_ROLE_LABELS[participant.role]}
            characterId={participant.characterId}
            isCurrent={participant.id === participantId}
            frameOverrides={frameOverrides}
          />
        )) ?? <p className="text-[13px] text-[#777]">입장 중...</p>}
      </div>
    </div>
  );
}
