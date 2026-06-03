import type { ReactNode } from "react";

import {
  YeonSwitch,
  type YeonSwitchProps,
} from "../../primitives/YeonSwitch/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonSwitchSettingRowProps = {
  accessibilityLabel?: string;
  checked: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  label: ReactNode;
  onCheckedChange: NonNullable<YeonSwitchProps["onCheckedChange"]>;
  style?: YeonViewProps["style"];
};

export function YeonSwitchSettingRow({
  accessibilityLabel,
  checked,
  disabled,
  hint,
  label,
  onCheckedChange,
  style,
}: YeonSwitchSettingRowProps) {
  return (
    <YeonView style={[styles.switchRow, style]}>
      <YeonView style={styles.copy}>
        <YeonText variant="unstyled" tone="inherit" style={styles.switchLabel}>
          {label}
        </YeonText>
        {hint ? (
          <YeonText variant="unstyled" tone="inherit" style={styles.switchHint}>
            {hint}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonSwitch
        accessibilityLabel={accessibilityLabel}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  copy: {
    flex: 1,
    paddingRight: 16,
  },
  switchHint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  switchLabel: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
