import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { joinClassNames } from "../../utils";

export type YeonPollOptionProps = {
  countLabel: string;
  label: string;
  onPress?: () => void;
  selected?: boolean;
};

export function YeonPollOption({
  countLabel,
  label,
  onPress,
  selected = false,
}: YeonPollOptionProps) {
  return (
    <YeonButton
      onClick={onPress}
      variant={selected ? "primary" : "secondary"}
      className={joinClassNames(
        "flex items-center justify-between rounded-[18px] border px-3.5 py-3.5",
        selected
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-[#fafafa] text-[#111]"
      )}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={joinClassNames(
          "flex-1 text-[15px] font-bold",
          selected ? "text-white" : "text-[#111]"
        )}
      >
        {label}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={joinClassNames(
          "text-[13px] font-bold",
          selected ? "text-white" : "text-[#666]"
        )}
      >
        {countLabel}
      </YeonText>
    </YeonButton>
  );
}
