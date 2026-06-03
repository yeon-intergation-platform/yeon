import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";
import { YeonSectionCard } from "../YeonSectionCard/index.native";

export type YeonChatMessageBubbleProps = {
  body: ReactNode;
  meta: ReactNode;
  mine?: boolean;
  onReportPress?: YeonButtonProps["onPress"];
  reportLabel?: string;
};

export function YeonChatMessageBubble({
  body,
  meta,
  mine = false,
  onReportPress,
  reportLabel = "신고",
}: YeonChatMessageBubbleProps) {
  return (
    <YeonView style={[styles.row, mine ? styles.rowMine : styles.rowPeer]}>
      <YeonSectionCard>
        <YeonText
          variant="unstyled"
          tone="inherit"
          style={[styles.body, mine ? styles.bodyMine : null]}
        >
          {body}
        </YeonText>
        <YeonView style={styles.metaRow}>
          <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
            {meta}
          </YeonText>
          {onReportPress ? (
            <YeonButton
              onPress={onReportPress}
              size="sm"
              style={styles.reportButton}
              textStyle={styles.report}
              variant="ghost"
            >
              {reportLabel}
            </YeonButton>
          ) : null}
        </YeonView>
      </YeonSectionCard>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  body: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMine: {
    color: yeonMobileAppColors.accent,
  },
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  report: {
    color: yeonMobileAppColors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  reportButton: {
    borderWidth: 0,
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  row: {
    flexDirection: "row",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowPeer: {
    justifyContent: "flex-start",
  },
});
