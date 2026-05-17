"use client";

import dynamic from "next/dynamic";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

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
    <div className="flex flex-col gap-2">
      <div className={SHARED_FEATURE_CLASS.alignBetweenGap3}>
        <span className={SHARED_FEATURE_CLASS.text13PrimaryMedium}>
          {label}
        </span>
        <span className={SHARED_FEATURE_CLASS.text12Soft}>
          {value.length}/{maxLength}
        </span>
      </div>
      <div data-color-mode="light" className="yeon-markdown-editor">
        <MDEditor
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
      </div>
    </div>
  );
}
