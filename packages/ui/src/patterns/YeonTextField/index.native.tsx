import {
  YeonField,
  type YeonFieldProps,
} from "../../primitives/YeonField/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonTextFieldProps = {
  disabled?: boolean;
  keyboardType?: YeonFieldProps["keyboardType"];
  label: string;
  maxLength?: number;
  multiline?: boolean;
  multilineMinHeight?: number;
  onChangeText: (value: string) => void;
  // 커서/선택 제어(포맷 툴바 등에서 커서 위치에 삽입할 때 사용).
  onSelectionChange?: YeonFieldProps["onSelectionChange"];
  selection?: YeonFieldProps["selection"];
  onFocus?: YeonFieldProps["onFocus"];
  placeholder?: string;
  secureTextEntry?: boolean;
  showCounter?: boolean;
  value: string;
};

export function YeonTextField({
  disabled = false,
  keyboardType = "default",
  label,
  maxLength,
  multiline = false,
  multilineMinHeight,
  onChangeText,
  onSelectionChange,
  selection,
  onFocus,
  placeholder,
  secureTextEntry = false,
  showCounter = false,
  value,
}: YeonTextFieldProps) {
  return (
    <YeonView style={styles.wrapper}>
      <YeonView style={styles.header}>
        <YeonText variant="caption" tone="secondary" style={styles.label}>
          {label}
        </YeonText>
        {showCounter && typeof maxLength === "number" ? (
          <YeonText variant="caption" tone="secondary" style={styles.counter}>
            {value.length}/{maxLength}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonField
        editable={!disabled}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={yeonMobileAppColors.textMuted}
        secureTextEntry={secureTextEntry}
        selection={selection}
        style={[
          styles.input,
          disabled ? styles.inputDisabled : null,
          multiline ? styles.multiline : null,
          multiline && typeof multilineMinHeight === "number"
            ? { minHeight: multilineMinHeight }
            : null,
        ]}
        textAlignVertical={multiline ? "top" : undefined}
        value={value}
      />
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  wrapper: {
    gap: 8,
  },
  counter: {
    color: yeonMobileAppColors.textMuted,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    letterSpacing: 0.2,
  },
  input: {
    borderColor: yeonMobileAppColors.border,
    borderRadius: 18,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  multiline: {
    minHeight: 92,
  },
});
