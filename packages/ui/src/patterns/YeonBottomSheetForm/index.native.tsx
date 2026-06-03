import type { ReactNode } from "react";

import { YeonScrollView } from "../../primitives/YeonScrollView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonBottomSheetFormProps = {
  children: ReactNode;
};

export function YeonBottomSheetForm({ children }: YeonBottomSheetFormProps) {
  return (
    <YeonScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </YeonScrollView>
  );
}

const styles = createYeonStyleSheet({
  content: {
    gap: 22,
    paddingBottom: 34,
    paddingTop: 26,
  },
});
