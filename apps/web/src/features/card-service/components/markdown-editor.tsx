"use client";
import { YeonLegacyMarkdownEditor } from "@yeon/ui/rich-content/YeonMarkdownEditor";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonText, YeonView } from "@yeon/ui";

const DISALLOWED_MARKDOWN_ELEMENTS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
];

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  minRows?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  maxLength = 2000,
  minRows = 6,
  placeholder,
}: MarkdownEditorProps) {
  const editorHeight = Math.max(180, minRows * 28 + 70);

  return (
    <YeonView className="flex flex-col gap-2">
      <YeonView className={SHARED_FEATURE_CLASS.alignBetweenGap3}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13PrimaryMedium}
        >
          {label}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text12Soft}
        >
          {value.length}/{maxLength}
        </YeonText>
      </YeonView>
      <YeonView data-color-mode="light" className="yeon-markdown-editor">
        <YeonLegacyMarkdownEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          preview="edit"
          height={editorHeight}
          visibleDragbar={false}
          highlightEnable={false}
          textareaProps={{
            "aria-label": label,
            maxLength,
            placeholder,
          }}
          previewOptions={{
            disallowedElements: DISALLOWED_MARKDOWN_ELEMENTS,
            unwrapDisallowed: true,
          }}
        />
      </YeonView>
    </YeonView>
  );
}
