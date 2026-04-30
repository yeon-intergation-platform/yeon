"use client";

import dynamic from "next/dynamic";

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
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[#111]">{label}</span>
        <span className="text-[12px] text-[#888]">
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
