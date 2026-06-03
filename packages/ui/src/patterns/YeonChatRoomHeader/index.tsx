import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";

export type YeonChatRoomHeaderProps = {
  actionsSlot?: ReactNode;
  topBar: ReactNode;
};

export function YeonChatRoomHeader({
  actionsSlot,
  topBar,
}: YeonChatRoomHeaderProps) {
  return (
    <YeonView className="px-[18px] pt-[18px]">
      {topBar}
      {actionsSlot ? (
        <YeonView className="mt-3.5 flex gap-2.5">{actionsSlot}</YeonView>
      ) : null}
    </YeonView>
  );
}
