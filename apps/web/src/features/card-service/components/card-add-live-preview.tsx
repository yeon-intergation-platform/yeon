"use client";
import { YeonView, YeonText } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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
    <YeonView as="section" className={CARD_EDITOR_COMPACT_CLASS.previewFace}>
      <YeonView className={CARD_EDITOR_COMPACT_CLASS.previewFaceHeader}>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13Emphasis}
        >
          {title}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={CARD_EDITOR_COMPACT_CLASS.statusPill}
        >
          {label}
        </YeonText>
      </YeonView>
      <YeonView className={CARD_EDITOR_COMPACT_CLASS.previewFaceBody}>
        {hasContent ? (
          <MarkdownContent>{value}</MarkdownContent>
        ) : (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Soft}
          >
            {emptyText}
          </YeonText>
        )}
      </YeonView>
    </YeonView>
  );
}

export function CardAddLivePreview({
  frontText,
  backText,
}: CardAddLivePreviewProps) {
  return (
    <YeonView as="aside" className={CARD_EDITOR_COMPACT_CLASS.previewRail}>
      <YeonView className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
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
      </YeonView>
    </YeonView>
  );
}
