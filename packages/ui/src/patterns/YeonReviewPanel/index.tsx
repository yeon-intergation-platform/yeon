import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonReviewPanelActionTone = "primary" | "secondary";

export type YeonReviewPanelAction = {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: ReactNode;
  onPress?: () => void;
  tone?: YeonReviewPanelActionTone;
};

export type YeonReviewPanelProps = {
  actions: YeonReviewPanelAction[];
  answerLabel: ReactNode;
  answerText: ReactNode;
  className?: string;
  questionLabel: ReactNode;
  questionText: ReactNode;
};

export function YeonReviewPanel({
  actions,
  answerLabel,
  answerText,
  className,
  questionLabel,
  questionText,
}: YeonReviewPanelProps) {
  return (
    <YeonView
      className={joinClassNames(
        "flex min-h-[360px] flex-1 flex-col rounded-[22px] border border-[#e5e5e5] bg-white p-[18px]",
        className
      )}
    >
      <YeonView className="flex-1 overflow-auto pb-2">
        <YeonText
          tone="secondary"
          className="text-[13px] font-black tracking-[0.08em]"
        >
          {questionLabel}
        </YeonText>
        <YeonText className="mt-2 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-[18px] text-[16px] leading-7 text-[#111]">
          {questionText}
        </YeonText>
        <YeonText
          tone="secondary"
          className="mt-6 text-[13px] font-black tracking-[0.08em]"
        >
          {answerLabel}
        </YeonText>
        <YeonText className="mt-2 rounded-2xl bg-[#111] p-[18px] text-[16px] leading-7 text-white">
          {answerText}
        </YeonText>
      </YeonView>
      <YeonView className="mt-3.5 grid gap-2.5">
        {actions.map((action, index) => {
          const isPrimary = action.tone === "primary";

          return (
            <YeonButton
              aria-label={action.accessibilityLabel}
              disabled={action.disabled}
              key={index}
              onClick={action.onPress}
              variant={isPrimary ? "primary" : "secondary"}
              className={joinClassNames(
                "min-h-[54px] rounded-xl text-[14px] font-black",
                isPrimary
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#e5e5e5] bg-white text-[#111]",
                action.disabled ? "opacity-50" : undefined
              )}
            >
              {action.label}
            </YeonButton>
          );
        })}
      </YeonView>
    </YeonView>
  );
}
