"use client";
import {
  TYPING_ROOM_GAME_TYPE,
  type TypingRoomGameType,
  type TypingRoomSnapshot,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import { YeonButton, YeonIcon, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import type { TypingUiText } from "./typing-service-i18n";

type TypingRoomWaitingHeaderRoomProps = {
  room: TypingRoomSnapshot;
  roomSummary: string;
  waitingStateLabel: string;
  territoryHref: string;
  labels: TypingUiText["room"];
  gameTypeLabels: Record<TypingRoomGameType, string>;
  visibilityLabels: Record<TypingRoomVisibility, string>;
};

type TypingRoomWaitingHeaderStatusProps = {
  copyError: string | null;
  copied: boolean;
  isHost: boolean;
  isReady: boolean;
  isLeavingRoom: boolean;
  roomError: string | null;
};

type TypingRoomWaitingHeaderActions = {
  onLeaveRoom: () => void;
  onCopyInvite: () => void;
  onStart: () => void;
  onToggleReady: () => void;
};

type TypingRoomWaitingHeaderProps = TypingRoomWaitingHeaderRoomProps &
  TypingRoomWaitingHeaderStatusProps &
  TypingRoomWaitingHeaderActions;

export function TypingRoomWaitingHeader({
  room,
  roomSummary,
  waitingStateLabel,
  labels,
  gameTypeLabels,
  visibilityLabels,
  copyError,
  copied,
  isHost,
  isReady,
  isLeavingRoom,
  roomError,
  territoryHref,
  onLeaveRoom,
  onCopyInvite,
  onStart,
  onToggleReady,
}: TypingRoomWaitingHeaderProps) {
  const isTerritoryRoom = room.gameType === TYPING_ROOM_GAME_TYPE.TERRITORY;

  return (
    <>
      {copyError && (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="mx-4 mt-2 rounded-md border border-[#e5e5e5] bg-[#fafafa] p-2 font-semibold md:mx-8"
        >
          {copyError}
        </YeonText>
      )}

      <YeonButton
        type="button"
        onClick={onLeaveRoom}
        disabled={isLeavingRoom}
        variant="ghost"
        size="sm"
        className={`w-fit gap-2 ${SHARED_FEATURE_CLASS.text13EmphasisMuted} no-underline`}
      >
        <YeonIcon name="arrow-left" size={15} />
        {isLeavingRoom ? `${labels.leaving}...` : labels.leaveRoomLong}
      </YeonButton>

      <YeonView
        as="header"
        className="rounded-2xl border border-[#e5e5e5] bg-white p-3 md:p-4"
      >
        <YeonView className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
          <YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="text-[22px] font-semibold tracking-[-0.03em] md:text-[26px]"
            >
              {room.title}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[12px] text-[#666]"
            >
              {room.roomCode}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-2 ${SHARED_FEATURE_CLASS.text12EmphasisNeutral}`}
            >
              {waitingStateLabel} · {gameTypeLabels[room.gameType]} ·{" "}
              {visibilityLabels[room.visibility]} · {room.currentParticipants}/
              {room.maxParticipants}
            </YeonText>
          </YeonView>
          <YeonView className="flex h-full flex-col items-start justify-end gap-3 lg:items-end lg:text-right">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12EmphasisNeutral}
            >
              {labels.currentParticipants} {room.currentParticipants} /{" "}
              {room.maxParticipants}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="max-w-[420px] text-[12px] leading-5 text-[#666]"
            >
              {roomSummary}
            </YeonText>

            {roomError && (
              <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[12px] font-semibold text-[#111]">
                {roomError}
              </YeonView>
            )}

            <YeonView className="flex flex-wrap gap-2 lg:justify-end">
              <YeonButton
                type="button"
                onClick={onCopyInvite}
                variant="secondary"
                size="sm"
                className={`rounded-xl px-3 py-2 ${SHARED_FEATURE_CLASS.text12Emphasis}`}
              >
                {copied ? labels.inviteCopied : labels.invite}
              </YeonButton>
              {isTerritoryRoom ? (
                <YeonButton
                  as="a"
                  href={territoryHref}
                  variant="primary"
                  size="md"
                  className="gap-2 rounded-xl px-4 py-2 text-[13px]"
                >
                  <YeonIcon name="swords" size={14} />
                  {labels.enterTerritory}
                </YeonButton>
              ) : isHost ? (
                <YeonButton
                  type="button"
                  onClick={onStart}
                  disabled={!room.canStart}
                  variant="primary"
                  size="md"
                  className="gap-2"
                >
                  <YeonIcon name="play" size={14} />
                  {labels.start}
                </YeonButton>
              ) : (
                <YeonButton
                  type="button"
                  onClick={onToggleReady}
                  variant={isReady ? "secondary" : "primary"}
                  size="md"
                  className="rounded-xl px-4 py-2 text-[13px]"
                >
                  {isReady ? labels.cancelReadyShort : labels.ready}
                </YeonButton>
              )}
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonView>
    </>
  );
}
