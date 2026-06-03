import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";
import { YeonAvatarCircle } from "../YeonAvatarCircle";

export type YeonProfileListRowProps = {
  avatarSize?: number;
  className?: string;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  onPress?: () => void;
  preview?: ReactNode;
  title: ReactNode;
  titleTone?: "accent" | "primary";
  trailingSlot?: ReactNode;
};

export function YeonProfileListRow({
  avatarSize = 48,
  className,
  imageUrl,
  label,
  meta,
  onPress,
  preview,
  title,
  titleTone = "accent",
  trailingSlot,
}: YeonProfileListRowProps) {
  return (
    <YeonView
      className={joinClassNames("flex items-center justify-between", className)}
    >
      <YeonButton
        onClick={onPress}
        variant="ghost"
        className="flex flex-1 items-center justify-start gap-3 border-0 p-0 text-left"
      >
        <YeonAvatarCircle imageUrl={imageUrl} label={label} size={avatarSize} />
        <YeonView className="grid flex-1 gap-1">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={joinClassNames(
              "text-[18px] font-black",
              titleTone === "primary" ? "text-[#111]" : "text-[#111]"
            )}
          >
            {title}
          </YeonText>
          {meta ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[13px] text-[#666]"
            >
              {meta}
            </YeonText>
          ) : null}
          {preview ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] text-[#111]"
            >
              {preview}
            </YeonText>
          ) : null}
        </YeonView>
      </YeonButton>
      {trailingSlot ? (
        <YeonView className="ml-3 grid justify-items-end gap-2">
          {trailingSlot}
        </YeonView>
      ) : null}
    </YeonView>
  );
}
