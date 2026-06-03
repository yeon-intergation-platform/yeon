import { forwardRef } from "react";
import type { ElementType, HTMLAttributes } from "react";

import { joinClassNames } from "../../utils";

export type YeonViewProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
};

export const YeonView = forwardRef<HTMLElement, YeonViewProps>(
  function YeonView({ as: Component = "div", className, ...props }, ref) {
    return (
      <Component ref={ref} className={joinClassNames(className)} {...props} />
    );
  }
);
