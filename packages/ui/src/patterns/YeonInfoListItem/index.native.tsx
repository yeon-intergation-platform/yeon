import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonInfoListItemTone = "accent" | "neutral";

export type YeonInfoListItemProps = {
  meta?: ReactNode;
  style?: YeonViewProps["style"];
  subtitle?: ReactNode;
  title: ReactNode;
  titleTone?: YeonInfoListItemTone;
  trailingSlot?: ReactNode;
};

export function YeonInfoListItem({
  meta,
  style,
  subtitle,
  title,
  titleTone = "neutral",
  trailingSlot,
}: YeonInfoListItemProps) {
  return (
    <YeonView style={[styles.row, style]}>
      <YeonView style={styles.copy}>
        {meta ? (
          <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
            {meta}
          </YeonText>
        ) : null}
        <YeonText
          variant="unstyled"
          tone="inherit"
          style={[
            styles.title,
            titleTone === "accent" ? styles.titleAccent : null,
          ]}
        >
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText variant="unstyled" tone="inherit" style={styles.subtitle}>
            {subtitle}
          </YeonText>
        ) : null}
      </YeonView>
      {trailingSlot ? (
        <YeonView style={styles.trailing}>{trailingSlot}</YeonView>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  copy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  meta: {
    color: yeonMobileAppColors.neutral,
    fontSize: 12,
    fontWeight: "800",
  },
  row: {
    alignItems: "center",
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
  },
  titleAccent: {
    color: yeonMobileAppColors.accent,
    fontSize: 16,
    fontWeight: "800",
  },
  trailing: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
});
