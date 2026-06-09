import { YeonTextField as TextField, YeonView } from "@yeon/ui/native";

import { markdownTextFieldStyles as styles } from "./markdown-text-field-styles";
import { MarkdownTextFieldToolbar } from "./markdown-text-field-toolbar";
import { useMarkdownTextFieldController } from "./use-markdown-text-field-controller";

type MarkdownTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export function MarkdownTextField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
}: MarkdownTextFieldProps) {
  const controller = useMarkdownTextFieldController({
    maxLength,
    onChangeText,
    value,
  });

  return (
    <YeonView style={styles.wrapper}>
      <MarkdownTextFieldToolbar
        isUploading={controller.isUploading}
        onAction={(action) => void controller.handleAction(action)}
      />
      <TextField
        label={label}
        maxLength={maxLength}
        multiline
        multilineMinHeight={136}
        onChangeText={onChangeText}
        onSelectionChange={(event) => {
          controller.handleSelectionChange(event.nativeEvent.selection);
        }}
        placeholder={placeholder}
        selection={controller.controlledSelection}
        showCounter={typeof maxLength === "number"}
        value={value}
      />
    </YeonView>
  );
}
