"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useCallback, useEffect, useState } from "react";
import type { YeonUseQueryResult as UseQueryResult } from "@yeon/ui/runtime/YeonQuery";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { deriveCardDeckListViewState } from "@yeon/ui/runtime/ports/card-deck";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  YeonButton,
  YeonText,
  YeonView,
  YeonProductHeaderActionButton,
  YeonLink,
} from "@yeon/ui";
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

function getGuestDeckCountErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return `게스트 덱 개수를 확인하지 못했습니다. 원인: ${error.message}`;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `게스트 덱 개수를 확인하지 못했습니다. 원인: ${error.trim()}`;
  }

  return `게스트 덱 개수를 확인하지 못했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

function toViewState(
  query: UseQueryResult<CardDeckDto[]>
): CardServiceHomeViewState {
  // 분기 로직은 SSOT에서 파생한다(web/mobile 공용). 복제 금지.
  return deriveCardDeckListViewState({
    isPending: query.isPending,
    isError: query.isError,
    data: query.data,
  });
}

export function CardServiceDecksScreen() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [guestDeckCount, setGuestDeckCount] = useState<number | null>(null);
  const [guestDeckCountError, setGuestDeckCountError] = useState<string | null>(
    null
  );
  const [isMergeDialogOpen, setMergeDialogOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const state = toViewState(decksQuery);

  const refreshGuestDeckCount = useCallback(async () => {
    try {
      const count = await countGuestCardDecks();
      return count;
    } catch (error) {
      const message = getGuestDeckCountErrorMessage(error);
      console.error(message, error);
      setGuestDeckCountError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestDeckCount(null);
      setGuestDeckCountError(null);
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
      if (count !== null) {
        setGuestDeckCountError(null);
      }
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
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader
        activeService="card"
        rightExtras={
          <>
            {showManualMergeButton ? (
              <YeonButton
                type="button"
                onClick={() => {
                  setMergeDialogOpen(true);
                  trackEvent(analyticsEvents.cardDeckOpen, {
                    source: "merge_guest_prompt",
                    authenticated: isAuthenticated,
                    guest_deck_count: guestDeckCount,
                  });
                }}
                variant="secondary"
                size="sm"
                className="rounded-xl px-3 py-2 text-[12px]"
              >
                게스트 덱 {guestDeckCount}개 계정에 추가
              </YeonButton>
            ) : null}
          </>
        }
        settingsControl={
          <YeonProductHeaderActionButton
            onClick={() => setSettingsOpen(true)}
            aria-label="카드 설정"
          />
        }
      />

      <YeonView
        as="main"
        className="mx-auto max-w-[1400px] px-6 pb-28 pt-7 md:px-12"
      >
        <YeonView as="section" className="max-w-[820px]">
          <YeonLink
            href={resolveYeonWebPath("cardHome")}
            className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              aria-hidden="true"
            >
              ←
            </YeonText>
            카드 홈으로
          </YeonLink>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-3 break-keep text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]"
          >
            덱을 만들고 바로 복습하세요
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-4 max-w-[720px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8] md:text-[15px]`}
          >
            필요한 덱을 선택하거나 새로 만들어 바로 시작해보세요.
          </YeonText>
        </YeonView>

        <YeonView as="section" className="mt-9 border-t border-[#e5e5e5] pt-8">
          <YeonView className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <YeonView>
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className="break-keep text-[18px] font-bold text-[#111]"
              >
                {isAuthenticated ? "내 덱" : "로그인 없이 만드는 덱"}
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 break-keep leading-[1.7]`}
              >
                덱을 열어 카드를 추가하고 바로 복습을 시작할 수 있습니다.
                {!isAuthenticated
                  ? " 지금 만든 덱은 이 기기에만 저장되며, 로그인하면 계정으로 옮겨 계속 학습할 수 있어요."
                  : " 만든 덱과 카드를 열어 바로 복습 흐름으로 이어갈 수 있어요."}
              </YeonText>
            </YeonView>
            {state.kind === "empty" ? null : (
              <YeonButton
                type="button"
                onClick={() => openCreate("deck_section")}
                variant="primary"
                size="md"
                className="h-11 shrink-0 rounded-xl px-5 text-[13px]"
              >
                새 덱 만들기
              </YeonButton>
            )}
          </YeonView>
          <YeonView className="mt-6">
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
                variant="caption"
                tone="primary"
                className="text-[14px] font-semibold"
              >
                {state.message}
              </YeonText>
            ) : null}
            {guestDeckCountError ? (
              <YeonText
                as="p"
                variant="caption"
                tone="primary"
                className="mb-3 text-[13px] font-semibold"
              >
                {guestDeckCountError}
              </YeonText>
            ) : null}
            {state.kind === "empty" ? (
              <EmptyDecksScreen onCreate={() => openCreate("empty_state")} />
            ) : null}
            {state.kind === "ready" ? <DeckList decks={state.decks} /> : null}
          </YeonView>
        </YeonView>
      </YeonView>

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
    </YeonView>
  );
}
