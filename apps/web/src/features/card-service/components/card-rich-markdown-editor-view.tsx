"use client";
import {
  YeonGlobalStyle,
  YeonView,
  YeonText,
  YEON_WEB_CSS_VALUE,
} from "@yeon/ui";
import { memo } from "react";
import type { ReactNode } from "react";
import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import { isRenderableRichContent } from "./card-content-utils";
import {
  CARD_MARKDOWN_TABLE_MIN_CELL_HEIGHT,
  CARD_MARKDOWN_TABLE_MIN_CELL_WIDTH,
  MarkdownContent,
} from "./markdown-content";

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
    "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white [contain:layout_paint]",
  previewFaceHeader:
    "flex min-h-12 items-center justify-between gap-2 border-b border-[#e5e5e5] px-3 py-2",
  previewFaceBody:
    "min-h-0 flex-1 overflow-auto px-3 py-3 text-[13px] leading-6 text-[#111]",
} as const;

const CARD_RICH_EDITOR_GLOBAL_STYLE = `
  .card-rich-editor-content .ProseMirror {
    min-height: inherit;
    outline: none;
  }
  .card-rich-editor-content .ProseMirror p.is-editor-empty:first-child::before {
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
    color: #666;
    margin: 0.75rem 0;
    padding-left: 0.75rem;
  }
  .card-rich-editor-content pre {
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 0.875rem;
    color: #111;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    line-height: 1.65;
    margin: 0.75rem 0;
    overflow-x: auto;
    padding: 2.25rem 0.875rem 0.875rem;
    position: relative;
    white-space: pre;
  }
  .card-rich-editor-content pre::before {
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 999px;
    color: #666;
    content: "코드 블록";
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    left: 0.75rem;
    letter-spacing: 0.08em;
    line-height: 1;
    padding: 0.3rem 0.55rem;
    position: absolute;
    text-transform: uppercase;
    top: 0.55rem;
  }
  .card-rich-editor-content pre code {
    background: transparent;
    border-radius: 0;
    display: block;
    font-family: inherit;
    padding: 0;
  }
  .card-rich-editor-content .card-rich-editor-code-block-node {
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 0.875rem;
    margin: 0.75rem 0;
    overflow: hidden;
  }
  .card-rich-editor-content .card-rich-editor-code-block-header {
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    padding: 0.45rem 0.65rem;
  }
  .card-rich-editor-content .card-rich-editor-code-block-label {
    color: #666;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }
  .card-rich-editor-content .card-rich-editor-code-block-language {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 0.5rem;
    color: #111;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    max-width: 180px;
    outline: none;
    padding: 0.3rem 0.45rem;
    text-transform: uppercase;
  }
  .card-rich-editor-content .card-rich-editor-code-block-node pre {
    border: 0;
    border-radius: 0;
    margin: 0;
    padding: 0.875rem;
  }
  .card-rich-editor-content .card-rich-editor-code-block-node pre::before {
    content: none;
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
    max-width: 100%;
    overflow: hidden;
    table-layout: auto;
    text-align: left;
    width: max-content;
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
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    height: ${CARD_MARKDOWN_TABLE_MIN_CELL_HEIGHT}px;
    line-height: 1.4;
    min-width: ${CARD_MARKDOWN_TABLE_MIN_CELL_WIDTH}px;
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
    background: #fafafa;
    font-weight: 700;
  }
  .card-rich-editor-content .selectedCell::after {
    background: ${YEON_WEB_CSS_VALUE.selectedCellBackground};
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
    cursor: pointer;
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
    border: 2px solid #ffffff;
    border-radius: 999px;
    bottom: -9px;
    box-shadow: ${YEON_WEB_CSS_VALUE.imageHandleShadow};
    cursor: nwse-resize;
    height: 18px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: -9px;
    touch-action: none;
    transition: opacity 0.12s ease;
    width: 18px;
  }
  .card-rich-editor-image.is-selected .card-rich-editor-image-handle,
  .card-rich-editor-image.is-resizing .card-rich-editor-image-handle {
    opacity: 1;
    pointer-events: auto;
  }
  .card-rich-editor-image-size {
    background: ${YEON_WEB_CSS_VALUE.imageSizeBackground};
    border-radius: 999px;
    bottom: 8px;
    color: #ffffff;
    font-size: 11px;
    left: 8px;
    opacity: 0;
    padding: 3px 8px;
    pointer-events: none;
    position: absolute;
    transition: opacity 0.12s ease;
  }
  .card-rich-editor-image.is-resizing .card-rich-editor-image-size {
    opacity: 1;
  }
`;

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
  onCodeLanguageChange?: (index: number, language: string) => void;
}

export function CardPreviewSurface({
  eyebrow,
  title,
  value,
  emptyText,
  containerClassName = "flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white",
  headerClassName = `${SHARED_FEATURE_CLASS.alignBetweenGap3} border-b border-[#e5e5e5] bg-[#fafafa] px-5 py-3 md:px-6`,
  bodyClassName = "flex-1 p-5 md:p-6",
  contentClassName,
  onCodeLanguageChange,
}: CardPreviewSurfaceProps) {
  const hasContent = isRenderableRichContent(value);

  return (
    <YeonView as="section" className={containerClassName}>
      <YeonView className={headerClassName}>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13Emphasis}
        >
          {title}
        </YeonText>
        {eyebrow ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="truncate text-[12px] font-medium text-[#aaa]"
          >
            {eyebrow}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonView className={bodyClassName}>
        {hasContent ? (
          <MarkdownContent
            className={contentClassName}
            onCodeLanguageChange={onCodeLanguageChange}
          >
            {value}
          </MarkdownContent>
        ) : (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] leading-6 text-[#aaa]"
          >
            {emptyText}
          </YeonText>
        )}
      </YeonView>
    </YeonView>
  );
}

function CardEditorPreviewComponent({
  label,
  value,
  previewHeightClassName,
  onCodeLanguageChange,
}: {
  label: string;
  value: string;
  previewHeightClassName: string;
  onCodeLanguageChange?: (index: number, language: string) => void;
}) {
  return (
    <CardPreviewSurface
      title="미리보기"
      eyebrow={label}
      value={value}
      emptyText="작성한 내용이 오른쪽에 실제 카드처럼 표시됩니다."
      bodyClassName={`flex-1 overflow-auto p-3 md:p-4 ${previewHeightClassName}`}
      onCodeLanguageChange={onCodeLanguageChange}
    />
  );
}

export const CardEditorPreview = memo(CardEditorPreviewComponent);
CardEditorPreview.displayName = "CardEditorPreview";

export function CardRichEditorGlobalStyles() {
  return (
    <YeonGlobalStyle
      id="card-rich-editor"
      css={CARD_RICH_EDITOR_GLOBAL_STYLE}
    />
  );
}
