"use client";

import type { CardRoomParticipantDto } from "@yeon/race-shared";

import { RoomParticipantCard } from "@/features/room-shared";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
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
    <div className={SHARED_FEATURE_CLASS.panelCard}>
      <h2 className="text-[14px] font-bold text-[#111]">실제 참가자</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {participants?.map((participant) => (
          <RoomParticipantCard
            key={participant.id}
            identityKey={participant.id}
            title={participant.nickname}
            subtitle={`${participant.isHost ? "방장 · " : ""}${CARD_ROOM_ROLE_LABELS[participant.role]} · ${participant.isReady ? "준비" : "대기"}`}
            characterId={participant.characterId}
            isCurrent={participant.id === participantId}
            frameOverrides={frameOverrides}
          />
        )) ?? <p className={SHARED_FEATURE_CLASS.text13Subtle}>입장 중...</p>}
      </div>
    </div>
  );
}
