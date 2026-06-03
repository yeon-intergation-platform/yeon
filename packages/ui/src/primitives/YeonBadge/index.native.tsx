import type { ReactNode } from "react";
import type { StyleProp, TextProps, TextStyle } from "react-native";
import { Text } from "react-native";

import type { YeonBadgeVariant } from "./types";
import { getYeonBadgeNativeStyle } from "./variants";

export type { YeonBadgeVariant } from "./types";
export { getYeonBadgeNativeStyle } from "./variants";

export type YeonBadgeProps = Omit<TextProps, "style"> & {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: YeonBadgeVariant;
};

export function YeonBadge({
  variant = "neutral",
  style,
  ...props
}: YeonBadgeProps) {
  return <Text style={[getYeonBadgeNativeStyle(variant), style]} {...props} />;
}
