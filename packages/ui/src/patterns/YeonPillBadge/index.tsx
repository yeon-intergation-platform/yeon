import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonPillBadgeTone = "accent" | "neutral";

export type YeonPillBadgeProps = {
  accessibilityLabel?: string;
  className?: string;
  label: string | number;
  onPress?: () => void;
  tone?: YeonPillBadgeTone;
};

export function YeonPillBadge({
  accessibilityLabel,
  className,
  label,
  onPress,
  tone = "neutral",
}: YeonPillBadgeProps) {
  const badgeClassName = joinClassNames(
    "inline-flex items-center rounded-full px-2.5 py-1.5 text-[11px] font-extrabold",
    tone === "accent" ? "bg-[#111] text-white" : "bg-[#fafafa] text-[#111]",
    className
  );

  if (onPress) {
    return (
      <YeonButton
        aria-label={accessibilityLabel ?? String(label)}
        onClick={onPress}
        variant="ghost"
        className={badgeClassName}
      >
        {label}
      </YeonButton>
    );
  }

  return (
    <YeonView className={badgeClassName}>
      <YeonText variant="unstyled" tone="inherit">
        {label}
      </YeonText>
    </YeonView>
  );
}
