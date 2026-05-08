"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import { useAddCard, useUpdateCard } from "../hooks";
import { uploadCardDeckImage } from "../hooks/card-service-fetch";
import { MarkdownEditor } from "./markdown-editor";

const CARD_EDITOR_DRAFT_STORAGE_KEY = "yeon-card-service-editor-draft";
const CARD_IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

interface CardEditorValue {
  frontText: string;
  backText: string;
  imageStorageKey: string | null;
  imageUrl: string | null;
}

interface AddCardFormProps {
  deckId: string;
  itemId?: string;
  initialValue?: Partial<CardEditorValue>;
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
    imageStorageKey: value?.imageStorageKey ?? null,
    imageUrl: value?.imageUrl ?? null,
  };
}

function buildDraftKey(deckId: string, itemId?: string) {
  return `${CARD_EDITOR_DRAFT_STORAGE_KEY}:${deckId}:${itemId ?? "new"}`;
}

function hasAnyDraftContent(value: CardEditorValue) {
  return Boolean(
    value.frontText.trim() || value.backText.trim() || value.imageStorageKey
  );
}

function snapshotValue(value: CardEditorValue) {
  return JSON.stringify({
    frontText: value.frontText,
    backText: value.backText,
    imageStorageKey: value.imageStorageKey,
    imageUrl: value.imageUrl,
  });
}

export function AddCardForm({
  deckId,
  itemId,
  initialValue,
  submitLabel,
  pendingLabel,
  onSaved,
  onCancel,
  onDirtyChange,
}: AddCardFormProps) {
  const draftKey = useMemo(
    () => buildDraftKey(deckId, itemId),
    [deckId, itemId]
  );
  const initialSnapshot = useMemo(
    () => normalizeValue(initialValue),
    [initialValue]
  );

  const [frontText, setFrontText] = useState(initialSnapshot.frontText);
  const [backText, setBackText] = useState(initialSnapshot.backText);
  const [imageStorageKey, setImageStorageKey] = useState<string | null>(
    initialSnapshot.imageStorageKey
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialSnapshot.imageUrl
  );
  const [isUploadingImage, setUploadingImage] = useState(false);
  const [isDraftLoaded, setDraftLoaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingImage, setDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = Boolean(itemId);

  const addMutation = useAddCard(deckId);
  const updateMutation = useUpdateCard(deckId);
  const activeMutation = isEditMode ? updateMutation : addMutation;
  const isPending = activeMutation.isPending || isUploadingImage;

  const currentValue = useMemo<CardEditorValue>(
    () => ({ frontText, backText, imageStorageKey, imageUrl }),
    [frontText, backText, imageStorageKey, imageUrl]
  );
  const isDirty =
    snapshotValue(currentValue) !== snapshotValue(initialSnapshot);
  const canSubmit =
    frontText.trim().length > 0 && backText.trim().length > 0 && !isPending;

  useEffect(() => {
    setDraftLoaded(false);
    const savedDraft = window.localStorage.getItem(draftKey);
    if (!savedDraft) {
      setFrontText(initialSnapshot.frontText);
      setBackText(initialSnapshot.backText);
      setImageStorageKey(initialSnapshot.imageStorageKey);
      setImageUrl(initialSnapshot.imageUrl);
      setDraftLoaded(true);
      return;
    }

    try {
      const parsed = normalizeValue(
        JSON.parse(savedDraft) as Partial<CardEditorValue>
      );
      setFrontText(parsed.frontText);
      setBackText(parsed.backText);
      setImageStorageKey(parsed.imageStorageKey);
      setImageUrl(parsed.imageUrl);
      setDraftLoaded(true);
    } catch {
      window.localStorage.removeItem(draftKey);
      setFrontText(initialSnapshot.frontText);
      setBackText(initialSnapshot.backText);
      setImageStorageKey(initialSnapshot.imageStorageKey);
      setImageUrl(initialSnapshot.imageUrl);
      setDraftLoaded(true);
    }
  }, [draftKey, initialSnapshot]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDraftLoaded) {
      return;
    }
    if (hasAnyDraftContent(currentValue)) {
      window.localStorage.setItem(draftKey, JSON.stringify(currentValue));
      return;
    }
    window.localStorage.removeItem(draftKey);
  }, [currentValue, draftKey, isDraftLoaded]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
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

  const handleImageUpload = async (file: File) => {
    setUploadError(null);
    setUploadingImage(true);
    try {
      const uploaded = await uploadCardDeckImage(file);
      setImageStorageKey(uploaded.storageKey);
      setImageUrl(uploaded.imageUrl);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "이미지를 업로드하지 못했습니다."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await handleImageUpload(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingImage(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await handleImageUpload(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const body = {
      frontText: frontText.trim(),
      backText: backText.trim(),
      imageStorageKey,
    };

    if (isEditMode && itemId) {
      updateMutation.mutate(
        {
          itemId,
          body,
        },
        {
          onSuccess: () => {
            resetDraft();
            onSaved?.();
          },
        }
      );
      return;
    }

    addMutation.mutate(body, {
      onSuccess: () => {
        resetDraft();
        setFrontText("");
        setBackText("");
        setImageStorageKey(null);
        setImageUrl(null);
        onSaved?.();
      },
    });
  };

  const actionLabel = submitLabel ?? (isEditMode ? "수정 저장" : "카드 저장");
  const pendingActionLabel =
    pendingLabel ?? (isEditMode ? "저장 중..." : "저장 중...");
  const errorMessage = uploadError || activeMutation.error?.message || null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-[#ececec] bg-white p-4 md:p-5">
            <MarkdownEditor
              label="카드 질문"
              value={frontText}
              onChange={setFrontText}
              maxLength={2000}
              minRows={7}
              placeholder="질문 또는 앞면 내용을 Markdown으로 입력하세요."
            />
          </div>
          <div className="rounded-2xl border border-[#ececec] bg-white p-4 md:p-5">
            <MarkdownEditor
              label="카드 답변 / 본문"
              value={backText}
              onChange={setBackText}
              maxLength={4000}
              minRows={9}
              placeholder="답변 또는 본문 내용을 Markdown으로 입력하세요."
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-[#ececec] bg-[#fcfcfc] p-4 md:p-5">
          <div>
            <h3 className="text-[16px] font-semibold text-[#111] md:text-[17px]">
              이미지 첨부
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-[#666] md:text-[14px]">
              PNG, JPG, WEBP, GIF 이미지를 업로드하거나 이 영역으로 드래그해
              붙여넣으세요.
            </p>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDraggingImage(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDraggingImage(false);
            }}
            onDrop={handleDrop}
            className={`rounded-2xl border border-dashed p-4 text-center transition-colors ${
              isDraggingImage
                ? "border-[#111] bg-[#f7f7f7]"
                : "border-[#d9d9d9] bg-white"
            }`}
          >
            {imageUrl ? (
              <div className="space-y-3">
                <img
                  src={imageUrl}
                  alt="카드 첨부 이미지 미리보기"
                  className="max-h-[220px] w-full rounded-xl border border-[#efefef] object-contain bg-[#fafafa]"
                  draggable={false}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-[#dcdcdc] px-3 py-2 text-[13px] font-semibold text-[#111] transition-colors hover:bg-[#f7f7f7]"
                  >
                    이미지 교체
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageStorageKey(null);
                      setImageUrl(null);
                      setUploadError(null);
                    }}
                    className="rounded-xl border border-red-100 px-3 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    이미지 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl bg-[#fafafa] px-4 py-8">
                <div className="text-[34px]">🖼️</div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">
                    이미지를 끌어다 놓거나 선택하세요.
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-[#777]">
                    카드 생성과 수정 모두 같은 방식으로 이미지 미리보기, 교체,
                    삭제가 가능합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
                >
                  이미지 업로드
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={CARD_IMAGE_FILE_ACCEPT}
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="rounded-xl bg-white px-4 py-3 text-[12px] leading-6 text-[#777]">
            <p>• 저장하지 않고 닫아도 작성 중인 내용은 임시 저장됩니다.</p>
            <p>• 저장 후에는 임시 저장본이 자동으로 정리됩니다.</p>
          </div>
        </aside>
      </div>

      {errorMessage ? (
        <p className="text-[13px] font-medium text-red-600">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[#efefef] pt-4 sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[#e5e5e5] px-5 py-3 text-[14px] font-semibold text-[#111] transition-colors hover:bg-[#fafafa]"
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
