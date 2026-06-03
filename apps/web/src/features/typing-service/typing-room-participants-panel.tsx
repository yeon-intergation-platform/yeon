"use client";
import type { TypingRoomParticipantSnapshot } from "@yeon/race-shared";
import { YeonIcon, YeonView, YeonText } from "@yeon/ui";
import { RoomParticipantCard } from "@/features/room-shared";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { findCharacter } from "./characters";

type TypingRoomParticipantsPanelProps = {
  participants: readonly (TypingRoomParticipantSnapshot | null)[];
  myParticipantId: string | null;
  locale: "ko" | "en";
  frameOverrides: Record<string, number[]>;
};

export function TypingRoomParticipantsPanel({
  participants,
  myParticipantId,
  locale,
  frameOverrides,
}: TypingRoomParticipantsPanelProps) {
  return (
    <YeonView
      as="section"
      className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-2"
    >
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className={TYPING_SERVICE_COMMON_CLASS.panelSubheading}
      >
        참여자
      </YeonText>
      <YeonView className="grid grid-cols-2 gap-3">
        {participants.map((participant, index) => {
          const character = participant
            ? findCharacter(participant.characterId)
            : null;

          return (
            <RoomParticipantCard
              key={participant?.id ?? `empty-${index}`}
              identityKey={participant?.id ?? `empty-${index}`}
              title={
                participant
                  ? `${participant.label}${participant.id === myParticipantId ? " (나)" : ""}`
                  : undefined
              }
              subtitle={character ? character.label[locale] : undefined}
              characterId={participant?.characterId}
              isCurrent={participant?.id === myParticipantId}
              frameOverrides={frameOverrides}
              className="min-h-[148px] p-2.5"
              spriteBoxClassName="flex h-[72px] items-end justify-center overflow-hidden rounded-xl bg-white px-2 py-1"
              spriteMaxHeight={68}
              titleClassName="text-[14px] font-semibold"
              subtitleClassName="text-[#aaa]"
              badges={
                participant ? (
                  <YeonView className="flex items-center justify-between gap-2">
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${participant.isReady ? "border border-[#111] bg-[#fafafa] text-[#111]" : "border border-[#e5e5e5] bg-white text-[#aaa]"}`}
                    >
                      {participant.isReady ? "준비완료" : "대기중"}
                    </YeonText>
                    {participant.role === "host" ? (
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#666]"
                      >
                        <YeonIcon name="crown" size={13} /> 방장
                      </YeonText>
                    ) : null}
                  </YeonView>
                ) : null
              }
              emptyLabel="빈자리"
            />
          );
        })}
      </YeonView>
    </YeonView>
  );
}
