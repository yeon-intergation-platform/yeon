"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { useAddCard } from "../hooks";
import { CardAddLivePreview } from "./card-add-live-preview";
import { CardRichMarkdownEditor } from "./card-rich-markdown-editor";
import { isEmptyRichContent, normalizeRichContent } from "./card-content-utils";

const CARD_EDITOR_DRAFT_STORAGE_KEY = "yeon-card-service-editor-draft";

interface CardEditorValue {
  frontText: string;
  backText: string;
}

interface AddCardFormProps {
  deckId: string;
  submitLabel?: string;
  pendingLabel?: string;
  onSaved?: () => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
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
    !isEmptyRichContent(value.frontText) || !isEmptyRichContent(value.backText)
  );
}

function snapshotValue(value: CardEditorValue) {
  return JSON.stringify({
    frontText: normalizeRichContent(value.frontText),
    backText: normalizeRichContent(value.backText),
  });
}

export function AddCardForm({
  deckId,
  submitLabel,
  pendingLabel,
  onSaved,
  onCancel,
  onDirtyChange,
}: AddCardFormProps) {
  const draftKey = useMemo(() => buildDraftKey(deckId), [deckId]);
  const initialSnapshot = useMemo(() => normalizeValue(), []);

  const [frontText, setFrontText] = useState(initialSnapshot.frontText);
  const [backText, setBackText] = useState(initialSnapshot.backText);
  const [isDraftLoaded, setDraftLoaded] = useState(false);
  const [uploadingSides, setUploadingSides] = useState({
    front: false,
    back: false,
  });

  const addMutation = useAddCard(deckId);
  const isUploading = uploadingSides.front || uploadingSides.back;
  const isPending = addMutation.isPending || isUploading;
  const deferredFrontText = useDeferredValue(frontText);
  const deferredBackText = useDeferredValue(backText);

  const currentValue = useMemo<CardEditorValue>(
    () => ({ frontText, backText }),
    [frontText, backText]
  );
  const isDirty =
    snapshotValue(currentValue) !== snapshotValue(initialSnapshot);
  const canSubmit =
    !isEmptyRichContent(frontText) &&
    !isEmptyRichContent(backText) &&
    !isPending;

  useEffect(() => {
    setDraftLoaded(false);
    const savedDraft = window.localStorage.getItem(draftKey);
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
    } catch {
      window.localStorage.removeItem(draftKey);
      setFrontText(initialSnapshot.frontText);
      setBackText(initialSnapshot.backText);
      setDraftLoaded(true);
    }
  }, [draftKey, initialSnapshot]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDraftLoaded) return;
    if (hasAnyDraftContent(currentValue)) {
      window.localStorage.setItem(draftKey, JSON.stringify(currentValue));
      return;
    }
    window.localStorage.removeItem(draftKey);
  }, [currentValue, draftKey, isDraftLoaded]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "작성 중인 카드 내용이 있습니다.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const resetDraft = () => {
    window.localStorage.removeItem(draftKey);
    onDirtyChange?.(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.52fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-2xl border border-[#ececec] bg-white p-3 md:p-4">
            <CardRichMarkdownEditor
              label="카드 질문"
              value={frontText}
              onChange={setFrontText}
              placeholder="질문 또는 앞면 내용을 작성하고 이미지는 문장 사이에 붙여넣으세요."
              helperText="이미지는 드래그·붙여넣기·버튼으로 본문에 삽입됩니다."
              density="compactQuestion"
              previewPlacement="none"
              onUploadingChange={(isUploadingFront) =>
                setUploadingSides((prev) => ({
                  ...prev,
                  front: isUploadingFront,
                }))
              }
            />
          </div>
          <div className="rounded-2xl border border-[#ececec] bg-white p-3 md:p-4">
            <CardRichMarkdownEditor
              label="카드 답변 / 본문"
              value={backText}
              onChange={setBackText}
              placeholder="답변 또는 본문을 작성하세요."
              helperText="삽입 이미지는 크기 조절 후 저장하면 본문과 함께 유지됩니다."
              density="compactAnswer"
              previewPlacement="none"
              onUploadingChange={(isUploadingBack) =>
                setUploadingSides((prev) => ({
                  ...prev,
                  back: isUploadingBack,
                }))
              }
            />
          </div>
        </div>
        <CardAddLivePreview
          frontText={deferredFrontText}
          backText={deferredBackText}
        />
      </div>

      {errorMessage ? (
        <p className="text-[13px] font-medium text-red-600">{errorMessage}</p>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-5 flex flex-col-reverse gap-3 border-t border-[#efefef] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end md:-mx-6 md:px-6">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} rounded-2xl border border-[#e5e5e5] px-5 py-3 transition-colors hover:bg-[#fafafa]`}
          >
            취소
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-2xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? pendingActionLabel : actionLabel}
        </button>
      </div>
    </form>
  );
}
