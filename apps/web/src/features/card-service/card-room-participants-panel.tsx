"use client";
import type { CardRoomParticipantDto } from "@yeon/race-shared";
import { RoomParticipantCard } from "@/features/room-shared";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_ROOM_ROLE_LABELS } from "./card-room-labels";
import { YeonText, YeonView } from "@yeon/ui";

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
    <YeonView className={SHARED_FEATURE_CLASS.panelCard}>
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[14px] font-bold text-[#111]"
      >
        실제 참가자
      </YeonText>
      <YeonView className="mt-4 grid grid-cols-2 gap-3">
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
        )) ?? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Subtle}
          >
            입장 중...
          </YeonText>
        )}
      </YeonView>
    </YeonView>
  );
}
