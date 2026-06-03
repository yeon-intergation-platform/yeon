import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";

export type YeonDeckListItemProps = {
  accessibilityLabel: string;
  actionLabel: ReactNode;
  description?: ReactNode;
  meta: ReactNode;
  onPress: () => void;
  title: ReactNode;
};

export function YeonDeckListItem({
  accessibilityLabel,
  actionLabel,
  description,
  meta,
  onPress,
  title,
}: YeonDeckListItemProps) {
  return (
    <YeonButton
      aria-label={accessibilityLabel}
      onClick={onPress}
      variant="secondary"
      className="flex w-full flex-col items-start gap-2.5 rounded-[14px] border border-[#e5e5e5] bg-white p-[18px] text-left"
    >
      <YeonView className="grid gap-1.5">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[17px] font-black text-[#111]"
        >
          {title}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[12px] text-[#666]"
        >
          {meta}
        </YeonText>
        {description ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-[14px] leading-5 text-[#666]"
          >
            {description}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-1 text-[13px] font-bold text-[#111]"
      >
        {actionLabel}
      </YeonText>
    </YeonButton>
  );
}
