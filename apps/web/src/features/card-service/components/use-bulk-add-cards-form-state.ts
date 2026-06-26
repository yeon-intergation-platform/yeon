"use client";
import { useEffect, useMemo, useState } from "react";
import { useYeonWindowEvent } from "@yeon/ui/hooks/YeonBrowserHooks";
import {
  getYeonCustomEventDetail,
  showYeonConfirm,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui";
import { useAddCards, useReplaceCards } from "../hooks";
import {
  deriveBulkCardImportFormPolicy,
  parseBulkCardImportInput,
} from "../utils/bulk-card-import-parser";
import {
  BULK_CARD_HELP_VISIBILITY_EVENT,
  setBulkCardHelpVisible,
  shouldShowBulkCardHelp,
} from "../utils/bulk-card-help-preference";

export interface BulkAddCardsFormActionState {
  canSubmit: boolean;
  isPending: boolean;
  addButtonLabel: string;
  replaceButtonLabel: string;
  errorMessage?: string;
}

export const BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE: BulkAddCardsFormActionState =
  {
    canSubmit: false,
    isPending: false,
    addButtonLabel: "0장 추가",
    replaceButtonLabel: "0장 덮어쓰기",
  };

interface UseBulkAddCardsFormStateParams {
  deckId: string;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onActionStateChange?: (state: BulkAddCardsFormActionState) => void;
}

const BULK_CARD_ACTION = {
  add: "add",
  replace: "replace",
} as const;

type BulkCardAction = (typeof BULK_CARD_ACTION)[keyof typeof BULK_CARD_ACTION];

export function useBulkAddCardsFormState({
  deckId,
  onSuccess,
  onDirtyChange,
  onActionStateChange,
}: UseBulkAddCardsFormStateParams) {
  const [rawText, setRawText] = useState("");
  const [isHelpVisible, setHelpVisible] = useState(true);
  const addCardsMutation = useAddCards(deckId);
  const replaceCardsMutation = useReplaceCards(deckId);
  const isPending =
    addCardsMutation.isPending || replaceCardsMutation.isPending;
  const error = addCardsMutation.error ?? replaceCardsMutation.error;
  const parseResult = useMemo(
    () => parseBulkCardImportInput(rawText),
    [rawText]
  );
  const formPolicy = useMemo(
    () => deriveBulkCardImportFormPolicy(parseResult, isPending),
    [isPending, parseResult]
  );
  const canSubmit = formPolicy.canSubmit;
  const replaceButtonLabel = replaceCardsMutation.isPending
    ? "덮어쓰는 중..."
    : `${parseResult.cards.length || 0}장 덮어쓰기`;
  const addButtonLabel = addCardsMutation.isPending
    ? "추가 중..."
    : `${parseResult.cards.length || 0}장 추가`;
  const actionState = useMemo<BulkAddCardsFormActionState>(
    () => ({
      canSubmit,
      isPending,
      addButtonLabel,
      replaceButtonLabel,
      errorMessage: error?.message,
    }),
    [addButtonLabel, canSubmit, error?.message, isPending, replaceButtonLabel]
  );
  const { previewCards, hiddenPreviewCount } = formPolicy;

  useEffect(() => {
    onDirtyChange?.(rawText.trim().length > 0);
  }, [onDirtyChange, rawText]);

  useEffect(() => {
    onActionStateChange?.(actionState);
  }, [actionState, onActionStateChange]);

  useEffect(() => {
    setHelpVisible(shouldShowBulkCardHelp());
  }, []);

  useYeonWindowEvent(BULK_CARD_HELP_VISIBILITY_EVENT, (event) => {
    const detail = getYeonCustomEventDetail<{ isVisible: boolean }>(event);
    setHelpVisible(detail?.isVisible ?? shouldShowBulkCardHelp());
  });

  function handleDismissHelp() {
    setHelpVisible(false);
    setBulkCardHelpVisible(false);
  }

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action = (submitter?.value ?? BULK_CARD_ACTION.add) as BulkCardAction;

    if (action === BULK_CARD_ACTION.replace) {
      if (
        !showYeonConfirm(
          `기존 카드를 모두 삭제하고 ${parseResult.cards.length}장으로 덮어쓸까요? 이 작업은 되돌릴 수 없습니다.`
        )
      ) {
        return;
      }

      replaceCardsMutation.mutate(
        { items: parseResult.cards },
        {
          onSuccess: () => {
            setRawText("");
            onSuccess?.();
          },
        }
      );
      return;
    }

    addCardsMutation.mutate(
      { items: parseResult.cards },
      {
        onSuccess: () => {
          setRawText("");
          onSuccess?.();
        },
      }
    );
  };

  return {
    rawText,
    setRawText,
    isHelpVisible,
    handleDismissHelp,
    parseResult,
    previewCards,
    hiddenPreviewCount,
    error,
    handleSubmit,
  };
}

export type BulkAddCardsFormState = ReturnType<typeof useBulkAddCardsFormState>;
