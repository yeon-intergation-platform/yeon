import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonCardNavigationControlsProps = {
  nextLabel: string;
  onNext: NonNullable<YeonButtonProps["onPress"]>;
  onPrev: NonNullable<YeonButtonProps["onPress"]>;
  prevLabel: string;
  canMoveNext: boolean;
  canMovePrev: boolean;
};

export function YeonCardNavigationControls({
  canMoveNext,
  canMovePrev,
  nextLabel,
  onNext,
  onPrev,
  prevLabel,
}: YeonCardNavigationControlsProps) {
  return (
    <YeonView style={styles.controls}>
      <YeonButton
        accessibilityLabel={prevLabel}
        disabled={!canMovePrev}
        onPress={onPrev}
        variant="secondary"
        style={[
          styles.button,
          styles.secondary,
          !canMovePrev ? styles.disabled : null,
        ]}
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          style={styles.secondaryText}
        >
          {prevLabel}
        </YeonText>
      </YeonButton>
      <YeonButton
        accessibilityLabel={nextLabel}
        disabled={!canMoveNext}
        onPress={onNext}
        variant="primary"
        style={[
          styles.button,
          styles.primary,
          !canMoveNext ? styles.disabled : null,
        ]}
      >
        <YeonText variant="unstyled" tone="inherit" style={styles.primaryText}>
          {nextLabel}
        </YeonText>
      </YeonButton>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  button: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: yeonMobileAppColors.black,
  },
  primaryText: {
    color: yeonMobileAppColors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  secondary: {
    borderColor: yeonMobileAppColors.borderStrong,
    borderWidth: 1,
  },
  secondaryText: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
});
