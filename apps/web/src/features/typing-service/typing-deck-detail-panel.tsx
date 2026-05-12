"use client";

import { useState } from "react";

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
    return <p className="text-[14px] text-[#888]">덱을 불러오는 중...</p>;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className="text-[14px] text-red-600">덱을 불러오지 못했습니다.</p>
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
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-semibold text-[#111]">
                {deck.title}
              </h2>
              <YeonBadge>{typingDeckBadge(deck)}</YeonBadge>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-[#666]">
              {deck.description || "설명이 없습니다."}
            </p>
            <p className="mt-2 text-[12px] text-[#888]">
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
          <p className="mt-3 text-[13px] text-red-600">
            {deleteDeck.error.message}
          </p>
        ) : null}
      </YeonSurface>

      <TypingDeckForm mode="edit" deck={deck} adminMode={adminMode} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#111]">문단 목록</h3>
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
