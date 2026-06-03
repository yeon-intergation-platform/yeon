import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonPollOptionProps = {
  countLabel: string;
  label: string;
  onPress: YeonButtonProps["onPress"];
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
      onPress={onPress}
      style={[
        styles.optionButton,
        selected ? styles.optionButtonSelected : null,
      ]}
      variant={selected ? "primary" : "secondary"}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        style={[
          styles.optionLabel,
          selected ? styles.optionLabelSelected : null,
        ]}
      >
        {label}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        style={[
          styles.optionCount,
          selected ? styles.optionLabelSelected : null,
        ]}
      >
        {countLabel}
      </YeonText>
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  optionButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionButtonSelected: {
    backgroundColor: yeonMobileAppColors.accent,
    borderColor: yeonMobileAppColors.accent,
  },
  optionCount: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  optionLabel: {
    color: yeonMobileAppColors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  optionLabelSelected: {
    color: yeonMobileAppColors.white,
  },
});
