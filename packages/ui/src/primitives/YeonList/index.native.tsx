import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { View } from "react-native";

export type YeonListProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export type YeonListItemProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function YeonList({ style, ...props }: YeonListProps) {
  return <View style={style} {...props} />;
}

export function YeonListItem({ style, ...props }: YeonListItemProps) {
  return <View style={style} {...props} />;
}
