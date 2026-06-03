import type { ReactNode } from "react";
import type { StyleProp, TextProps, TextStyle } from "react-native";
import { Text } from "react-native";

import type { YeonTextTone, YeonTextVariant } from "./types";
import { getYeonTextNativeStyle } from "./variants";

export type { YeonTextTone, YeonTextVariant } from "./types";
export { getYeonTextNativeStyle } from "./variants";

export type YeonTextProps = Omit<TextProps, "style"> & {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  tone?: YeonTextTone;
  variant?: YeonTextVariant;
};

export function YeonText({
  variant = "body",
  tone = "primary",
  style,
  ...props
}: YeonTextProps) {
  return (
    <Text
      style={[getYeonTextNativeStyle({ variant, tone }), style]}
      {...props}
    />
  );
}
