import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";
import { YeonSectionCard } from "../YeonSectionCard";

export type YeonChatMessageBubbleProps = {
  body: ReactNode;
  meta: ReactNode;
  mine?: boolean;
  onReportPress?: () => void;
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
    <YeonView
      className={joinClassNames("flex", mine ? "justify-end" : "justify-start")}
    >
      <YeonSectionCard>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={joinClassNames(
            "text-[15px] leading-[22px] text-[#111]",
            mine ? "font-medium" : null
          )}
        >
          {body}
        </YeonText>
        <YeonView className="mt-2 flex items-center gap-3">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] text-[#666]"
          >
            {meta}
          </YeonText>
          {onReportPress ? (
            <YeonButton
              onClick={onReportPress}
              size="sm"
              variant="ghost"
              className="min-h-0 border-0 p-0 text-[12px] font-bold text-[#111]"
            >
              {reportLabel}
            </YeonButton>
          ) : null}
        </YeonView>
      </YeonSectionCard>
    </YeonView>
  );
}
