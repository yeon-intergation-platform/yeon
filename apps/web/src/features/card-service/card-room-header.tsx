"use client";

import type {
  CardRoomParticipantDto,
  CardRoomRealtimeState,
} from "@yeon/race-shared";
import { YeonSurface, YeonView } from "@yeon/ui";
import {
  CardRoomHeaderActions,
  CardRoomHeaderTitle,
  deriveCardRoomHeaderSummary,
  type AssignableCardRoomRole,
} from "./card-room-header-parts";

type CardRoomHeaderIdentityProps = {
  roomId: string;
};

type CardRoomHeaderStateProps = {
  state: CardRoomRealtimeState | null;
  connectionState: string;
  myParticipant?: CardRoomParticipantDto | null;
  canStart: boolean;
};

type CardRoomHeaderActionProps = {
  onRoleChange: (role: AssignableCardRoomRole) => void;
  onReadyChange: (isReady: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onLeave: () => void;
};

type CardRoomHeaderProps = CardRoomHeaderIdentityProps &
  CardRoomHeaderStateProps &
  CardRoomHeaderActionProps;

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
  const summary = deriveCardRoomHeaderSummary(
    state,
    connectionState,
    myParticipant
  );

  return (
    <YeonSurface as="header" className="rounded-3xl p-4 md:p-5">
      <YeonView className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardRoomHeaderTitle roomId={roomId} summary={summary} />
        <CardRoomHeaderActions
          summary={summary}
          myParticipant={myParticipant}
          canStart={canStart}
          onRoleChange={onRoleChange}
          onReadyChange={onReadyChange}
          onStart={onStart}
          onEnd={onEnd}
          onLeave={onLeave}
        />
      </YeonView>
    </YeonSurface>
  );
}
