import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { View } from "react-native";

export type YeonFormProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function YeonForm({ style, ...props }: YeonFormProps) {
  return <View style={style} {...props} />;
}
