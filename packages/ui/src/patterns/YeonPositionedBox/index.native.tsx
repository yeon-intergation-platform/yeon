import type { ReactNode } from "react";

import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import type {
  YeonStyleProp,
  YeonViewStyle,
} from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonPositionedBoxProps = Omit<YeonViewProps, "style"> & {
  box?: YeonStyleProp<YeonViewStyle>;
  children?: ReactNode;
};

export function YeonPositionedBox({
  box,
  children,
  ...props
}: YeonPositionedBoxProps) {
  return (
    <YeonView style={box} {...props}>
      {children}
    </YeonView>
  );
}
