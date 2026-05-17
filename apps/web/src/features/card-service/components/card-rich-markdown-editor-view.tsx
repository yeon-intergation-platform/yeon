"use client";

import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import { MarkdownContent } from "./markdown-content";

export const CARD_EDITOR_HEIGHT_CLASS = {
  question: {
    editor: "min-h-[280px] md:min-h-[320px]",
    preview: "min-h-[280px] md:min-h-[320px]",
  },
  answer: {
    editor: "min-h-[360px] md:min-h-[420px]",
    preview: "min-h-[360px] md:min-h-[420px]",
  },
} as const;

function isMeaningfulCardEditorContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0 || /<img\b/i.test(value)
  );
}

export function CardEditorPreview({
  label,
  value,
  previewHeightClassName,
}: {
  label: string;
  value: string;
  previewHeightClassName: string;
}) {
  const hasContent = isMeaningfulCardEditorContent(value);

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
      <div
        className={`${SHARED_FEATURE_CLASS.alignBetweenGap3} border-b border-[#eeeeee] bg-[#fafafa] px-5 py-3 md:px-6`}
      >
        <p className={SHARED_FEATURE_CLASS.text13Emphasis}>미리보기</p>
        <p className="truncate text-[12px] font-medium text-[#888]">{label}</p>
      </div>
      <div className={`flex-1 p-5 md:p-6 ${previewHeightClassName}`}>
        {hasContent ? (
          <MarkdownContent>{value}</MarkdownContent>
        ) : (
          <p className="text-[13px] leading-6 text-[#999]">
            작성한 내용이 오른쪽에 실제 카드처럼 표시됩니다.
          </p>
        )}
      </div>
    </aside>
  );
}

export function CardRichEditorGlobalStyles() {
  return (
    <style jsx global>{`
      .card-rich-editor-content .ProseMirror {
        min-height: inherit;
        outline: none;
      }
      .card-rich-editor-content
        .ProseMirror
        p.is-editor-empty:first-child::before {
        color: #aaa;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
      .card-rich-editor-content p {
        margin: 0.5rem 0;
      }
      .card-rich-editor-content ul,
      .card-rich-editor-content ol {
        margin: 0.5rem 0;
        padding-left: 1.35rem;
      }
      .card-rich-editor-content ul {
        list-style: disc;
      }
      .card-rich-editor-content ol {
        list-style: decimal;
      }
      .card-rich-editor-content blockquote {
        border-left: 4px solid #e5e5e5;
        color: #555;
        margin: 0.75rem 0;
        padding-left: 0.75rem;
      }
      .card-rich-editor-content a {
        text-decoration: underline;
      }
      .card-rich-editor-image {
        display: inline-block;
        max-width: 100%;
        position: relative;
        vertical-align: middle;
      }
      .card-rich-editor-image img {
        border: 1px solid #e5e5e5;
        border-radius: 14px;
        display: block;
        height: auto;
        max-width: 100%;
      }
      .card-rich-editor-image.is-selected img {
        outline: 2px solid #111;
        outline-offset: 2px;
      }
      .card-rich-editor-image-handle {
        background: #111;
        border: 2px solid #fff;
        border-radius: 999px;
        bottom: -10px;
        box-shadow: 0 2px 8px rgba(17, 17, 17, 0.22);
        cursor: ew-resize;
        height: 22px;
        position: absolute;
        right: -10px;
        touch-action: none;
        width: 22px;
      }
      .card-rich-editor-image-size {
        background: rgba(17, 17, 17, 0.78);
        border-radius: 999px;
        bottom: 8px;
        color: white;
        font-size: 11px;
        left: 8px;
        padding: 3px 8px;
        position: absolute;
      }
    `}</style>
  );
}
