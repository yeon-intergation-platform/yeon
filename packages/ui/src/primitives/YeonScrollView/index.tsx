import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

export type YeonScrollViewHandle = HTMLDivElement;
export type YeonScrollViewProps = HTMLAttributes<HTMLDivElement> & {
  contentContainerStyle?: unknown;
};

export const YeonScrollView = forwardRef<
  YeonScrollViewHandle,
  YeonScrollViewProps
>(function YeonScrollView(
  { contentContainerStyle: _contentContainerStyle, ...props },
  ref
) {
  return <div ref={ref} {...props} />;
});
