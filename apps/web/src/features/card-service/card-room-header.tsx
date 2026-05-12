"use client";

import Link from "next/link";
import { CARD_ROOM_ROLE } from "@yeon/api-contract/card-rooms";
import type { CardRoomRole, CardRoomRealtimeState } from "@yeon/race-shared";

import {
  CARD_ROOM_ROLE_LABELS,
  CARD_ROOM_STATUS_LABELS,
} from "./card-room-labels";

type CardRoomHeaderProps = {
  roomId: string;
  state: CardRoomRealtimeState | null;
  connectionState: string;
  myRole?: CardRoomRole | null;
  onRoleChange: (role: CardRoomRole) => void;
};

export function CardRoomHeader({
  roomId,
  state,
  connectionState,
  myRole,
  onRoleChange,
}: CardRoomHeaderProps) {
  const currentCardIndex = state
    ? Math.min(state.currentCardIndex + 1, state.cards.length)
    : 0;
  const currentRoleLabel = myRole ? CARD_ROOM_ROLE_LABELS[myRole] : "입장 중";

  return (
    <header className="rounded-3xl border border-[#e5e5e5] bg-white p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[12px] font-bold text-[#666]">
              #{roomId}
            </span>
            <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-3 py-1 text-[12px] font-bold text-[#2f7d32]">
              {state ? CARD_ROOM_STATUS_LABELS[state.status] : connectionState}
            </span>
          </div>
          <h1 className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]">
            {state?.title ?? "카드방 입장 중"}
          </h1>
          <p className="mt-2 text-[14px] font-medium text-[#666]">
            {state
              ? `${state.deckTitle} · ${currentCardIndex} / ${state.cards.length} · 현재 역할 ${currentRoleLabel}`
              : "Spring 카드방 상태를 불러오는 중입니다."}
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
                  data-active={myRole === role}
                  className="rounded-lg px-3 py-2 text-[12px] font-bold text-[#666] data-[active=true]:bg-[#111] data-[active=true]:text-white"
                >
                  {CARD_ROOM_ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          ) : null}
          <Link
            href="/card-service/rooms"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e5e5e5] px-4 text-[13px] font-bold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
          >
            로비로
          </Link>
        </div>
      </div>
    </header>
  );
}
