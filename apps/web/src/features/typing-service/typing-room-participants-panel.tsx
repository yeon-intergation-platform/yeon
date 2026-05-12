"use client";

import { Crown } from "lucide-react";
import type { TypingRoomParticipantSnapshot } from "@yeon/race-shared";

import { CharacterSprite } from "./character-sprite";
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
            <div
              key={participant?.id ?? `empty-${index}`}
              className="min-h-[148px] rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-2.5"
            >
              {participant && character ? (
                <div className="flex h-full flex-col justify-between gap-2">
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
                  <div className="flex h-[72px] items-end justify-center overflow-hidden rounded-xl bg-white px-2 py-1">
                    <CharacterSprite
                      character={character}
                      maxHeight={68}
                      sequenceOverride={frameOverrides[character.id]}
                    />
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="truncate text-[14px] font-semibold">
                      {participant.label}
                      {participant.id === myParticipantId ? " (나)" : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888]">
                      {character.label[locale]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#ddd] bg-white text-[13px] font-semibold text-[#aaa]">
                  빈자리
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
