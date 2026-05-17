"use client";

import Link from "next/link";
import {
  CARD_ROOM_ROLE,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import type {
  CardRoomParticipantDto,
  CardRoomRole,
  CardRoomRealtimeState,
} from "@yeon/race-shared";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import {
  CARD_ROOM_CONNECTION_STATE_LABELS,
  CARD_ROOM_ROLE_LABELS,
  CARD_ROOM_STATUS_LABELS,
} from "./card-room-labels";

type CardRoomHeaderProps = {
  roomId: string;
  state: CardRoomRealtimeState | null;
  connectionState: string;
  myParticipant?: CardRoomParticipantDto | null;
  canStart: boolean;
  onRoleChange: (role: CardRoomRole) => void;
  onReadyChange: (isReady: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onLeave: () => void;
};

export function CardRoomHeader({
  roomId,
  state,
  connectionState,
  myParticipant,
  canStart,
  onRoleChange,
  onReadyChange,
  onStart,
  onEnd,
  onLeave,
}: CardRoomHeaderProps) {
  const currentCardIndex = state
    ? Math.min(state.currentCardIndex + 1, state.cards.length)
    : 0;
  const myRole = myParticipant?.role ?? null;
  const currentRoleLabel = myRole ? CARD_ROOM_ROLE_LABELS[myRole] : "입장 중";
  const isWaiting = state?.status === CARD_ROOM_STATUS.WAITING;
  const isClosed = state?.status === CARD_ROOM_STATUS.CLOSED;

  return (
    <header className="rounded-3xl border border-[#e5e5e5] bg-white p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
            <span
              className={`rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 ${SHARED_FEATURE_CLASS.text12BoldNeutral}`}
            >
              #{roomId}
            </span>
            <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-3 py-1 text-[12px] font-bold text-[#2f7d32]">
              {state
                ? CARD_ROOM_STATUS_LABELS[state.status]
                : (CARD_ROOM_CONNECTION_STATE_LABELS[connectionState] ??
                  "연결 확인 중")}
            </span>
          </div>
          <h1 className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]">
            {state?.title ?? "카드방 입장 중"}
          </h1>
          <p className="mt-2 text-[14px] font-medium text-[#666]">
            {state
              ? `${state.deckTitle} · ${currentCardIndex} / ${state.cards.length} · 현재 역할 ${currentRoleLabel}`
              : "카드방 상태를 불러오는 중입니다."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {myRole ? (
            <div className="inline-flex rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
              {(
                [CARD_ROOM_ROLE.MEMORIZER, CARD_ROOM_ROLE.CHECKER] as const
              ).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onRoleChange(role)}
                  disabled={!isWaiting}
                  data-active={myRole === role}
                  className={`rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text12BoldNeutral} disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:bg-[#111] data-[active=true]:text-white`}
                >
                  {CARD_ROOM_ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          ) : null}
          {isWaiting && myParticipant ? (
            <button
              type="button"
              onClick={() => onReadyChange(!myParticipant.isReady)}
              className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-[13px] font-bold transition-colors ${
                myParticipant.isReady
                  ? "border border-[#111] bg-[#111] text-white"
                  : "border border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
              }`}
            >
              {myParticipant.isReady ? "준비 완료" : "준비하기"}
            </button>
          ) : null}
          {myParticipant?.isHost && isWaiting ? (
            <button
              type="button"
              disabled={!canStart}
              onClick={onStart}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#111] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#333] disabled:border disabled:border-[#e5e5e5] disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
            >
              학습 시작
            </button>
          ) : null}
          {myParticipant?.isHost && state && !isClosed ? (
            <button
              type="button"
              onClick={onEnd}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e5e5e5] px-4 text-[13px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
            >
              방 종료
            </button>
          ) : null}
          <Link
            href="/card-service/rooms"
            onClick={onLeave}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e5e5e5] px-4 text-[13px] font-bold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
          >
            방 나가기
          </Link>
        </div>
      </div>
    </header>
  );
}
