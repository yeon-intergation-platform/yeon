import type { CSSProperties, ElementType, ReactNode } from "react";

import { YeonView, type YeonViewProps } from "../../primitives/YeonView";

export type YeonPositionedBoxProps = Omit<YeonViewProps, "style"> & {
  as?: ElementType;
  box?: CSSProperties;
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
