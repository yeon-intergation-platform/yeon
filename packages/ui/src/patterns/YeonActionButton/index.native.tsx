import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors, yeonMobileAppSpacing } from "../../theme";

export type YeonActionButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dark";

export type YeonActionButtonProps = {
  disabled?: boolean;
  label: string;
  labelStyle?: YeonButtonProps["textStyle"];
  leftSlot?: ReactNode;
  onPress: NonNullable<YeonButtonProps["onPress"]>;
  style?: YeonButtonProps["style"];
  variant?: YeonActionButtonVariant;
};

const palettes = {
  primary: {
    backgroundColor: yeonMobileAppColors.accent,
    borderColor: yeonMobileAppColors.accent,
    labelColor: yeonMobileAppColors.white,
  },
  secondary: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.borderStrong,
    labelColor: yeonMobileAppColors.text,
  },
  danger: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.borderStrong,
    labelColor: yeonMobileAppColors.danger,
  },
  dark: {
    backgroundColor: yeonMobileAppColors.black,
    borderColor: yeonMobileAppColors.black,
    labelColor: yeonMobileAppColors.white,
  },
} as const;

export function YeonActionButton({
  disabled = false,
  label,
  labelStyle,
  leftSlot,
  onPress,
  style,
  variant = "primary",
}: YeonActionButtonProps) {
  const palette = palettes[variant];

  return (
    <YeonButton
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size="lg"
      variant={variant === "dark" ? "primary" : variant}
      style={[
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}
      textStyle={[styles.label, { color: palette.labelColor }, labelStyle]}
    >
      {leftSlot ? (
        <YeonView style={styles.leftSlot}>{leftSlot}</YeonView>
      ) : null}
      {label}
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  button: {
    borderRadius: 18,
    gap: yeonMobileAppSpacing.inlineGap,
    minHeight: 48,
    paddingHorizontal: yeonMobileAppSpacing.buttonHorizontal,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
  },
  leftSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
});
