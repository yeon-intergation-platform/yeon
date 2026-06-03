import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";
import { YeonAvatarCircle } from "../YeonAvatarCircle";

export type YeonReplyListItemProps = {
  body: ReactNode;
  className?: string;
  imageUrl?: string | null;
  label: string;
  meta: ReactNode;
};

export function YeonReplyListItem({
  body,
  className,
  imageUrl,
  label,
  meta,
}: YeonReplyListItemProps) {
  return (
    <YeonView
      className={joinClassNames(
        "grid gap-2 rounded-[18px] bg-[#fafafa] p-3",
        className
      )}
    >
      <YeonView className="flex items-center gap-2.5">
        <YeonAvatarCircle imageUrl={imageUrl} label={label} size={34} />
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-bold text-[#666]"
        >
          {meta}
        </YeonText>
      </YeonView>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[15px] leading-[22px] text-[#111]"
      >
        {body}
      </YeonText>
    </YeonView>
  );
}
