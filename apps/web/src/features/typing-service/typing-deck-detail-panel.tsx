"use client";
import { useState } from "react";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import {
  YeonBadge,
  YeonButton,
  YeonSurface,
  YeonView,
  YeonText,
} from "@yeon/ui";
import {
  type TypingDeckPassageDto,
  useDeleteTypingDeck,
  useTypingDeckDetail,
} from "./use-typing-decks";
import { TypingDeckBulkPassageImportForm } from "./typing-deck-bulk-passage-import-form";
import { TypingDeckForm } from "./typing-deck-form";
import { typingDeckBadge, typingDeckLanguageLabel } from "./typing-deck-meta";
import { TypingDeckPassageEditor } from "./typing-deck-passage-editor";
import { TypingDeckPassageList } from "./typing-deck-passage-list";

export type TypingDeckDetailPanelProps = {
  deckId: string;
  adminMode?: boolean;
};

export function TypingDeckDetailPanel({
  deckId,
  adminMode = false,
}: TypingDeckDetailPanelProps) {
  const detailQuery = useTypingDeckDetail(deckId, adminMode);
  const deleteDeck = useDeleteTypingDeck(adminMode);
  const [editingPassage, setEditingPassage] =
    useState<TypingDeckPassageDto | null>(null);

  if (detailQuery.isPending) {
    return (
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={TYPING_SERVICE_COMMON_CLASS.panelMetaText}
      >
        덱을 불러오는 중...
      </YeonText>
    );
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={TYPING_SERVICE_COMMON_CLASS.textError}
      >
        덱을 불러오지 못했습니다.
      </YeonText>
    );
  }

  const { deck, passages } = detailQuery.data;
  const readonly = !deck.canEdit;
  const deleteDeckLabel = deleteDeck.isPending ? "삭제 중..." : "덱 삭제";

  return (
    <YeonView className="space-y-5">
      <YeonSurface as="section" variant="panel" className="p-5">
        <YeonView className="flex flex-wrap items-start justify-between gap-3">
          <YeonView>
            <YeonView className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.headingText22Emphasis}
              >
                {deck.title}
              </YeonText>
              <YeonBadge>{typingDeckBadge(deck)}</YeonBadge>
            </YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-2 leading-6 ${SHARED_FEATURE_CLASS.text13Neutral}`}
            >
              {deck.description || "설명이 없습니다."}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-2 ${SHARED_FEATURE_CLASS.text12Soft}`}
            >
              {typingDeckLanguageLabel(deck.languageTag)} · 문단{" "}
              {passages.length}개
            </YeonText>
          </YeonView>
          {!readonly ? (
            <YeonButton
              type="button"
              onClick={() => deleteDeck.mutate(deck.id)}
              variant="danger"
            >
              {deleteDeckLabel}
            </YeonButton>
          ) : null}
        </YeonView>
        {deleteDeck.error ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.textErrorWithSpacing}
          >
            {deleteDeck.error.message}
          </YeonText>
        ) : null}
      </YeonSurface>

      <TypingDeckForm mode="edit" deck={deck} adminMode={adminMode} />

      <YeonView
        as="section"
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
      >
        <YeonView>
          <YeonView className="mb-3 flex items-center justify-between">
            <YeonText
              as="h3"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}
            >
              문단 목록
            </YeonText>
            <YeonBadge>{passages.length}</YeonBadge>
          </YeonView>
          <TypingDeckPassageList
            deckId={deck.id}
            passages={passages}
            onEdit={setEditingPassage}
            readonly={readonly}
            adminMode={adminMode}
          />
        </YeonView>
        {!readonly ? (
          <YeonView as="aside" className="space-y-5 lg:sticky lg:top-5">
            <TypingDeckPassageEditor
              deckId={deck.id}
              editingPassage={editingPassage}
              onCancelEdit={() => setEditingPassage(null)}
              adminMode={adminMode}
            />
            <TypingDeckBulkPassageImportForm
              deckId={deck.id}
              adminMode={adminMode}
            />
          </YeonView>
        ) : null}
      </YeonView>
    </YeonView>
  );
}
