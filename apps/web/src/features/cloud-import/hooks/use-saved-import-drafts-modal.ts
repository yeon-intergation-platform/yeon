"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { LocalImportDraftListItem } from "../cloud-import-draft-display";
import { LOADING_FEEDBACK_DELAY_MS } from "../cloud-import-layout-constants";
import { cloudImportQueryKeys } from "../cloud-import-query-keys";
import { deleteImportDraft, loadLocalImportDrafts } from "./cloud-import-fetch";
import type { UseLocalImportReturn } from "./use-local-import";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";

interface UseSavedImportDraftsModalParams {
  localImport: UseLocalImportReturn;
  onDraftDiscarded?: () => void;
}

export function useSavedImportDraftsModal({
  localImport,
  onDraftDiscarded,
}: UseSavedImportDraftsModalParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshPending, setIsRefreshPending] = useState(false);
  const [deletingDraftIds, setDeletingDraftIds] = useState<string[]>([]);
  const [shouldShowRefreshLoading, setShouldShowRefreshLoading] =
    useState(false);
  const [visibleDeletingDraftIds, setVisibleDeletingDraftIds] = useState<
    string[]
  >([]);
  const refreshDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const deletingDelayTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const {
    data,
    isPending: isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: cloudImportQueryKeys.localDraftsModal(),
    queryFn: () =>
      loadLocalImportDrafts<{ drafts: LocalImportDraftListItem[] }>(
        resolveApiHrefForCurrentPath,
        20
      ),
  });

  const drafts = data ? data.drafts : [];
  const errorMessage =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "가져오기 작업 목록을 불러오지 못했습니다."
        : null;

  useEffect(() => {
    return () => {
      if (refreshDelayTimerRef.current) {
        clearTimeout(refreshDelayTimerRef.current);
      }
      deletingDelayTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      deletingDelayTimersRef.current.clear();
    };
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    void refetch();
  }, [refetch]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const refresh = useCallback(async () => {
    if (isRefreshPending) {
      return;
    }

    setIsRefreshPending(true);
    refreshDelayTimerRef.current = setTimeout(() => {
      setShouldShowRefreshLoading(true);
      refreshDelayTimerRef.current = null;
    }, LOADING_FEEDBACK_DELAY_MS);

    try {
      await refetch();
    } finally {
      if (refreshDelayTimerRef.current) {
        clearTimeout(refreshDelayTimerRef.current);
        refreshDelayTimerRef.current = null;
      }
      setShouldShowRefreshLoading(false);
      setIsRefreshPending(false);
    }
  }, [isRefreshPending, refetch]);

  const openDraft = useCallback(
    async (draftId: string) => {
      await localImport.restoreDraftById(draftId);
      setIsOpen(false);
      void refetch();
    },
    [localImport, refetch]
  );

  const discardDraft = useCallback(
    async (draftId: string) => {
      if (deletingDraftIds.includes(draftId)) {
        return;
      }

      setDeletingDraftIds((prev) => [...prev, draftId]);
      const delayTimer = setTimeout(() => {
        setVisibleDeletingDraftIds((prev) =>
          prev.includes(draftId) ? prev : [...prev, draftId]
        );
        deletingDelayTimersRef.current.delete(draftId);
      }, LOADING_FEEDBACK_DELAY_MS);
      deletingDelayTimersRef.current.set(draftId, delayTimer);

      try {
        if (localImport.currentDraftId === draftId) {
          await localImport.discardDraft?.();
        } else {
          await deleteImportDraft(resolveApiHrefForCurrentPath, draftId).catch(
            () => {
              // 목록 새로고침으로 상태를 다시 맞춘다.
            }
          );
        }

        onDraftDiscarded?.();
        void refetch();
      } finally {
        const pendingTimer = deletingDelayTimersRef.current.get(draftId);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          deletingDelayTimersRef.current.delete(draftId);
        }
        setDeletingDraftIds((prev) => prev.filter((id) => id !== draftId));
        setVisibleDeletingDraftIds((prev) =>
          prev.filter((id) => id !== draftId)
        );
      }
    },
    [deletingDraftIds, localImport, onDraftDiscarded, refetch]
  );

  return {
    isOpen,
    drafts,
    isLoading,
    errorMessage,
    isRefreshPending,
    shouldShowRefreshLoading,
    deletingDraftIds,
    visibleDeletingDraftIds,
    open,
    close,
    refresh,
    refetch,
    openDraft,
    discardDraft,
  };
}
