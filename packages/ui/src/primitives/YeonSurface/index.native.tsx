import type { ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { View } from "react-native";

import type { YeonSurfaceVariant } from "./types";
import { getYeonSurfaceNativeStyle } from "./variants";

export type { YeonSurfaceVariant } from "./types";
export { getYeonSurfaceNativeStyle } from "./variants";

export type YeonSurfaceProps = Omit<ViewProps, "style"> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: YeonSurfaceVariant;
};

export function YeonSurface({
  variant = "card",
  style,
  ...props
}: YeonSurfaceProps) {
  return (
    <View style={[getYeonSurfaceNativeStyle(variant), style]} {...props} />
  );
}
