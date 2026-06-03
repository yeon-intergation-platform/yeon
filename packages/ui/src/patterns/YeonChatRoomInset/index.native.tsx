import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonChatRoomInsetProps = {
  children: ReactNode;
};

export function YeonChatRoomInset({ children }: YeonChatRoomInsetProps) {
  return <YeonView style={styles.body}>{children}</YeonView>;
}

const styles = createYeonStyleSheet({
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
});
