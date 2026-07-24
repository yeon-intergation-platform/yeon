import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { yeonColors, yeonRadius } from "../../theme";

export type YeonProgressBarProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  fillStyle?: StyleProp<ViewStyle>;
  value: number;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function YeonProgressBar({
  label,
  style,
  fillStyle,
  value,
}: YeonProgressBarProps) {
  const progress = clampProgress(value);

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={[
        {
          backgroundColor: yeonColors.neutral[100],
          borderRadius: yeonRadius.full,
          height: 8,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View
        style={[
          {
            backgroundColor: yeonColors.black,
            borderRadius: yeonRadius.full,
            height: "100%",
            width: `${progress}%`,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
