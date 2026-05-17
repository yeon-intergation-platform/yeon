"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UseQueryResult } from "@tanstack/react-query";
import type { CardDeckDetailResponse } from "@yeon/api-contract/card-decks";

import {
  AddCardsPanel,
  CardRow,
  DeckDetailHeader,
  DeleteDeckConfirm,
  ExportDeckPanel,
} from "./components";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import { useDeckDetail } from "./hooks";
import type { DeckDetailViewState } from "./types";
import { useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { PLATFORM_HOME_HREF } from "@/lib/platform-services";

function toViewState(
  query: UseQueryResult<CardDeckDetailResponse>
): DeckDetailViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError || !query.data) {
    return { kind: "error", message: "덱을 불러오지 못했습니다." };
  }
  const items = query.data.items;
  return {
    kind: "ready",
    deck: query.data.deck,
    items,
    isEmpty: items.length === 0,
  };
}

interface DeckDetailScreenProps {
  deckId: string;
}

export function DeckDetailScreen({ deckId }: DeckDetailScreenProps) {
  const router = useRouter();
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardDirty, setEditingCardDirty] = useState(false);
  const detailQuery = useDeckDetail(deckId);
  const state = toViewState(detailQuery);

  const openCardEditor = (source = "card_list_header") => {
    if (
      editingCardDirty &&
      !window.confirm(
        "수정 중인 카드 내용이 있습니다. 카드 추가를 열면 현재 편집을 닫습니다. 계속할까요?"
      )
    ) {
      return;
    }
    setEditingCardId(null);
    setEditingCardDirty(false);
    setEditorOpen(true);
    trackEvent(analyticsEvents.cardAddOpen, {
      deck_id: deckId,
      source,
    });
  };

  const requestInlineEdit = (itemId: string) => {
    if (editingCardId === itemId) return true;
    if (
      editingCardDirty &&
      !window.confirm(
        "수정 중인 카드 내용이 있습니다. 저장하지 않고 다른 카드를 수정할까요?"
      )
    ) {
      return false;
    }
    setEditorOpen(false);
    setEditingCardId(itemId);
    setEditingCardDirty(false);
    return true;
  };

  const closeInlineEdit = () => {
    setEditingCardId(null);
    setEditingCardDirty(false);
  };

  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <header className="hidden border-b border-[#e5e5e5] px-5 py-3 md:block md:px-12">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link
            href={PLATFORM_HOME_HREF}
            className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} no-underline transition-colors hover:opacity-70`}
          >
            YEON 카드
          </Link>
          {state.kind === "ready" ? (
            <span className={SHARED_FEATURE_CLASS.text13Soft}>
              카드 {state.items.length}장
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-5 md:px-8 md:py-6 lg:px-10">
        {state.kind === "loading" ? (
          <p className={SHARED_FEATURE_CLASS.text14Soft}>불러오는 중...</p>
        ) : null}

        {state.kind === "error" ? (
          <p className={CARD_SERVICE_COMMON_CLASS.errorTextMd}>
            {state.message}
          </p>
        ) : null}

        {state.kind === "ready" ? (
          <>
            <div className="space-y-6">
              <DeckDetailHeader
                deck={state.deck}
                onOpenDelete={() => setDeleteOpen(true)}
                onRequestExport={() => setExportOpen(true)}
              />

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2
                      className={CARD_SERVICE_COMMON_CLASS.sectionBodyTitleMd}
                    >
                      카드 목록
                    </h2>
                    <span className={CARD_SERVICE_COMMON_CLASS.sectionBadge}>
                      {state.items.length}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <span className="shrink-0 text-[15px] text-[#666] md:text-[14px] md:text-[#888]">
                      전체 {state.items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        openCardEditor();
                      }}
                      className={
                        CARD_SERVICE_COMMON_CLASS.actionButtonPrimaryInline
                      }
                    >
                      + 카드 추가
                    </button>
                  </div>
                </div>

                {state.isEmpty ? (
                  <div className="rounded-[24px] border border-dashed border-[#e5e5e5] p-8 text-center md:p-10">
                    <p className={CARD_SERVICE_COMMON_CLASS.panelNoticeText}>
                      아직 카드가 없습니다.
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-[#888] md:text-[15px]">
                      카드 추가 버튼을 눌러 첫 카드부터 질문과 답변을
                      작성해보세요.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        openCardEditor("empty_state");
                      }}
                      className={
                        CARD_SERVICE_COMMON_CLASS.actionButtonPrimaryLarge
                      }
                    >
                      카드 추가
                    </button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {state.items.map((item, index) => (
                      <li key={item.id}>
                        <CardRow
                          deckId={state.deck.id}
                          index={index + 1}
                          item={item}
                          isEditing={editingCardId === item.id}
                          onRequestEdit={requestInlineEdit}
                          onCloseEdit={closeInlineEdit}
                          onDirtyChange={(itemId, dirty) => {
                            if (editingCardId === itemId) {
                              setEditingCardDirty(dirty);
                            }
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {isEditorOpen ? (
              <AddCardsPanel
                deckId={state.deck.id}
                onClose={() => setEditorOpen(false)}
              />
            ) : null}

            {isExportOpen ? (
              <ExportDeckPanel
                items={state.items}
                onClose={() => setExportOpen(false)}
              />
            ) : null}

            {isDeleteOpen ? (
              <DeleteDeckConfirm
                deckId={state.deck.id}
                deckTitle={state.deck.title}
                onClose={() => setDeleteOpen(false)}
                onDeleted={() => {
                  router.push("/card-service");
                }}
              />
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
