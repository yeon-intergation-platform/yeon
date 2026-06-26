"use client";
import { useYeonWindowEvent } from "@yeon/ui/hooks/YeonBrowserHooks";
import {
  readYeonLocalStorageItem,
  removeYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useAddCard } from "../hooks";
import { updateCardEditorCodeBlockLanguageInRichContent } from "./card-editor-codeblock-utils";
import {
  isCardEditorImageUploadInProgress,
  updateCardEditorImageUploadSideState,
  type CardEditorImageUploadSideState,
  type CardEditorImageUploadSide,
} from "./card-editor-image-utils";
import {
  isEmptyRichContent,
  isRenderableRichContent,
  normalizeRichContent,
} from "./card-content-utils";

const CARD_EDITOR_DRAFT_STORAGE_KEY = "yeon-card-service-editor-draft";

interface CardEditorValue {
  frontText: string;
  backText: string;
}

export interface AddCardFormActionState {
  canSubmit: boolean;
  isPending: boolean;
  actionLabel: string;
  pendingActionLabel: string;
  errorMessage: string | null;
}

export const ADD_CARD_FORM_INITIAL_ACTION_STATE: AddCardFormActionState = {
  canSubmit: false,
  isPending: false,
  actionLabel: "카드 저장",
  pendingActionLabel: "저장 중...",
  errorMessage: null,
};

interface UseAddCardFormStateParams {
  deckId: string;
  submitLabel?: string;
  pendingLabel?: string;
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onActionStateChange?: (state: AddCardFormActionState) => void;
}

function normalizeValue(value?: Partial<CardEditorValue>): CardEditorValue {
  return {
    frontText: value?.frontText ?? "",
    backText: value?.backText ?? "",
  };
}

function buildDraftKey(deckId: string) {
  return `${CARD_EDITOR_DRAFT_STORAGE_KEY}:${deckId}:new`;
}

function hasAnyDraftContent(value: CardEditorValue) {
  return (
    isRenderableRichContent(value.frontText) ||
    isRenderableRichContent(value.backText)
  );
}

export function useAddCardFormState({
  deckId,
  submitLabel,
  pendingLabel,
  onSaved,
  onDirtyChange,
  onActionStateChange,
}: UseAddCardFormStateParams) {
  const draftKey = useMemo(() => buildDraftKey(deckId), [deckId]);
  const initialSnapshot = useMemo(() => normalizeValue(), []);

  const [frontText, setFrontText] = useState(initialSnapshot.frontText);
  const [backText, setBackText] = useState(initialSnapshot.backText);
  const [isDraftLoaded, setDraftLoaded] = useState(false);
  const [uploadingSides, setUploadingSides] =
    useState<CardEditorImageUploadSideState>({
      front: false,
      back: false,
    });

  const addMutation = useAddCard(deckId);
  const isUploading = isCardEditorImageUploadInProgress(uploadingSides);
  const isPending = addMutation.isPending || isUploading;
  const deferredFrontText = useDeferredValue(frontText);
  const deferredBackText = useDeferredValue(backText);

  const currentValue = useMemo<CardEditorValue>(
    () => ({ frontText, backText }),
    [frontText, backText]
  );
  const hasUnsavedContent = hasAnyDraftContent(currentValue);
  const isDirty = isDraftLoaded && hasUnsavedContent;
  const canSubmit =
    !isEmptyRichContent(frontText) &&
    !isEmptyRichContent(backText) &&
    !isPending;

  useEffect(() => {
    setDraftLoaded(false);
    onDirtyChange?.(false);
    const savedDraft = readYeonLocalStorageItem(draftKey);
    if (!savedDraft) {
      setFrontText(initialSnapshot.frontText);
      setBackText(initialSnapshot.backText);
      setDraftLoaded(true);
      return;
    }

    try {
      const parsed = normalizeValue(
        JSON.parse(savedDraft) as Partial<CardEditorValue>
      );
      setFrontText(parsed.frontText);
      setBackText(parsed.backText);
      setDraftLoaded(true);
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
      removeYeonLocalStorageItem(draftKey);
      setFrontText(initialSnapshot.frontText);
      setBackText(initialSnapshot.backText);
      setDraftLoaded(true);
    }
  }, [draftKey, initialSnapshot, onDirtyChange]);

  useEffect(() => {
    if (!isDraftLoaded) return;
    onDirtyChange?.(hasUnsavedContent);
  }, [hasUnsavedContent, isDraftLoaded, onDirtyChange]);

  useEffect(() => {
    if (!isDraftLoaded) return;
    if (hasAnyDraftContent(currentValue)) {
      writeYeonLocalStorageItem(draftKey, JSON.stringify(currentValue));
      return;
    }
    removeYeonLocalStorageItem(draftKey);
  }, [currentValue, draftKey, isDraftLoaded]);

  useYeonWindowEvent(
    "beforeunload",
    (event) => {
      event.preventDefault();
      event.returnValue = "작성 중인 카드 내용이 있습니다.";
    },
    isDirty
  );

  const resetDraft = () => {
    removeYeonLocalStorageItem(draftKey);
    onDirtyChange?.(false);
  };

  const handleFrontCodeLanguageChange = (index: number, language: string) => {
    setFrontText((current) =>
      updateCardEditorCodeBlockLanguageInRichContent(current, index, language)
    );
  };

  const handleBackCodeLanguageChange = (index: number, language: string) => {
    setBackText((current) =>
      updateCardEditorCodeBlockLanguageInRichContent(current, index, language)
    );
  };

  const setUploadingSide = (
    side: CardEditorImageUploadSide,
    isUploadingSide: boolean
  ) => {
    setUploadingSides((prev) =>
      updateCardEditorImageUploadSideState(prev, side, isUploadingSide)
    );
  };

  const setFrontUploading = (isUploadingFront: boolean) => {
    setUploadingSide("front", isUploadingFront);
  };

  const setBackUploading = (isUploadingBack: boolean) => {
    setUploadingSide("back", isUploadingBack);
  };

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const body = {
      frontText: normalizeRichContent(frontText),
      backText: normalizeRichContent(backText),
    };

    addMutation.mutate(body, {
      onSuccess: () => {
        trackEvent(analyticsEvents.cardCreated, {
          deck_id: deckId,
          has_image:
            /<img\b/i.test(body.frontText) || /<img\b/i.test(body.backText),
        });
        resetDraft();
        setFrontText("");
        setBackText("");
        onSaved?.();
      },
    });
  };

  const actionLabel = submitLabel ?? "카드 저장";
  const pendingActionLabel =
    pendingLabel ?? (isUploading ? "이미지 업로드 중..." : "저장 중...");
  const errorMessage = addMutation.error?.message || null;
  const actionState = useMemo<AddCardFormActionState>(
    () => ({
      canSubmit,
      isPending,
      actionLabel,
      pendingActionLabel,
      errorMessage,
    }),
    [actionLabel, canSubmit, errorMessage, isPending, pendingActionLabel]
  );

  useEffect(() => {
    onActionStateChange?.(actionState);
  }, [actionState, onActionStateChange]);

  return {
    frontText,
    backText,
    deferredFrontText,
    deferredBackText,
    setFrontText,
    setBackText,
    setFrontUploading,
    setBackUploading,
    handleFrontCodeLanguageChange,
    handleBackCodeLanguageChange,
    handleSubmit,
  };
}

export type AddCardFormState = ReturnType<typeof useAddCardFormState>;
