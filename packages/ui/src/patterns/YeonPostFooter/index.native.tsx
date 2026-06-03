import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonPostFooterProps = {
  actionLabel: ReactNode;
  label: ReactNode;
  onActionPress: YeonButtonProps["onPress"];
  style?: YeonViewProps["style"];
};

export function YeonPostFooter({
  actionLabel,
  label,
  onActionPress,
  style,
}: YeonPostFooterProps) {
  return (
    <YeonView style={[styles.footer, style]}>
      <YeonText variant="unstyled" tone="inherit" style={styles.label}>
        {label}
      </YeonText>
      <YeonButton
        onPress={onActionPress}
        size="sm"
        style={styles.linkButton}
        textStyle={styles.actionText}
        variant="ghost"
      >
        {actionLabel}
      </YeonButton>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  actionText: {
    color: yeonMobileAppColors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  label: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  linkButton: {
    borderWidth: 0,
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
