import type { CSSProperties, ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonMobileHeaderBarProps = {
  className?: string;
  leftAccessibilityLabel?: string;
  leftLabel?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightLabel?: ReactNode;
  style?: CSSProperties;
  subtitle?: string;
  subtitleStyle?: CSSProperties;
  title: string;
  titleStyle?: CSSProperties;
};

export function YeonMobileHeaderBar({
  className,
  leftAccessibilityLabel,
  leftLabel,
  onLeftPress,
  onRightPress,
  rightAccessibilityLabel,
  rightLabel,
  style,
  subtitle,
  subtitleStyle,
  title,
  titleStyle,
}: YeonMobileHeaderBarProps) {
  return (
    <YeonView
      className={joinClassNames("flex flex-row items-center", className)}
      style={style}
    >
      <HeaderButton
        accessibilityLabel={leftAccessibilityLabel}
        label={leftLabel}
        onPress={onLeftPress}
      />
      <YeonView className="min-w-0 flex-1 px-2 text-center">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="truncate text-center text-[20px] font-black leading-7 text-[#111]"
          style={titleStyle}
        >
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-center text-[13px] leading-5 text-[#666]"
            style={subtitleStyle}
          >
            {subtitle}
          </YeonText>
        ) : null}
      </YeonView>
      <HeaderButton
        accessibilityLabel={rightAccessibilityLabel}
        label={rightLabel}
        onPress={onRightPress}
      />
    </YeonView>
  );
}

function HeaderButton({
  accessibilityLabel,
  label,
  onPress,
}: {
  accessibilityLabel?: string;
  label?: ReactNode;
  onPress?: () => void;
}) {
  if (!label) {
    return <YeonView className="h-11 w-11" aria-hidden="true" />;
  }

  return (
    <YeonButton
      aria-label={accessibilityLabel}
      onClick={onPress}
      size="icon"
      variant="icon"
      className="h-11 w-11 text-[22px] font-light text-[#111]"
    >
      {label}
    </YeonButton>
  );
}
