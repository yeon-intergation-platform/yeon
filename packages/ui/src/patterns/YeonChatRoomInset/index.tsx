import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";

export type YeonChatRoomInsetProps = {
  children: ReactNode;
};

export function YeonChatRoomInset({ children }: YeonChatRoomInsetProps) {
  return <YeonView className="px-[18px] pt-[18px]">{children}</YeonView>;
}
