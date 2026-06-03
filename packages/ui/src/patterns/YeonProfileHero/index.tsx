import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";
import {
  YeonAvatarCircle,
  type YeonAvatarCircleTone,
} from "../YeonAvatarCircle";

export type YeonProfileHeroProps = {
  avatarTone?: YeonAvatarCircleTone;
  className?: string;
  highlight?: ReactNode;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  size?: number;
  title: ReactNode;
};

export function YeonProfileHero({
  avatarTone = "neutral",
  className,
  highlight,
  imageUrl,
  label,
  meta,
  size = 72,
  title,
}: YeonProfileHeroProps) {
  return (
    <YeonView className={joinClassNames("flex items-center gap-4", className)}>
      <YeonAvatarCircle
        imageUrl={imageUrl}
        label={label}
        size={size}
        tone={avatarTone}
      />
      <YeonView className="grid flex-1 gap-1.5">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[24px] font-black text-[#111]"
        >
          {title}
        </YeonText>
        {meta ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[14px] text-[#666]"
          >
            {meta}
          </YeonText>
        ) : null}
        {highlight ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[15px] font-extrabold text-[#111]"
          >
            {highlight}
          </YeonText>
        ) : null}
      </YeonView>
    </YeonView>
  );
}
