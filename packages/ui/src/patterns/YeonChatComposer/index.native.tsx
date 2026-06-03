import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonChatComposerProps = {
  children: ReactNode;
};

export function YeonChatComposer({ children }: YeonChatComposerProps) {
  return <YeonView style={styles.composer}>{children}</YeonView>;
}

const styles = createYeonStyleSheet({
  composer: {
    borderTopColor: yeonMobileAppColors.border,
    borderTopWidth: 1,
    gap: 12,
    padding: 18,
  },
});
