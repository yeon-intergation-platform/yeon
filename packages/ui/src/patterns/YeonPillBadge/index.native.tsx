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

export type YeonPillBadgeTone = "accent" | "neutral";

export type YeonPillBadgeProps = {
  accessibilityLabel?: string;
  label: string | number;
  onPress?: YeonButtonProps["onPress"];
  style?: YeonViewProps["style"];
  tone?: YeonPillBadgeTone;
};

export function YeonPillBadge({
  accessibilityLabel,
  label,
  onPress,
  style,
  tone = "neutral",
}: YeonPillBadgeProps) {
  const content = (
    <YeonText
      variant="unstyled"
      tone="inherit"
      style={[styles.label, tone === "accent" ? styles.labelAccent : null]}
    >
      {label}
    </YeonText>
  );

  const containerStyle = [
    styles.badge,
    tone === "accent" ? styles.badgeAccent : styles.badgeNeutral,
    style,
  ];

  if (onPress) {
    return (
      <YeonButton
        accessibilityLabel={accessibilityLabel ?? String(label)}
        onPress={onPress}
        variant="ghost"
        style={containerStyle}
      >
        {content}
      </YeonButton>
    );
  }

  return <YeonView style={containerStyle}>{content}</YeonView>;
}

const styles = createYeonStyleSheet({
  badge: {
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeAccent: {
    backgroundColor: yeonMobileAppColors.accent,
  },
  badgeNeutral: {
    backgroundColor: yeonMobileAppColors.neutralSoft,
  },
  label: {
    color: yeonMobileAppColors.neutral,
    fontSize: 11,
    fontWeight: "800",
  },
  labelAccent: {
    color: yeonMobileAppColors.white,
    fontSize: 12,
  },
});
