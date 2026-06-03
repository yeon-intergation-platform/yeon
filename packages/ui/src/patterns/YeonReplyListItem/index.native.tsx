import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";
import { YeonAvatarCircle } from "../YeonAvatarCircle/index.native";

export type YeonReplyListItemProps = {
  body: ReactNode;
  imageUrl?: string | null;
  label: string;
  meta: ReactNode;
  style?: YeonViewProps["style"];
};

export function YeonReplyListItem({
  body,
  imageUrl,
  label,
  meta,
  style,
}: YeonReplyListItemProps) {
  return (
    <YeonView style={[styles.item, style]}>
      <YeonView style={styles.authorRow}>
        <YeonAvatarCircle imageUrl={imageUrl} label={label} size={34} />
        <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
          {meta}
        </YeonText>
      </YeonView>
      <YeonText variant="unstyled" tone="inherit" style={styles.body}>
        {body}
      </YeonText>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  body: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  item: {
    backgroundColor: yeonMobileAppColors.backgroundMuted,
    borderRadius: 18,
    gap: 8,
    padding: 12,
  },
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
});
