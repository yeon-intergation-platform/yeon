import { yeonColors } from "@yeon/design-tokens";
import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable, Text } from "react-native";

import { getYeonCheckboxNativeStyle } from "./variants";

export { getYeonCheckboxNativeStyle } from "./variants";

export type YeonCheckboxProps = Omit<PressableProps, "style"> & {
  checked?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function YeonCheckbox({
  checked = false,
  children,
  style,
  ...props
}: YeonCheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[getYeonCheckboxNativeStyle(checked), style]}
      {...props}
    >
      {checked ? (
        <Text style={{ color: yeonColors.white, fontSize: 10 }}>✓</Text>
      ) : null}
      {children}
    </Pressable>
  );
}
