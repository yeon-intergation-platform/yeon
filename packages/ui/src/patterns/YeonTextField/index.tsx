import { YeonField } from "../../primitives/YeonField";
import { YeonText } from "../../primitives/YeonText";
import type {
  YeonChangeEvent,
  YeonInputElement,
  YeonTextAreaElement,
} from "../../types";

export type YeonTextFieldProps = {
  disabled?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  label: string;
  maxLength?: number;
  multiline?: boolean;
  multilineMinHeight?: number;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  showCounter?: boolean;
  value: string;
};

const inputTypeByKeyboard = {
  default: "text",
  "email-address": "email",
  "number-pad": "number",
  "phone-pad": "tel",
} as const;

export function YeonTextField({
  disabled = false,
  keyboardType = "default",
  label,
  maxLength,
  multiline = false,
  multilineMinHeight,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showCounter = false,
  value,
}: YeonTextFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3">
        <YeonText
          variant="caption"
          tone="secondary"
          className="tracking-[0.02em]"
        >
          {label}
        </YeonText>
        {showCounter && typeof maxLength === "number" ? (
          <YeonText variant="caption" tone="secondary">
            {value.length}/{maxLength}
          </YeonText>
        ) : null}
      </span>
      <YeonField
        as={multiline ? "textarea" : "input"}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(
          event: YeonChangeEvent<YeonInputElement | YeonTextAreaElement>
        ) => onChangeText(event.currentTarget.value)}
        placeholder={placeholder}
        style={
          multiline && typeof multilineMinHeight === "number"
            ? { minHeight: multilineMinHeight }
            : undefined
        }
        type={secureTextEntry ? "password" : inputTypeByKeyboard[keyboardType]}
        value={value}
        className={multiline ? "min-h-[92px] resize-y" : "min-h-12"}
      />
    </label>
  );
}
