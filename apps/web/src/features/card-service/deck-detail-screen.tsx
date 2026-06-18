"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import type { YeonUseQueryResult as UseQueryResult } from "@yeon/ui/runtime/YeonQuery";
import type { CardDeckDetailResponse } from "@yeon/api-contract/card-decks";
import {
  YeonButton,
  YeonView,
  YeonList,
  YeonListItem,
  YeonText,
} from "@yeon/ui";
import { showYeonConfirm } from "@yeon/ui/runtime/YeonBrowserRuntime";
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
import { deriveCardDeckDetailViewState } from "@yeon/ui/runtime/ports/card-deck";
import { useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CommonProductHeader } from "@/components/product-shell/product-header";

// 분기 로직은 SSOT에서 파생한다(web/mobile 공용). 복제 금지.
function toViewState(
  query: UseQueryResult<CardDeckDetailResponse>
): DeckDetailViewState {
  return deriveCardDeckDetailViewState({
    isPending: query.isPending,
    isError: query.isError,
    data: query.data,
  });
}

interface DeckDetailScreenProps {
  deckId: string;
}

export function DeckDetailScreen({ deckId }: DeckDetailScreenProps) {
  const router = useYeonRouter();
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
      !showYeonConfirm(
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
      !showYeonConfirm(
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
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader
        activeService="card"
        rightExtras={
          state.kind === "ready" ? (
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Soft}
            >
              카드 {state.items.length}장
            </YeonText>
          ) : null
        }
      />

      <YeonView
        as="main"
        className="mx-auto max-w-5xl px-5 py-5 md:px-8 md:py-6 lg:px-10"
      >
        {state.kind === "loading" ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text14Soft}
          >
            불러오는 중...
          </YeonText>
        ) : null}

        {state.kind === "error" ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={CARD_SERVICE_COMMON_CLASS.errorTextMd}
          >
            {state.message}
          </YeonText>
        ) : null}

        {state.kind === "ready" ? (
          <>
            <YeonView className="space-y-6">
              <DeckDetailHeader
                deck={state.deck}
                onOpenDelete={() => setDeleteOpen(true)}
                onRequestExport={() => setExportOpen(true)}
              />

              <YeonView as="section">
                <YeonView className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <YeonView className="flex items-center gap-2">
                    <YeonText
                      as="h2"
                      variant="unstyled"
                      tone="inherit"
                      className={CARD_SERVICE_COMMON_CLASS.sectionBodyTitleMd}
                    >
                      카드 목록
                    </YeonText>
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className={CARD_SERVICE_COMMON_CLASS.sectionBadge}
                    >
                      {state.items.length}
                    </YeonText>
                  </YeonView>
                  <YeonView className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className="shrink-0 text-[15px] text-[#666] md:text-[14px]"
                    >
                      전체 {state.items.length}
                    </YeonText>
                    <YeonButton
                      type="button"
                      onClick={() => {
                        openCardEditor();
                      }}
                      variant="primary"
                      size="md"
                    >
                      + 카드 추가
                    </YeonButton>
                  </YeonView>
                </YeonView>

                {state.isEmpty ? (
                  <YeonView className="rounded-[24px] border border-dashed border-[#e5e5e5] p-8 text-center md:p-10">
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className={CARD_SERVICE_COMMON_CLASS.panelNoticeText}
                    >
                      아직 카드가 없습니다.
                    </YeonText>
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className="mt-3 text-[14px] leading-6 text-[#666] md:text-[15px]"
                    >
                      카드 추가 버튼을 눌러 첫 카드부터 질문과 답변을
                      작성해보세요.
                    </YeonText>
                    <YeonButton
                      type="button"
                      onClick={() => {
                        openCardEditor("empty_state");
                      }}
                      variant="primary"
                      size="lg"
                      className="mt-6"
                    >
                      카드 추가
                    </YeonButton>
                  </YeonView>
                ) : (
                  <YeonList className="flex flex-col gap-4">
                    {state.items.map((item, index) => (
                      <YeonListItem key={item.id}>
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
                      </YeonListItem>
                    ))}
                  </YeonList>
                )}
              </YeonView>
            </YeonView>

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
      </YeonView>
    </YeonView>
  );
}
