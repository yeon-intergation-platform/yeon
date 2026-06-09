"use client";

import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonView } from "@yeon/ui";
import {
  CardRoomLobbyCreateDialog,
  CardRoomLobbyHero,
  CardRoomLobbyRoomSection,
} from "./card-room-lobby-parts";
import { useCardRoomLobbyState } from "./use-card-room-lobby-state";

export function CardRoomLobbyScreen() {
  const lobby = useCardRoomLobbyState();

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView as="main">
        <CardRoomLobbyHero lobby={lobby} />
        <CardRoomLobbyRoomSection lobby={lobby} />
      </YeonView>
      <CardRoomLobbyCreateDialog lobby={lobby} />
    </YeonView>
  );
}
