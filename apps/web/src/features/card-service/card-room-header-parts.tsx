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
import { canEndCardRoom, isCardRoomWaiting } from "@yeon/race-shared";
import {
  getYeonButtonClassName,
  YeonBadge,
  YeonButton,
  YeonLink,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  CARD_ROOM_CONNECTION_STATE_LABELS,
  CARD_ROOM_ROLE_LABELS,
  CARD_ROOM_STATUS_LABELS,
} from "./card-room-labels";

// 클라이언트가 명시 선택할 수 있는 역할만(미배정 UNASSIGNED은 서버 측 개념). sendRole과 정합.
export type AssignableCardRoomRole = "MEMORIZER" | "CHECKER";

type CardRoomHeaderSummary = {
  currentCardIndex: number;
  currentRoleLabel: string;
  myRole: CardRoomParticipantDto["role"] | null;
  statusLabel: string;
  title: string;
  subtitle: string;
  isWaiting: boolean;
  isClosed: boolean;
  canEndRoom: boolean;
};

export function deriveCardRoomHeaderSummary(
  state: CardRoomRealtimeState | null,
  connectionState: string,
  myParticipant?: CardRoomParticipantDto | null
): CardRoomHeaderSummary {
  const currentCardIndex = state
    ? Math.min(state.currentCardIndex + 1, state.cards.length)
    : 0;
  const myRole = myParticipant?.role ?? null;
  const currentRoleLabel = myRole ? CARD_ROOM_ROLE_LABELS[myRole] : "입장 중";
  const statusLabel = state
    ? CARD_ROOM_STATUS_LABELS[state.status]
    : (CARD_ROOM_CONNECTION_STATE_LABELS[connectionState] ?? "연결 확인 중");
  const title = state?.title ?? "카드방 입장 중";
  const subtitle = state
    ? `${state.deckTitle} · ${currentCardIndex} / ${state.cards.length} · 현재 역할 ${currentRoleLabel}`
    : "카드방 상태를 불러오는 중입니다.";

  return {
    currentCardIndex,
    currentRoleLabel,
    myRole,
    statusLabel,
    title,
    subtitle,
    isWaiting: isCardRoomWaiting(state),
    isClosed: state?.status === CARD_ROOM_STATUS.CLOSED,
    canEndRoom: canEndCardRoom(state),
  };
}

type CardRoomHeaderTitleProps = {
  roomId: string;
  summary: CardRoomHeaderSummary;
};

export function CardRoomHeaderTitle({
  roomId,
  summary,
}: CardRoomHeaderTitleProps) {
  return (
    <YeonView>
      <YeonView className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
        <YeonBadge
          variant="neutral"
          className={SHARED_FEATURE_CLASS.text12BoldNeutral}
        >
          #{roomId}
        </YeonBadge>
        <YeonBadge variant="neutral" className="text-[12px] font-bold">
          {summary.statusLabel}
        </YeonBadge>
      </YeonView>
      <YeonText
        as="h1"
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]"
      >
        {summary.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-2 text-[14px] font-medium text-[#666]"
      >
        {summary.subtitle}
      </YeonText>
    </YeonView>
  );
}

type CardRoomHeaderActionsProps = {
  summary: CardRoomHeaderSummary;
  myParticipant?: CardRoomParticipantDto | null;
  canStart: boolean;
  onRoleChange: (role: AssignableCardRoomRole) => void;
  onReadyChange: (isReady: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onLeave: () => void;
};

export function CardRoomHeaderActions({
  summary,
  myParticipant,
  canStart,
  onRoleChange,
  onReadyChange,
  onStart,
  onEnd,
  onLeave,
}: CardRoomHeaderActionsProps) {
  return (
    <YeonView className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <CardRoomRoleToggle
        role={summary.myRole}
        isWaiting={summary.isWaiting}
        onRoleChange={onRoleChange}
      />
      <CardRoomReadyButton
        isWaiting={summary.isWaiting}
        myParticipant={myParticipant}
        onReadyChange={onReadyChange}
      />
      <CardRoomStartButton
        canStart={canStart}
        isWaiting={summary.isWaiting}
        myParticipant={myParticipant}
        onStart={onStart}
      />
      <CardRoomEndButton
        canEndRoom={summary.canEndRoom}
        myParticipant={myParticipant}
        onEnd={onEnd}
      />
      <CardRoomLeaveLink onLeave={onLeave} />
    </YeonView>
  );
}

type CardRoomRoleToggleProps = {
  role: CardRoomParticipantDto["role"] | null;
  isWaiting: boolean;
  onRoleChange: (role: AssignableCardRoomRole) => void;
};

function CardRoomRoleToggle({
  role,
  isWaiting,
  onRoleChange,
}: CardRoomRoleToggleProps) {
  if (!role) {
    return null;
  }

  return (
    <YeonView className="inline-flex rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
      {[CARD_ROOM_ROLE.MEMORIZER, CARD_ROOM_ROLE.CHECKER].map((option) => (
        <YeonButton
          key={option}
          type="button"
          onClick={() => onRoleChange(option)}
          disabled={!isWaiting}
          variant={role === option ? "primary" : "ghost"}
          size="sm"
          className={`rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text12BoldNeutral}`}
        >
          {CARD_ROOM_ROLE_LABELS[option]}
        </YeonButton>
      ))}
    </YeonView>
  );
}

type CardRoomReadyButtonProps = {
  isWaiting: boolean;
  myParticipant?: CardRoomParticipantDto | null;
  onReadyChange: (isReady: boolean) => void;
};

function CardRoomReadyButton({
  isWaiting,
  myParticipant,
  onReadyChange,
}: CardRoomReadyButtonProps) {
  if (!isWaiting || !myParticipant) {
    return null;
  }

  return (
    <YeonButton
      type="button"
      onClick={() => onReadyChange(!myParticipant.isReady)}
      variant={myParticipant.isReady ? "primary" : "secondary"}
      size="md"
    >
      {myParticipant.isReady ? "준비 완료" : "준비하기"}
    </YeonButton>
  );
}

type CardRoomStartButtonProps = {
  canStart: boolean;
  isWaiting: boolean;
  myParticipant?: CardRoomParticipantDto | null;
  onStart: () => void;
};

function CardRoomStartButton({
  canStart,
  isWaiting,
  myParticipant,
  onStart,
}: CardRoomStartButtonProps) {
  if (!myParticipant?.isHost || !isWaiting) {
    return null;
  }

  return (
    <YeonButton
      type="button"
      disabled={!canStart}
      onClick={onStart}
      variant="primary"
      size="md"
    >
      학습 시작
    </YeonButton>
  );
}

type CardRoomEndButtonProps = {
  canEndRoom: boolean;
  myParticipant?: CardRoomParticipantDto | null;
  onEnd: () => void;
};

function CardRoomEndButton({
  canEndRoom,
  myParticipant,
  onEnd,
}: CardRoomEndButtonProps) {
  if (!myParticipant?.isHost || !canEndRoom) {
    return null;
  }

  return (
    <YeonButton type="button" onClick={onEnd} variant="danger" size="md">
      방 종료
    </YeonButton>
  );
}

type CardRoomLeaveLinkProps = {
  onLeave: () => void;
};

function CardRoomLeaveLink({ onLeave }: CardRoomLeaveLinkProps) {
  return (
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
  );
}
