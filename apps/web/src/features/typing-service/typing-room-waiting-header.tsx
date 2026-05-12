"use client";

import { ArrowLeft, Play } from "lucide-react";
import type { TypingRoomSnapshot } from "@yeon/race-shared";

import { TYPING_ROOM_VISIBILITY_LABELS } from "./typing-room-labels";

type TypingRoomWaitingHeaderProps = {
  room: TypingRoomSnapshot;
  roomSummary: string;
  waitingStateLabel: string;
  copyError: string | null;
  copied: boolean;
  isHost: boolean;
  isReady: boolean;
  isLeavingRoom: boolean;
  roomError: string | null;
  onLeaveRoom: () => void;
  onCopyInvite: () => void;
  onStart: () => void;
  onToggleReady: () => void;
};

export function TypingRoomWaitingHeader({
  room,
  roomSummary,
  waitingStateLabel,
  copyError,
  copied,
  isHost,
  isReady,
  isLeavingRoom,
  roomError,
  onLeaveRoom,
  onCopyInvite,
  onStart,
  onToggleReady,
}: TypingRoomWaitingHeaderProps) {
  return (
    <>
      {copyError && (
        <p className="mx-4 mt-2 rounded-md border border-red-100 bg-red-50 p-2 text-[12px] text-red-600 md:mx-8">
          {copyError}
        </p>
      )}

      <button
        type="button"
        onClick={onLeaveRoom}
        disabled={isLeavingRoom}
        className="inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
      >
        <ArrowLeft size={15} />
        {isLeavingRoom ? "나가는 중..." : "타자방 나가기"}
      </button>

      <header className="rounded-2xl border border-[#e5e5e5] bg-white p-3 md:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
          <div>
            <p className="text-[12px] font-semibold text-[#666]">
              {waitingStateLabel} ·{" "}
              {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]} ·{" "}
              {room.currentParticipants}/{room.maxParticipants}
            </p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] md:text-[26px]">
              {room.title}
            </h1>
            <p className="mt-1 text-[12px] text-[#666]">{room.roomCode}</p>
          </div>
          <div className="flex h-full flex-col items-start justify-end gap-3 lg:items-end lg:text-right">
            <p className="text-[12px] font-semibold text-[#666]">
              참여자 {room.currentParticipants} / {room.maxParticipants}
            </p>
            <p className="max-w-[420px] text-[12px] leading-5 text-[#666]">
              {roomSummary}
            </p>

            {roomError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[12px] text-red-600">
                {roomError}
              </div>
            )}

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={onCopyInvite}
                className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[12px] font-semibold text-[#111] transition-colors hover:border-[#111] hover:bg-[#fafafa]"
              >
                {copied ? "초대 링크 복사됨" : "초대"}
              </button>
              {isHost ? (
                <button
                  type="button"
                  onClick={onStart}
                  disabled={!room.canStart}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#f1f1f1] disabled:text-[#aaa]"
                >
                  <Play size={14} />
                  시작하기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleReady}
                  className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${
                    isReady
                      ? "border border-[#e5e5e5] bg-[#fafafa] text-[#666] hover:border-[#ddd]"
                      : "bg-[#111] text-white hover:bg-[#333]"
                  }`}
                >
                  {isReady ? "준비 취소" : "준비하기"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
