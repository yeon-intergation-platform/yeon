"use client";
import { useCallback, useEffect, useState } from "react";
import type { YeonUseQueryResult as UseQueryResult } from "@yeon/ui/runtime/YeonQuery";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { deriveCardDeckListViewState } from "@yeon/ui/runtime/ports/card-deck";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { countGuestCardDecks } from "@/lib/guest-card-service-store";
import { useIsAuthenticated } from "./auth-context";
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

export function useCardServiceDecksScreenState() {
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

  const openCreate = useCallback(
    (source: string) => {
      setCreateOpen(true);
      trackEvent(analyticsEvents.cardDeckCreateOpen, {
        source,
        authenticated: isAuthenticated,
      });
    },
    [isAuthenticated]
  );

  const openManualMergeDialog = useCallback(() => {
    setMergeDialogOpen(true);
    trackEvent(analyticsEvents.cardDeckOpen, {
      source: "merge_guest_prompt",
      authenticated: isAuthenticated,
      guest_deck_count: guestDeckCount,
    });
  }, [guestDeckCount, isAuthenticated]);

  async function handleMergeDialogClose() {
    setMergeDialogOpen(false);
    const count = await refreshGuestDeckCount();
    setGuestDeckCount(count);
  }

  return {
    state,
    isAuthenticated,
    isCreateOpen,
    isSettingsOpen,
    isMergeDialogOpen,
    guestDeckCount,
    guestDeckCountError,
    showManualMergeButton:
      isAuthenticated &&
      !isMergeDialogOpen &&
      guestDeckCount !== null &&
      guestDeckCount > 0,
    openCreate,
    openSettings: () => setSettingsOpen(true),
    closeCreate: () => setCreateOpen(false),
    closeSettings: () => setSettingsOpen(false),
    openManualMergeDialog,
    handleMergeDialogClose,
  };
}

export type CardServiceDecksScreenState = ReturnType<
  typeof useCardServiceDecksScreenState
>;
