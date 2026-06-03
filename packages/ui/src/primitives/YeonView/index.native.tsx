import { forwardRef } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { View } from "react-native";

export type YeonViewProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export const YeonView = forwardRef<View, YeonViewProps>(function YeonView(
  { style, ...props },
  ref
) {
  return <View ref={ref} style={style} {...props} />;
});
