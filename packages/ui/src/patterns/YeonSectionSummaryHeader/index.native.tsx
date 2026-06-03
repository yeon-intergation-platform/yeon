import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonSectionSummaryHeaderProps = {
  meta?: ReactNode;
  title: ReactNode;
};

export function YeonSectionSummaryHeader({
  meta,
  title,
}: YeonSectionSummaryHeaderProps) {
  return (
    <YeonView style={styles.row}>
      <YeonText variant="unstyled" tone="inherit" style={styles.title}>
        {title}
      </YeonText>
      {meta ? (
        <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
          {meta}
        </YeonText>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "800",
  },
});
