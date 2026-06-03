import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";
import {
  YeonAvatarCircle,
  type YeonAvatarCircleTone,
} from "../YeonAvatarCircle";

export type YeonPostAuthorHeaderProps = {
  avatarSize?: number;
  avatarTone?: YeonAvatarCircleTone;
  className?: string;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  onPress?: () => void;
  title: ReactNode;
  titleSize?: "md" | "lg";
  trailingLayout?: "column" | "row";
  trailingSlot?: ReactNode;
  verticalAlign?: "center" | "start";
};

export function YeonPostAuthorHeader({
  avatarSize = 42,
  avatarTone = "accent",
  className,
  imageUrl,
  label,
  meta,
  onPress,
  title,
  titleSize = "md",
  trailingLayout = "row",
  trailingSlot,
  verticalAlign = "start",
}: YeonPostAuthorHeaderProps) {
  return (
    <YeonView
      className={joinClassNames(
        "mb-3 flex justify-between gap-3",
        verticalAlign === "center" ? "items-center" : "items-start",
        className
      )}
    >
      <YeonButton
        onClick={onPress}
        variant="ghost"
        className="flex min-h-0 flex-1 items-center justify-start gap-3 border-0 p-0 text-left"
      >
        <YeonAvatarCircle
          imageUrl={imageUrl}
          label={label}
          size={avatarSize}
          tone={avatarTone}
        />
        <YeonView className="grid min-w-0 flex-1 gap-1">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={joinClassNames(
              "font-black text-[#111]",
              titleSize === "lg" ? "text-[20px]" : "text-[18px]"
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
        </YeonView>
      </YeonButton>
      {trailingSlot ? (
        <YeonView
          className={joinClassNames(
            "flex shrink-0 gap-3",
            trailingLayout === "column"
              ? "flex-col items-end gap-2"
              : "items-center"
          )}
        >
          {trailingSlot}
        </YeonView>
      ) : null}
    </YeonView>
  );
}
