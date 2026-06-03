import type { ActivityIndicatorProps } from "react-native";
import { ActivityIndicator } from "react-native";

export type YeonSpinnerProps = ActivityIndicatorProps;

export function YeonSpinner(props: YeonSpinnerProps) {
  return <ActivityIndicator {...props} />;
}
