"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { isRenderableRichContent } from "./card-content-utils";
import { CARD_EDITOR_COMPACT_CLASS } from "./card-rich-markdown-editor-view";
import { MarkdownContent } from "./markdown-content";

interface CardAddLivePreviewProps {
  frontText: string;
  backText: string;
}

export function CardAddPreviewFace({
  label,
  title,
  value,
  emptyText,
}: {
  label: string;
  title: string;
  value: string;
  emptyText: string;
}) {
  const hasContent = isRenderableRichContent(value);

  return (
    <section className={CARD_EDITOR_COMPACT_CLASS.previewFace}>
      <div className={CARD_EDITOR_COMPACT_CLASS.previewFaceHeader}>
        <p className={SHARED_FEATURE_CLASS.text13Emphasis}>{title}</p>
        <span className={CARD_EDITOR_COMPACT_CLASS.statusPill}>{label}</span>
      </div>
      <div className={CARD_EDITOR_COMPACT_CLASS.previewFaceBody}>
        {hasContent ? (
          <MarkdownContent>{value}</MarkdownContent>
        ) : (
          <p className={SHARED_FEATURE_CLASS.text13Soft}>{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export function CardAddLivePreview({
  frontText,
  backText,
}: CardAddLivePreviewProps) {
  return (
    <aside className={CARD_EDITOR_COMPACT_CLASS.previewRail}>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <CardAddPreviewFace
          label="앞면"
          title="카드 질문"
          value={frontText}
          emptyText="질문을 작성하면 카드 앞면에 표시됩니다."
        />
        <CardAddPreviewFace
          label="뒷면"
          title="카드 답변"
          value={backText}
          emptyText="답변을 작성하면 카드 뒷면에 표시됩니다."
        />
      </div>
    </aside>
  );
}
