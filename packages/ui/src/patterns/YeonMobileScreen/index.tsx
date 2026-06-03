import type { CSSProperties, ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonMobileScreenContentVariant =
  | "card"
  | "centered"
  | "chat"
  | "detail"
  | "full"
  | "play";

export type YeonMobileScreenProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  contentVariant?: YeonMobileScreenContentVariant;
  floatingSlot?: ReactNode;
  keyboardAvoiding?: boolean;
  keyboardShouldPersistTaps?: unknown;
  safeAreaEdges?: unknown;
  scroll?: boolean;
  style?: CSSProperties;
};

const contentVariantClassNames: Record<YeonMobileScreenContentVariant, string> =
  {
    card: "gap-[18px] p-5 pb-12",
    centered: "min-h-dvh flex-1 justify-center px-6 pb-12 pt-12 [flex-grow:1]",
    chat: "gap-4 px-[18px] pb-[120px] pt-[22px]",
    detail: "p-6 pb-[110px]",
    full: "flex-1",
    play: "flex-1 p-6",
  };

export function YeonMobileScreen({
  children,
  className,
  contentClassName,
  contentStyle,
  contentVariant = "chat",
  floatingSlot,
  style,
}: YeonMobileScreenProps) {
  return (
    <YeonView
      className={joinClassNames("min-h-dvh flex-1 bg-white", className)}
      style={style}
    >
      <YeonView
        className={joinClassNames(
          "flex flex-col",
          contentVariantClassNames[contentVariant],
          contentClassName
        )}
        style={contentStyle}
      >
        {children}
      </YeonView>
      {floatingSlot}
    </YeonView>
  );
}
