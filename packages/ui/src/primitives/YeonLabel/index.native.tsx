import type { StyleProp, TextProps, TextStyle } from "react-native";
import { Text } from "react-native";

import { yeonColors, yeonTypography } from "../../theme";

export type YeonLabelProps = TextProps & {
  style?: StyleProp<TextStyle>;
};

export function YeonLabel({ style, ...props }: YeonLabelProps) {
  return (
    <Text
      style={[
        {
          color: yeonColors.neutral[900],
          fontSize: yeonTypography.fontSize.sm,
          fontWeight: "700",
        },
        style,
      ]}
      {...props}
    />
  );
}
