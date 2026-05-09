"use client";

import { useCallback, useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { countGuestCardDecks } from "@/lib/guest-card-service-store";

import { CARD_SERVICE_FAQS } from "./card-service-content";
import { useIsAuthenticated } from "./auth-context";
import {
  CardServiceSettingsDialog,
  CreateDeckDialog,
  DeckList,
  EmptyDecksScreen,
  MergeGuestDialog,
} from "./components";
import { useDeckList } from "./hooks";
import type { CardServiceHomeViewState } from "./types";

function toViewState(
  query: UseQueryResult<CardDeckDto[]>
): CardServiceHomeViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError) {
    return { kind: "error", message: "덱 목록을 불러오지 못했습니다." };
  }
  if (!query.data || query.data.length === 0) {
    return { kind: "empty" };
  }
  return { kind: "ready", decks: query.data };
}

const CARD_SERVICE_HIGHLIGHTS = [
  {
    title: "로그인 없이 덱 생성",
    description:
      "비로그인 상태에서는 이 기기에 덱을 저장하고 바로 카드 학습을 시작할 수 있습니다.",
  },
  {
    title: "로그인 후 계정으로 이어쓰기",
    description:
      "게스트 상태에서 만든 덱도 로그인 이후 계정으로 옮겨 같은 학습 흐름을 이어갈 수 있습니다.",
  },
  {
    title: "단어 암기와 개념 복습",
    description:
      "앞뒷면 카드를 빠르게 추가하고, 반복 확인이 필요한 단어·개념 학습에 바로 활용할 수 있습니다.",
  },
] as const;

export function CardServiceHome() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [guestDeckCount, setGuestDeckCount] = useState<number | null>(null);
  const [isMergeDialogOpen, setMergeDialogOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const state = toViewState(decksQuery);

  const refreshGuestDeckCount = useCallback(async () => {
    try {
      const count = await countGuestCardDecks();
      return count;
    } catch (error) {
      console.error("guest 덱 개수를 확인하지 못했습니다.", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestDeckCount(null);
      setMergeDialogOpen(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const count = await refreshGuestDeckCount();
      if (cancelled) {
        return;
      }
      setGuestDeckCount(count);
      if (count !== null && count > 0) {
        setMergeDialogOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshGuestDeckCount]);

  async function handleMergeDialogClose() {
    setMergeDialogOpen(false);
    const count = await refreshGuestDeckCount();
    setGuestDeckCount(count);
  }

  const showManualMergeButton =
    isAuthenticated &&
    !isMergeDialogOpen &&
    guestDeckCount !== null &&
    guestDeckCount > 0;
  const openCreate = (source: string) => {
    setCreateOpen(true);
    trackEvent(analyticsEvents.cardDeckCreateOpen, {
      source,
      authenticated: isAuthenticated,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <span className="text-[14px] font-semibold text-[#111]">
            YEON 카드
          </span>
          <div className="flex items-center gap-2">
            {showManualMergeButton ? (
              <button
                type="button"
                onClick={() => {
                  setMergeDialogOpen(true);
                  trackEvent(analyticsEvents.cardDeckOpen, {
                    source: "merge_guest_prompt",
                    authenticated: isAuthenticated,
                    guest_deck_count: guestDeckCount,
                  });
                }}
                className="rounded-xl border border-[rgba(17,19,24,0.12)] bg-[rgba(232,99,10,0.08)] px-3 py-2 text-[12px] font-semibold text-[#a3430a] transition-colors hover:bg-[rgba(232,99,10,0.16)]"
              >
                게스트 덱 {guestDeckCount}개 계정에 추가
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => openCreate("header")}
              className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
            >
              + 새 덱
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              설정
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-12 md:px-12">
        <section className="max-w-[820px]">
          <span className="inline-flex rounded-full border border-[#e5e5e5] px-3 py-1 text-[11px] font-semibold text-[#555]">
            공개형 플래시카드 학습
          </span>
          <h1 className="mt-4 text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]">
            로그인 없이 바로 만드는 플래시카드 덱
          </h1>
          <p className="mt-4 max-w-[720px] text-[14px] leading-[1.8] text-[#666] md:text-[15px]">
            플래시카드로 단어 암기와 반복 학습을 바로 시작할 수 있는 카드 학습
            서비스입니다. 로그인 없이 이 기기에서 덱을 만들고, 로그인하면
            계정으로 옮겨 계속 학습할 수 있습니다.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {CARD_SERVICE_HIGHLIGHTS.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5"
              >
                <h2 className="text-[15px] font-semibold text-[#111]">
                  {highlight.title}
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  {highlight.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[22px] font-semibold text-[#111]">
            {isAuthenticated ? "내 덱" : "로그인 없이 만드는 덱"}
          </h2>
          <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
            플래시카드로 단어 암기와 반복 학습을 바로 시작할 수 있습니다.
            {!isAuthenticated
              ? " 지금 만든 덱은 이 기기에만 저장되며, 로그인하면 계정으로 옮겨 계속 학습할 수 있어요."
              : " 만든 덱과 카드를 열어 바로 복습 흐름으로 이어갈 수 있어요."}
          </p>
          <div className="mt-6">
            {state.kind === "loading" ? (
              <p className="text-[14px] text-[#888]">불러오는 중...</p>
            ) : null}
            {state.kind === "error" ? (
              <p className="text-[14px] text-red-600">{state.message}</p>
            ) : null}
            {state.kind === "empty" ? (
              <EmptyDecksScreen onCreate={() => openCreate("empty_state")} />
            ) : null}
            {state.kind === "ready" ? <DeckList decks={state.decks} /> : null}
          </div>
        </section>

        <section className="mt-14 max-w-[820px] rounded-[28px] border border-[#e5e5e5] bg-[#fafafa] p-6 md:p-8">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111]">
            자주 묻는 질문
          </h2>
          <div className="mt-5 grid gap-4">
            {CARD_SERVICE_FAQS.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-white bg-white p-5"
              >
                <h3 className="text-[15px] font-semibold text-[#111]">
                  {faq.question}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.8] text-[#666]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isCreateOpen ? (
        <CreateDeckDialog onClose={() => setCreateOpen(false)} />
      ) : null}

      {isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}

      {isMergeDialogOpen && guestDeckCount !== null && guestDeckCount > 0 ? (
        <MergeGuestDialog
          guestDeckCount={guestDeckCount}
          onClose={() => {
            void handleMergeDialogClose();
          }}
        />
      ) : null}
    </div>
  );
}
