import { forwardRef } from "react";
import type { KeyboardAvoidingViewProps } from "react-native";
import { KeyboardAvoidingView } from "react-native";

export type YeonKeyboardAvoidingViewHandle = KeyboardAvoidingView;
export type YeonKeyboardAvoidingViewProps = KeyboardAvoidingViewProps;

export const YeonKeyboardAvoidingView = forwardRef<
  YeonKeyboardAvoidingViewHandle,
  YeonKeyboardAvoidingViewProps
>(function YeonKeyboardAvoidingView(props, ref) {
  return <KeyboardAvoidingView ref={ref} {...props} />;
});
