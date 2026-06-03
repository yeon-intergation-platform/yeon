import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import {
  YeonText,
  type YeonTextProps,
} from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonMobileHeaderBarProps = {
  leftAccessibilityLabel?: string;
  leftLabel?: ReactNode;
  onLeftPress?: YeonButtonProps["onPress"];
  onRightPress?: YeonButtonProps["onPress"];
  rightAccessibilityLabel?: string;
  rightLabel?: ReactNode;
  subtitle?: string;
  style?: YeonViewProps["style"];
  subtitleStyle?: YeonTextProps["style"];
  title: string;
  titleStyle?: YeonTextProps["style"];
};

export function YeonMobileHeaderBar({
  leftAccessibilityLabel,
  leftLabel,
  onLeftPress,
  onRightPress,
  rightAccessibilityLabel,
  rightLabel,
  subtitle,
  style,
  subtitleStyle,
  title,
  titleStyle,
}: YeonMobileHeaderBarProps) {
  return (
    <YeonView style={[styles.header, style]}>
      <HeaderButton
        accessibilityLabel={leftAccessibilityLabel}
        label={leftLabel}
        onPress={onLeftPress}
      />
      <YeonView style={styles.titleBox}>
        <YeonText
          variant="unstyled"
          tone="inherit"
          numberOfLines={1}
          style={[styles.title, titleStyle]}
        >
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={[styles.subtitle, subtitleStyle]}
          >
            {subtitle}
          </YeonText>
        ) : null}
      </YeonView>
      <HeaderButton
        accessibilityLabel={rightAccessibilityLabel}
        label={rightLabel}
        onPress={onRightPress}
      />
    </YeonView>
  );
}

function HeaderButton({
  accessibilityLabel,
  label,
  onPress,
}: {
  accessibilityLabel?: string;
  label?: ReactNode;
  onPress?: YeonButtonProps["onPress"];
}) {
  if (!label) {
    return <YeonView style={styles.actionPlaceholder} />;
  }

  return (
    <YeonButton
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      size="icon"
      variant="icon"
      style={styles.action}
    >
      {typeof label === "string" || typeof label === "number" ? (
        <YeonText variant="unstyled" tone="inherit" style={styles.actionText}>
          {label}
        </YeonText>
      ) : (
        label
      )}
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  action: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  actionPlaceholder: {
    height: 44,
    width: 44,
  },
  actionText: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 28,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    textAlign: "center",
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 28,
    textAlign: "center",
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
});
