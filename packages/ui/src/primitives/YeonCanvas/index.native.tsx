import { forwardRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

export type YeonCanvasHandle = View;
export type YeonCanvasProps = {
  style?: StyleProp<ViewStyle>;
};

export const YeonCanvas = forwardRef<YeonCanvasHandle, YeonCanvasProps>(
  function YeonCanvas({ style }, ref) {
    return <View ref={ref} style={style} />;
  }
);
