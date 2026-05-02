"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { CardDeckDetailResponse } from "@yeon/api-contract/card-decks";

import {
  AddCardsPanel,
  CardRow,
  DeckDetailHeader,
  DeleteDeckConfirm,
  ExportDeckPanel,
} from "./components";
import { useDeckDetail } from "./hooks";
import type { DeckDetailViewState } from "./types";

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
  const detailQuery = useDeckDetail(deckId);
  const state = toViewState(detailQuery);

  useEffect(() => {
    if (!isEditorOpen || window.matchMedia("(min-width: 1024px)").matches)
      return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditorOpen]);

  const handleRequestAdd = () => setEditorOpen(true);
  const handleCloseEditor = () => setEditorOpen(false);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="hidden border-b border-[#e5e5e5] px-5 py-3 md:block md:px-12">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <span className="text-[14px] font-semibold text-[#111]">
            YEON 카드
          </span>
          {state.kind === "ready" ? (
            <span className="text-[12px] text-[#888]">
              카드 {state.items.length}장
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-5 md:px-8 md:py-6 lg:px-10">
        {state.kind === "loading" ? (
          <p className="text-[14px] text-[#888]">불러오는 중...</p>
        ) : null}

        {state.kind === "error" ? (
          <p className="text-[14px] text-red-600">{state.message}</p>
        ) : null}

        {state.kind === "ready" ? (
          <>
            <div className="space-y-5">
              <DeckDetailHeader
                deck={state.deck}
                onOpenDelete={() => setDeleteOpen(true)}
                onRequestAdd={handleRequestAdd}
                onRequestExport={() => setExportOpen(true)}
              />

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[24px] font-semibold text-[#111] md:text-[18px]">
                      카드 목록
                    </h2>
                    <span className="rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[12px] font-semibold text-[#666]">
                      {state.items.length}
                    </span>
                  </div>
                  <span className="shrink-0 text-[15px] text-[#666] md:text-[13px] md:text-[#888]">
                    전체 {state.items.length}
                  </span>
                </div>

                {state.isEmpty ? (
                  <div className="rounded-xl border border-dashed border-[#e5e5e5] p-8 text-center">
                    <p className="text-[14px] font-medium text-[#111]">
                      아직 카드가 없습니다.
                    </p>
                    <p className="mt-2 text-[13px] text-[#888]">
                      카드 추가 버튼으로 첫 카드를 추가해주세요.
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestAdd}
                      className="mt-4 rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
                    >
                      카드 추가
                    </button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {state.items.map((item, index) => (
                      <li key={item.id}>
                        <CardRow
                          deckId={state.deck.id}
                          index={index + 1}
                          item={item}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* 모바일 FAB */}
            <button
              type="button"
              onClick={handleRequestAdd}
              className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-[30px] font-light leading-none text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#333] lg:hidden"
              aria-label="새 카드 추가"
            >
              +
            </button>

            {/* 모바일 바텀시트 */}
            {isEditorOpen ? (
              <div className="fixed inset-0 z-40 lg:hidden">
                <button
                  type="button"
                  aria-label="카드 작업 패널 닫기"
                  onClick={handleCloseEditor}
                  className="absolute inset-0 bg-black/20"
                />
                <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] border border-[#e5e5e5] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.12)]">
                  <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#d4d4d4]" />
                  <AddCardsPanel deckId={state.deck.id} surface="sheet" />
                </div>
              </div>
            ) : null}

            {/* 데스크톱 슬라이드 패널 */}
            {isEditorOpen ? (
              <>
                <button
                  type="button"
                  aria-label="패널 닫기"
                  onClick={handleCloseEditor}
                  className="fixed inset-0 z-30 hidden lg:block"
                />
                <div className="fixed right-0 top-0 z-40 hidden h-full w-[440px] flex-col border-l border-[#e5e5e5] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.08)] lg:flex">
                  <div className="flex shrink-0 items-center justify-end border-b border-[#f0f0f0] px-5 py-3">
                    <button
                      type="button"
                      onClick={handleCloseEditor}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] text-[#888] transition-colors hover:bg-[#f3f3f3] hover:text-[#111]"
                      aria-label="패널 닫기"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <AddCardsPanel deckId={state.deck.id} surface="sheet" />
                  </div>
                </div>
              </>
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
