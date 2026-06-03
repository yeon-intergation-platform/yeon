import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonCenteredFormShellProps = {
  children: ReactNode;
  className?: string;
};

export function YeonCenteredFormShell({
  children,
  className,
}: YeonCenteredFormShellProps) {
  return (
    <YeonView
      className={joinClassNames(
        "mx-auto grid w-full max-w-[360px] gap-10",
        className
      )}
    >
      {children}
    </YeonView>
  );
}
