"use client";

import { memo } from "react";
import type { ReactNode } from "react";

import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import { isRenderableRichContent } from "./card-content-utils";
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

const CARD_EDITOR_COMPACT_HEIGHT_CLASS = {
  question: {
    editor: "min-h-[140px] md:min-h-[160px] lg:min-h-0 lg:flex-1",
    preview: "min-h-[140px] md:min-h-[160px]",
  },
  answer: {
    editor: "min-h-[160px] md:min-h-[185px] lg:min-h-0 lg:flex-1",
    preview: "min-h-[160px] md:min-h-[185px]",
  },
} as const;

export const CARD_EDITOR_COMPACT_CLASS = {
  fieldShell:
    "grid min-w-0 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white lg:min-h-full",
  fieldLabel: "min-w-0 text-[13px] font-semibold leading-none text-[#111]",
  statusPill: `shrink-0 rounded-full border border-[#e5e5e5] bg-white px-2 py-0.5 ${SHARED_FEATURE_CLASS.text12Neutral}`,
  mobileToggle:
    "mb-2 grid grid-cols-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-0.5 lg:hidden",
  mobileToggleButton: "rounded-lg px-2.5 py-1.5 text-[12px] font-semibold",
  toolbar:
    "grid min-h-12 grid-cols-[88px_minmax(0,1fr)] items-center gap-2 border-b border-[#e5e5e5] bg-white px-3 py-2",
  toolbarButton: "h-8 w-8 rounded-lg",
  toolbarIcon: "h-3.5 w-3.5",
  toolbarDivider: "mx-0.5 hidden h-8 w-px bg-[#e5e5e5] sm:block",
  editorBody: "min-h-0 min-w-0",
  editorContent:
    "card-rich-editor-content h-full bg-white px-3 py-3 text-[14px] leading-6 text-[#111] outline-none",
  previewRail: "hidden min-h-0 flex-col gap-3 lg:flex lg:min-h-full",
  previewFace:
    "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white",
  previewFaceHeader:
    "flex min-h-12 items-center justify-between gap-2 border-b border-[#e5e5e5] px-3 py-2",
  previewFaceBody:
    "min-h-0 flex-1 overflow-visible px-3 py-3 text-[13px] leading-6 text-[#111]",
} as const;

export function getCardEditorHeightClass(
  density: keyof typeof CARD_EDITOR_HEIGHT_CLASS,
  layoutMode: "default" | "compact" = "default"
) {
  if (layoutMode === "compact") {
    return CARD_EDITOR_COMPACT_HEIGHT_CLASS[density];
  }

  return CARD_EDITOR_HEIGHT_CLASS[density];
}

interface CardPreviewSurfaceProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  value: string;
  emptyText: string;
  containerClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
}

export function CardPreviewSurface({
  eyebrow,
  title,
  value,
  emptyText,
  containerClassName = "flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white",
  headerClassName = `${SHARED_FEATURE_CLASS.alignBetweenGap3} border-b border-[#eeeeee] bg-[#fafafa] px-5 py-3 md:px-6`,
  bodyClassName = "flex-1 p-5 md:p-6",
  contentClassName,
}: CardPreviewSurfaceProps) {
  const hasContent = isRenderableRichContent(value);

  return (
    <section className={containerClassName}>
      <div className={headerClassName}>
        <p className={SHARED_FEATURE_CLASS.text13Emphasis}>{title}</p>
        {eyebrow ? (
          <p className="truncate text-[12px] font-medium text-[#888]">
            {eyebrow}
          </p>
        ) : null}
      </div>
      <div className={bodyClassName}>
        {hasContent ? (
          <MarkdownContent className={contentClassName}>
            {value}
          </MarkdownContent>
        ) : (
          <p className="text-[13px] leading-6 text-[#999]">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

function CardEditorPreviewComponent({
  label,
  value,
  previewHeightClassName,
}: {
  label: string;
  value: string;
  previewHeightClassName: string;
}) {
  return (
    <CardPreviewSurface
      title="미리보기"
      eyebrow={label}
      value={value}
      emptyText="작성한 내용이 오른쪽에 실제 카드처럼 표시됩니다."
      bodyClassName={`flex-1 p-3 md:p-4 ${previewHeightClassName}`}
    />
  );
}

export const CardEditorPreview = memo(CardEditorPreviewComponent);
CardEditorPreview.displayName = "CardEditorPreview";

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
      .card-rich-editor-content .tableWrapper {
        max-width: 100%;
        overflow-x: auto;
      }
      .card-rich-editor-content table {
        border-collapse: collapse;
        margin: 0.5rem 0;
        overflow: hidden;
        table-layout: auto;
        text-align: left;
        width: max-content;
        max-width: 100%;
      }
      .card-rich-editor-content table colgroup {
        display: none;
      }
      .card-rich-editor-content table col {
        min-width: 0 !important;
        width: auto !important;
      }
      .card-rich-editor-content th,
      .card-rich-editor-content td {
        border: 1px solid #dcdcdc;
        min-width: 0;
        padding: 0.25rem 0.4rem;
        position: relative;
        text-align: left;
        vertical-align: top;
        white-space: nowrap;
        width: auto;
      }
      .card-rich-editor-content th > *,
      .card-rich-editor-content td > * {
        margin: 0;
      }
      .card-rich-editor-content th {
        background: #f7f7f7;
        font-weight: 700;
      }
      .card-rich-editor-content .selectedCell::after {
        background: rgba(17, 17, 17, 0.08);
        bottom: 0;
        content: "";
        left: 0;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 2;
      }
      .card-rich-editor-content .column-resize-handle {
        background: #111;
        bottom: -1px;
        pointer-events: none;
        position: absolute;
        right: -2px;
        top: 0;
        width: 3px;
      }
      .card-rich-editor-image {
        display: block;
        margin: 0.5rem 0;
        max-width: 100%;
        position: relative;
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
        opacity: 0;
        padding: 3px 8px;
        position: absolute;
        transition: opacity 0.15s ease;
      }
      .card-rich-editor-image:hover .card-rich-editor-image-size,
      .card-rich-editor-image.is-selected .card-rich-editor-image-size {
        opacity: 1;
      }
    `}</style>
  );
}
