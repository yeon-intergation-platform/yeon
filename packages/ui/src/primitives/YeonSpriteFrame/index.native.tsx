import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

export type YeonSpriteFrameProps = {
  displayHeight: number;
  frameCols: number;
  frameCount: number;
  frameHeight: number;
  frameIndex: number;
  frameWidth: number;
  source: string;
  style?: StyleProp<ViewStyle>;
};

export function getYeonSpriteFrameMetrics({
  displayHeight,
  frameCols,
  frameCount,
  frameHeight,
  frameIndex,
  frameWidth,
}: Omit<YeonSpriteFrameProps, "source" | "style">) {
  const scale = displayHeight / frameHeight;
  const displayWidth = Math.round(frameWidth * scale);
  const sheetRows = Math.max(1, Math.ceil(frameCount / frameCols));
  const col = frameIndex % frameCols;
  const row = Math.floor(frameIndex / frameCols);

  return {
    col,
    displayHeight,
    displayWidth,
    row,
    sheetRows,
  };
}

export function YeonSpriteFrame(props: YeonSpriteFrameProps) {
  const { displayHeight, displayWidth } = getYeonSpriteFrameMetrics(props);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          flexShrink: 0,
          height: displayHeight,
          overflow: "hidden",
          width: displayWidth,
        },
        props.style,
      ]}
    />
  );
}
