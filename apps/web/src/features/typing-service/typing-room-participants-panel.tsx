"use client";

import { Crown } from "lucide-react";
import type { TypingRoomParticipantSnapshot } from "@yeon/race-shared";

import { RoomParticipantCard } from "@/features/room-shared";
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
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-2">
      <h2 className="mb-3 text-[14px] font-bold">참여자</h2>
      <div className="grid grid-cols-2 gap-3">
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
              subtitleClassName="text-[#888]"
              badges={
                participant ? (
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${participant.isReady ? "border border-[#d9ead3] bg-[#eef8ea] text-[#2f7d32]" : "border border-[#e5e5e5] bg-white text-[#999]"}`}
                    >
                      {participant.isReady ? "준비완료" : "대기중"}
                    </span>
                    {participant.role === "host" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b7791f]">
                        <Crown size={13} /> 방장
                      </span>
                    ) : null}
                  </div>
                ) : null
              }
              emptyLabel="빈자리"
            />
          );
        })}
      </div>
    </section>
  );
}
