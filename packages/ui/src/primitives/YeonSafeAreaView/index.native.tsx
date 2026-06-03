import { forwardRef } from "react";
import type { ElementRef } from "react";
import type {
  SafeAreaProviderProps,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export type YeonSafeAreaViewHandle = ElementRef<typeof SafeAreaView>;
export type YeonSafeAreaViewProps = SafeAreaViewProps;
export type YeonSafeAreaProviderProps = SafeAreaProviderProps;

export function YeonSafeAreaProvider(props: YeonSafeAreaProviderProps) {
  return <SafeAreaProvider {...props} />;
}

export const YeonSafeAreaView = forwardRef<
  YeonSafeAreaViewHandle,
  YeonSafeAreaViewProps
>(function YeonSafeAreaView(props, ref) {
  return <SafeAreaView ref={ref} {...props} />;
});
