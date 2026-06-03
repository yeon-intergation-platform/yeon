import { Children, type ReactNode } from "react";
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Pressable, Text } from "react-native";

import type { YeonButtonSize, YeonButtonVariant } from "./types";
import { getYeonButtonNativeStyle } from "./variants";

export type { YeonButtonSize, YeonButtonVariant } from "./types";
export { getYeonButtonNativeStyle } from "./variants";

export type YeonButtonProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  size?: YeonButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: YeonButtonVariant;
};

function renderButtonChild(
  child: ReactNode,
  textStyle: YeonButtonProps["textStyle"],
  baseTextStyle: ReturnType<typeof getYeonButtonNativeStyle>["text"]
) {
  return typeof child === "string" || typeof child === "number" ? (
    <Text style={[baseTextStyle, textStyle]}>{child}</Text>
  ) : (
    child
  );
}

export function YeonButton({
  variant = "secondary",
  size = "md",
  disabled,
  children,
  style,
  textStyle,
  ...props
}: YeonButtonProps) {
  const styles = getYeonButtonNativeStyle({
    variant,
    size,
    disabled: Boolean(disabled),
  });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={Boolean(disabled)}
      style={[styles.container, style]}
      {...props}
    >
      {Children.map(children, (child) =>
        renderButtonChild(child, textStyle, styles.text)
      )}
    </Pressable>
  );
}
