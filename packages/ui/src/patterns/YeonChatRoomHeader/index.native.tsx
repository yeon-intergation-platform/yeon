import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonChatRoomHeaderProps = {
  actionsSlot?: ReactNode;
  topBar: ReactNode;
};

export function YeonChatRoomHeader({
  actionsSlot,
  topBar,
}: YeonChatRoomHeaderProps) {
  return (
    <YeonView style={styles.header}>
      {topBar}
      {actionsSlot ? (
        <YeonView style={styles.actions}>{actionsSlot}</YeonView>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
});
