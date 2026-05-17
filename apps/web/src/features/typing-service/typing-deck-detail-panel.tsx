"use client";

import { useState } from "react";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

import { YeonBadge, YeonButton, YeonSurface } from "@/components/yeon-ui";
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
      <p className={TYPING_SERVICE_COMMON_CLASS.panelMetaText}>
        덱을 불러오는 중...
      </p>
    );
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className={TYPING_SERVICE_COMMON_CLASS.textError}>
        덱을 불러오지 못했습니다.
      </p>
    );
  }

  const { deck, passages } = detailQuery.data;
  const readonly = !deck.canEdit;
  const deleteDeckLabel = deleteDeck.isPending ? "삭제 중..." : "덱 삭제";

  return (
    <div className="space-y-5">
      <YeonSurface as="section" variant="panel" className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
              <h2 className={SHARED_FEATURE_CLASS.headingText22Emphasis}>
                {deck.title}
              </h2>
              <YeonBadge>{typingDeckBadge(deck)}</YeonBadge>
            </div>
            <p
              className={`mt-2 leading-6 ${SHARED_FEATURE_CLASS.text13Neutral}`}
            >
              {deck.description || "설명이 없습니다."}
            </p>
            <p className={`mt-2 ${SHARED_FEATURE_CLASS.text12Soft}`}>
              {typingDeckLanguageLabel(deck.languageTag)} · 문단{" "}
              {passages.length}개
            </p>
          </div>
          {!readonly ? (
            <YeonButton
              type="button"
              onClick={() => deleteDeck.mutate(deck.id)}
              variant="danger"
            >
              {deleteDeckLabel}
            </YeonButton>
          ) : null}
        </div>
        {deleteDeck.error ? (
          <p className={TYPING_SERVICE_COMMON_CLASS.textErrorWithSpacing}>
            {deleteDeck.error.message}
          </p>
        ) : null}
      </YeonSurface>

      <TypingDeckForm mode="edit" deck={deck} adminMode={adminMode} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}>
              문단 목록
            </h3>
            <YeonBadge>{passages.length}</YeonBadge>
          </div>
          <TypingDeckPassageList
            deckId={deck.id}
            passages={passages}
            onEdit={setEditingPassage}
            readonly={readonly}
            adminMode={adminMode}
          />
        </div>
        {!readonly ? (
          <aside className="space-y-5 lg:sticky lg:top-5">
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
          </aside>
        ) : null}
      </section>
    </div>
  );
}
