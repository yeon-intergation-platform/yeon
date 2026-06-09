"use client";

import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonView } from "@yeon/ui";
import { CardRoomHeader } from "./card-room-header";
import {
  CardRoomScreenError,
  CardRoomScreenWorkspace,
} from "./card-room-screen-parts";
import { useCardRoomScreenState } from "./use-card-room-screen-state";

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const screen = useCardRoomScreenState(roomId);

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView as="main" className="px-4 py-5 md:px-8 md:py-6">
        <CardRoomHeader
          roomId={roomId}
          state={screen.state}
          connectionState={screen.room.connectionState}
          myParticipant={screen.myParticipant}
          canStart={screen.canStart}
          onRoleChange={screen.room.sendRole}
          onReadyChange={screen.room.sendReady}
          onStart={screen.room.sendStart}
          onEnd={screen.room.sendEnd}
          onLeave={screen.leaveRoom}
        />
        <CardRoomScreenError screen={screen} />
        <CardRoomScreenWorkspace screen={screen} />
      </YeonView>
    </YeonView>
  );
}
