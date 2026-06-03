import { YeonButton } from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonSegmentedControlOption<TValue extends string = string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

export type YeonSegmentedControlProps<TValue extends string = string> = {
  onValueChange: (value: TValue) => void;
  options: YeonSegmentedControlOption<TValue>[];
  style?: YeonViewProps["style"];
  value: TValue;
};

export function YeonSegmentedControl<TValue extends string = string>({
  onValueChange,
  options,
  style,
  value,
}: YeonSegmentedControlProps<TValue>) {
  return (
    <YeonView style={[styles.row, style]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <YeonButton
            accessibilityLabel={option.label}
            disabled={option.disabled}
            key={option.value}
            onPress={() => onValueChange(option.value)}
            variant={selected ? "primary" : "secondary"}
            style={[
              styles.button,
              selected ? styles.buttonSelected : null,
              option.disabled ? styles.buttonDisabled : null,
            ]}
          >
            <YeonText
              variant="unstyled"
              tone="inherit"
              style={[
                styles.label,
                selected ? styles.labelSelected : null,
                option.disabled ? styles.labelDisabled : null,
              ]}
            >
              {option.label}
            </YeonText>
          </YeonButton>
        );
      })}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  button: {
    alignItems: "center",
    borderColor: yeonMobileAppColors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonSelected: {
    backgroundColor: yeonMobileAppColors.black,
    borderColor: yeonMobileAppColors.black,
  },
  label: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  labelDisabled: {
    color: yeonMobileAppColors.textMuted,
  },
  labelSelected: {
    color: yeonMobileAppColors.white,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
});
