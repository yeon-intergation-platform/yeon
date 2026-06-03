import type { ReactNode } from "react";

import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonCenteredFormShellProps = {
  children: ReactNode;
  style?: YeonViewProps["style"];
};

export function YeonCenteredFormShell({
  children,
  style,
}: YeonCenteredFormShellProps) {
  return <YeonView style={[styles.shell, style]}>{children}</YeonView>;
}

const styles = createYeonStyleSheet({
  shell: {
    alignSelf: "center",
    gap: 40,
    maxWidth: 360,
    width: "100%",
  },
});
