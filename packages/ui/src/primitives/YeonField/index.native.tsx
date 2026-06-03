import { yeonColors } from "@yeon/design-tokens";
import type { StyleProp, TextInputProps, TextStyle } from "react-native";
import { TextInput } from "react-native";

import { getYeonFieldNativeStyle } from "./variants";

export { getYeonFieldNativeStyle } from "./variants";

export type YeonFieldProps = Omit<TextInputProps, "style"> & {
  style?: StyleProp<TextStyle>;
};

export function YeonField({
  style,
  placeholderTextColor,
  ...props
}: YeonFieldProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? yeonColors.neutral[400]}
      style={[getYeonFieldNativeStyle(), style]}
      {...props}
    />
  );
}
