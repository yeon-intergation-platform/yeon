import { forwardRef } from "react";
import type { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native";

export type YeonScrollViewHandle = ScrollView;
export type YeonScrollViewProps = ScrollViewProps;

export const YeonScrollView = forwardRef<
  YeonScrollViewHandle,
  YeonScrollViewProps
>(function YeonScrollView(props, ref) {
  return <ScrollView ref={ref} {...props} />;
});
