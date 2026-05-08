"use client";

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
import { useDeckDetail } from "./hooks";
import type { DeckDetailViewState } from "./types";
import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="hidden border-b border-[#e5e5e5] px-5 py-3 md:block md:px-12">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <span className="text-[14px] font-semibold text-[#111]">
            YEON 카드
          </span>
          {state.kind === "ready" ? (
            <span className="text-[13px] text-[#888]">
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
            <div className="space-y-6">
              <DeckDetailHeader
                deck={state.deck}
                onOpenDelete={() => setDeleteOpen(true)}
                onRequestExport={() => setExportOpen(true)}
              />

              <section className="rounded-[28px] border border-[#efefef] bg-[#fcfcfc] px-5 py-5 md:px-6 md:py-6">
                <div className="mx-auto max-w-[760px] text-center">
                  <p className="text-[14px] font-medium text-[#666] md:text-[15px]">
                    새 카드는 화면 중앙 모달에서 질문, 답변, Markdown, 이미지를
                    함께 작성합니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditorOpen(true)}
                    className="mt-4 inline-flex items-center justify-center rounded-[22px] bg-[#111] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#333] md:min-w-[220px] md:text-[16px]"
                  >
                    + 카드 추가
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[24px] font-semibold text-[#111] md:text-[26px]">
                      카드 목록
                    </h2>
                    <span className="rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[12px] font-semibold text-[#666] md:text-[13px]">
                      {state.items.length}
                    </span>
                  </div>
                  <span className="shrink-0 text-[15px] text-[#666] md:text-[14px] md:text-[#888]">
                    전체 {state.items.length}
                  </span>
                </div>

                {state.isEmpty ? (
                  <div className="rounded-[24px] border border-dashed border-[#e5e5e5] p-8 text-center md:p-10">
                    <p className="text-[18px] font-semibold text-[#111] md:text-[20px]">
                      아직 카드가 없습니다.
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-[#888] md:text-[15px]">
                      카드 추가 버튼을 눌러 첫 카드부터 중앙 모달에서 바로
                      작성해보세요.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditorOpen(true)}
                      className="mt-5 rounded-[22px] bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
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
