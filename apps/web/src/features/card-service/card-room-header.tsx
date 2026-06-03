"use client";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import {
  CARD_ROOM_ROLE,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import type {
  CardRoomParticipantDto,
  CardRoomRealtimeState,
} from "@yeon/race-shared";

// 클라이언트가 명시 선택할 수 있는 역할만(미배정 UNASSIGNED은 서버 측 개념). sendRole과 정합.
type AssignableCardRoomRole = "MEMORIZER" | "CHECKER";
import {
  getYeonButtonClassName,
  YeonBadge,
  YeonButton,
  YeonSurface,
  YeonText,
  YeonView,
  YeonLink,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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
  onRoleChange: (role: AssignableCardRoomRole) => void;
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
    <YeonSurface as="header" className="rounded-3xl p-4 md:p-5">
      <YeonView className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <YeonView>
          <YeonView className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
            <YeonBadge
              variant="neutral"
              className={SHARED_FEATURE_CLASS.text12BoldNeutral}
            >
              #{roomId}
            </YeonBadge>
            <YeonBadge variant="neutral" className="text-[12px] font-bold">
              {state
                ? CARD_ROOM_STATUS_LABELS[state.status]
                : (CARD_ROOM_CONNECTION_STATE_LABELS[connectionState] ??
                  "연결 확인 중")}
            </YeonBadge>
          </YeonView>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]"
          >
            {state?.title ?? "카드방 입장 중"}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[14px] font-medium text-[#666]"
          >
            {state
              ? `${state.deckTitle} · ${currentCardIndex} / ${state.cards.length} · 현재 역할 ${currentRoleLabel}`
              : "카드방 상태를 불러오는 중입니다."}
          </YeonText>
        </YeonView>
        <YeonView className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {myRole ? (
            <YeonView className="inline-flex rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
              {(
                [CARD_ROOM_ROLE.MEMORIZER, CARD_ROOM_ROLE.CHECKER] as const
              ).map((role) => (
                <YeonButton
                  key={role}
                  type="button"
                  onClick={() => onRoleChange(role)}
                  disabled={!isWaiting}
                  variant={myRole === role ? "primary" : "ghost"}
                  size="sm"
                  className={`rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text12BoldNeutral}`}
                >
                  {CARD_ROOM_ROLE_LABELS[role]}
                </YeonButton>
              ))}
            </YeonView>
          ) : null}
          {isWaiting && myParticipant ? (
            <YeonButton
              type="button"
              onClick={() => onReadyChange(!myParticipant.isReady)}
              variant={myParticipant.isReady ? "primary" : "secondary"}
              size="md"
            >
              {myParticipant.isReady ? "준비 완료" : "준비하기"}
            </YeonButton>
          ) : null}
          {myParticipant?.isHost && isWaiting ? (
            <YeonButton
              type="button"
              disabled={!canStart}
              onClick={onStart}
              variant="primary"
              size="md"
            >
              학습 시작
            </YeonButton>
          ) : null}
          {myParticipant?.isHost && state && !isClosed ? (
            <YeonButton
              type="button"
              onClick={onEnd}
              variant="danger"
              size="md"
            >
              방 종료
            </YeonButton>
          ) : null}
          <YeonLink
            href={resolveYeonWebPath("cardRoomList")}
            onClick={onLeave}
            className={getYeonButtonClassName({
              variant: "secondary",
              size: "md",
            })}
          >
            방 나가기
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonSurface>
  );
}
