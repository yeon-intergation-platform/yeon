import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonTopBarProps = {
  onRightPress?: () => void;
  rightLabel?: string;
  rightSlot?: ReactNode;
  subtitle?: string;
  title: string;
};

export function YeonTopBar({
  onRightPress,
  rightLabel,
  rightSlot,
  subtitle,
  title,
}: YeonTopBarProps) {
  return (
    <YeonView style={styles.row}>
      <YeonView style={styles.titleBlock}>
        <YeonText variant="title" style={styles.title}>
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText variant="body" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </YeonText>
        ) : null}
      </YeonView>
      {rightSlot ? (
        rightSlot
      ) : rightLabel && onRightPress ? (
        <YeonButton
          accessibilityLabel={rightLabel}
          accessibilityRole="button"
          onPress={onRightPress}
          size="sm"
          variant="pill"
          style={styles.action}
          textStyle={styles.actionLabel}
        >
          {rightLabel}
        </YeonButton>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleBlock: {
    gap: 6,
  },
  title: {
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionLabel: {
    color: yeonMobileAppColors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
});
