import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import {
  YeonText,
  type YeonTextProps,
} from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonFloatingActionButtonProps = {
  accessibilityLabel: string;
  children?: ReactNode;
  disabled?: boolean;
  label?: string;
  labelStyle?: YeonTextProps["style"];
  onPress: NonNullable<YeonButtonProps["onPress"]>;
  style?: YeonButtonProps["style"];
};

export function YeonFloatingActionButton({
  accessibilityLabel,
  children,
  disabled = false,
  label,
  labelStyle,
  onPress,
  style,
}: YeonFloatingActionButtonProps) {
  return (
    <YeonButton
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      size="icon"
      variant="primary"
      style={[styles.button, style]}
    >
      {children ?? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          style={[styles.label, labelStyle]}
        >
          {label ?? "+"}
        </YeonText>
      )}
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  button: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.black,
    borderRadius: 32,
    bottom: 28,
    height: 64,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    width: 64,
  },
  label: {
    color: yeonMobileAppColors.white,
    fontSize: 38,
    fontWeight: "300",
    lineHeight: 42,
  },
});
