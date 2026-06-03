import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

export type YeonOgImageFrameProps = ViewProps & {
  brand?: string;
  description?: string;
  domain?: string;
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
};

export function YeonOgImageFrame({
  children,
  ...props
}: YeonOgImageFrameProps) {
  return <View {...props}>{children}</View>;
}
