import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

export type YeonKeyboardAvoidingViewHandle = HTMLDivElement;
export type YeonKeyboardAvoidingViewProps = HTMLAttributes<HTMLDivElement> & {
  behavior?: string;
  keyboardVerticalOffset?: number;
};

export const YeonKeyboardAvoidingView = forwardRef<
  YeonKeyboardAvoidingViewHandle,
  YeonKeyboardAvoidingViewProps
>(function YeonKeyboardAvoidingView(
  {
    behavior: _behavior,
    keyboardVerticalOffset: _keyboardVerticalOffset,
    ...props
  },
  ref
) {
  return <div ref={ref} {...props} />;
});
