import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";

export type YeonSafeAreaViewHandle = HTMLDivElement;
export type YeonSafeAreaViewProps = HTMLAttributes<HTMLDivElement> & {
  edges?: readonly string[];
};
export type YeonSafeAreaProviderProps = {
  children?: ReactNode;
};

export function YeonSafeAreaProvider({ children }: YeonSafeAreaProviderProps) {
  return <>{children}</>;
}

export const YeonSafeAreaView = forwardRef<
  YeonSafeAreaViewHandle,
  YeonSafeAreaViewProps
>(function YeonSafeAreaView({ edges: _edges, ...props }, ref) {
  return <div ref={ref} {...props} />;
});
