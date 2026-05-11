"use client";

import { useCallback, useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  CommonProductHeader,
  ProductHeaderSettingsButton,
} from "@/components/product-shell/product-header";
import { countGuestCardDecks } from "@/lib/guest-card-service-store";

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
      <CommonProductHeader
        activeService="card"
        rightExtras={
          <>
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
          </>
        }
        settingsControl={
          <ProductHeaderSettingsButton
            onClick={() => setSettingsOpen(true)}
            aria-label="카드 설정"
          />
        }
      />

      <main className="mx-auto max-w-[1400px] px-6 py-12 md:px-12">
        <section className="max-w-[820px]">
          <h1 className="mt-4 text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]">
            덱을 만들고 바로 복습하세요
          </h1>
          <p className="mt-4 max-w-[720px] text-[14px] leading-[1.8] text-[#666] md:text-[15px]">
            필요한 덱을 선택하거나 새로 만들어 바로 시작해보세요.
          </p>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-[#111]">
                {isAuthenticated ? "내 덱" : "로그인 없이 만드는 덱"}
              </h2>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                덱을 열어 카드를 추가하고 바로 복습을 시작할 수 있습니다.
                {!isAuthenticated
                  ? " 지금 만든 덱은 이 기기에만 저장되며, 로그인하면 계정으로 옮겨 계속 학습할 수 있어요."
                  : " 만든 덱과 카드를 열어 바로 복습 흐름으로 이어갈 수 있어요."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreate("deck_section")}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#111] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
            >
              + 새 덱
            </button>
          </div>
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
