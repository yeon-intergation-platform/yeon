"use client";

import { CARD_TEXT_MAX_LENGTH } from "@yeon/api-contract/card-decks";
import {
  RECALL_AI_DECK_MAX_ITEMS,
  RECALL_AI_INSTRUCTION_MAX_LENGTH,
  RECALL_AI_SOURCE_MAX_LENGTH,
  type CardDeckAiDraftItem,
  type CardDeckAiPreviewResponse,
} from "@yeon/api-contract/recall";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonLabel,
  YeonText,
  YeonView,
} from "@yeon/ui";
import {
  AI_DECK_SAVE_FAILURE_KINDS,
  classifyAiDeckSaveFailure,
  createAiDeckSavePayload,
  createRecallIdempotencyKey,
  deriveAiDeckDraftMutationPolicy,
  deriveAiDeckOperationPolicy,
  getAiDeckDraftFingerprint,
  shouldApplyAiPreview,
  type AiDeckSaveFailure,
  useYeonCardRecallRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import { useEffect, useRef, useState } from "react";
import { cardServiceQueryKeys } from "../card-service-query-keys";
import { useIsAuthenticated } from "../auth-context";

type DraftItem = CardDeckAiDraftItem & { key: string };
type EditablePreview = Omit<CardDeckAiPreviewResponse, "items"> & {
  items: DraftItem[];
};

function toEditablePreview(
  preview: CardDeckAiPreviewResponse
): EditablePreview {
  return {
    ...preview,
    items: preview.items.map((item) => ({
      ...item,
      key: createRecallIdempotencyKey(),
    })),
  };
}

export function CreateDeckAiForm({
  onCreated,
  onOperationLockChange,
}: {
  onCreated: (deckId: string) => void;
  onOperationLockChange?: (locked: boolean) => void;
}) {
  const isAuthenticated = useIsAuthenticated();
  const repository = useYeonCardRecallRepository();
  const queryClient = useQueryClient();
  const [sourceText, setSourceText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [itemCount, setItemCount] = useState(10);
  const [preview, setPreview] = useState<EditablePreview | null>(null);
  const [saveFailureKind, setSaveFailureKind] = useState<
    AiDeckSaveFailure["kind"] | null
  >(null);
  const previewRef = useRef<EditablePreview | null>(null);
  const previewInputRevisionRef = useRef(0);
  const previewKeyRef = useRef(createRecallIdempotencyKey());
  const saveKeyRef = useRef(createRecallIdempotencyKey());
  const saveFailureRef = useRef<AiDeckSaveFailure | null>(null);
  const previewPendingRef = useRef(false);
  const savePendingRef = useRef(false);

  const previewMutation = useMutation({
    mutationFn: (request: {
      requestKey: string;
      sourceText: string;
      instruction: string | null;
      itemCount: number;
    }) =>
      repository.createAiPreview({
        idempotencyKey: request.requestKey,
        sourceText: request.sourceText,
        instruction: request.instruction,
        itemCount: request.itemCount,
      }),
  });
  const saveMutation = useMutation({
    mutationFn: repository.createDeckWithItems,
  });

  function replacePreview(nextPreview: EditablePreview | null) {
    previewRef.current = nextPreview;
    setPreview(nextPreview);
  }

  function resetSaveRequest() {
    saveKeyRef.current = createRecallIdempotencyKey();
    saveFailureRef.current = null;
    setSaveFailureKind(null);
    saveMutation.reset();
  }

  function markPreviewInputChanged(update: () => void) {
    const policy = deriveAiDeckOperationPolicy({
      previewPending: previewPendingRef.current || previewMutation.isPending,
      saveFailureKind: saveFailureRef.current?.kind ?? null,
      savePending: savePendingRef.current || saveMutation.isPending,
    });
    if (!policy.canMutateGenerationInput) return;
    previewInputRevisionRef.current += 1;
    previewKeyRef.current = createRecallIdempotencyKey();
    update();
    replacePreview(null);
    resetSaveRequest();
    previewMutation.reset();
  }

  async function generatePreview() {
    const policy = deriveAiDeckOperationPolicy({
      previewPending: previewPendingRef.current || previewMutation.isPending,
      saveFailureKind: saveFailureRef.current?.kind ?? null,
      savePending: savePendingRef.current || saveMutation.isPending,
    });
    if (!isAuthenticated || !sourceText.trim() || !policy.canGeneratePreview) {
      return;
    }
    const revision = previewInputRevisionRef.current;
    previewPendingRef.current = true;
    try {
      const generated = await previewMutation.mutateAsync({
        requestKey: previewKeyRef.current,
        sourceText: sourceText.trim(),
        instruction: instruction.trim() || null,
        itemCount,
      });
      if (!shouldApplyAiPreview(revision, previewInputRevisionRef.current)) {
        return;
      }
      replacePreview(toEditablePreview(generated));
      previewKeyRef.current = createRecallIdempotencyKey();
      resetSaveRequest();
    } catch {
      // Keep the idempotency key stable so a network retry cannot duplicate usage.
    } finally {
      previewPendingRef.current = false;
    }
  }

  function mutateDraft(update: (current: EditablePreview) => EditablePreview) {
    const current = previewRef.current;
    const operationPolicy = deriveAiDeckOperationPolicy({
      previewPending: previewPendingRef.current || previewMutation.isPending,
      saveFailureKind: saveFailureRef.current?.kind ?? null,
      savePending: savePendingRef.current || saveMutation.isPending,
    });
    if (!current || !operationPolicy.canMutateDraft) return;
    const next = update(current);
    const mutationPolicy = deriveAiDeckDraftMutationPolicy(
      saveFailureRef.current,
      getAiDeckDraftFingerprint(next)
    );
    if (!mutationPolicy.allowed) return;
    if (mutationPolicy.rotateIdempotencyKey) resetSaveRequest();
    replacePreview(next);
  }

  function updateItem(index: number, patch: Partial<CardDeckAiDraftItem>) {
    mutateDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function moveItem(index: number, offset: -1 | 1) {
    mutateDraft((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.items.length) return current;
      const items = [...current.items];
      const [item] = items.splice(index, 1);
      if (!item) return current;
      items.splice(target, 0, item);
      return { ...current, items };
    });
  }

  function removeItem(index: number) {
    mutateDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addItem() {
    mutateDraft((current) =>
      current.items.length < RECALL_AI_DECK_MAX_ITEMS
        ? {
            ...current,
            items: [
              ...current.items,
              {
                key: createRecallIdempotencyKey(),
                frontText: "",
                backText: "",
              },
            ],
          }
        : current
    );
  }

  const canSave = Boolean(
    preview?.title.trim() &&
    preview.items.length > 0 &&
    preview.items.every(
      (item) => item.frontText.trim() && item.backText.trim()
    ) &&
    !saveMutation.isPending
  );
  const isPreviewPending = previewMutation.isPending;
  const isSavePending = saveMutation.isPending;
  const operationPolicy = deriveAiDeckOperationPolicy({
    previewPending: isPreviewPending,
    saveFailureKind,
    savePending: isSavePending,
  });
  const isDraftLocked = !operationPolicy.canMutateDraft;

  useEffect(() => {
    onOperationLockChange?.(!operationPolicy.canDismiss);
  }, [onOperationLockChange, operationPolicy.canDismiss]);

  async function saveDeck() {
    const draft = previewRef.current;
    if (!draft || !canSave || savePendingRef.current) return;
    const body = createAiDeckSavePayload(saveKeyRef.current, draft);
    const draftFingerprint = getAiDeckDraftFingerprint(draft);
    savePendingRef.current = true;
    try {
      const { deck } = await saveMutation.mutateAsync(body);
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(true),
      });
      onCreated(deck.id);
    } catch (error) {
      const kind = classifyAiDeckSaveFailure(error);
      saveFailureRef.current = { draftFingerprint, kind };
      setSaveFailureKind(kind);
    } finally {
      savePendingRef.current = false;
    }
  }

  if (!isAuthenticated) {
    return (
      <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[14px] leading-6 text-[#666]"
        >
          AI 초안 생성은 로그인 후 사용할 수 있습니다. 직접 입력으로 만든 덱은
          이 기기에 저장됩니다.
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonView className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
      <YeonLabel className="flex flex-col gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-[#555]"
        >
          학습 원문
        </YeonText>
        <YeonField
          as="textarea"
          value={sourceText}
          onChange={(event) =>
            markPreviewInputChanged(() => setSourceText(event.target.value))
          }
          rows={7}
          maxLength={RECALL_AI_SOURCE_MAX_LENGTH}
          disabled={isDraftLocked}
          placeholder="카드로 만들 강의 노트나 학습 내용을 붙여넣으세요."
          className="resize-y"
        />
      </YeonLabel>
      <YeonView className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <YeonLabel className="flex flex-col gap-2">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-semibold text-[#555]"
          >
            생성 지시 (선택)
          </YeonText>
          <YeonField
            value={instruction}
            onChange={(event) =>
              markPreviewInputChanged(() => setInstruction(event.target.value))
            }
            maxLength={RECALL_AI_INSTRUCTION_MAX_LENGTH}
            disabled={isDraftLocked}
            placeholder="예: 시험 핵심 위주"
          />
        </YeonLabel>
        <YeonLabel className="flex flex-col gap-2">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-semibold text-[#555]"
          >
            카드 수
          </YeonText>
          <YeonField
            type="number"
            min={1}
            max={RECALL_AI_DECK_MAX_ITEMS}
            value={String(itemCount)}
            disabled={isDraftLocked}
            onChange={(event) =>
              markPreviewInputChanged(() =>
                setItemCount(
                  Math.max(
                    1,
                    Math.min(
                      RECALL_AI_DECK_MAX_ITEMS,
                      Number(event.target.value) || 1
                    )
                  )
                )
              )
            }
          />
        </YeonLabel>
      </YeonView>
      <YeonButton
        type="button"
        variant="primary"
        disabled={!sourceText.trim() || isPreviewPending || isDraftLocked}
        onClick={() => void generatePreview()}
      >
        {isPreviewPending
          ? "AI 초안 생성 중..."
          : preview
            ? "초안 다시 만들기"
            : "AI 초안 만들기"}
      </YeonButton>
      {previewMutation.isError ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-red-600"
        >
          AI 초안을 만들지 못했습니다. 다시 시도해 주세요.
        </YeonText>
      ) : null}

      {preview ? (
        <YeonView className="flex flex-col gap-4 border-t border-[#e5e5e5] pt-4">
          <YeonLabel className="flex flex-col gap-2">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#555]"
            >
              덱 제목
            </YeonText>
            <YeonField
              value={preview.title}
              maxLength={120}
              disabled={isDraftLocked}
              onChange={(event) =>
                mutateDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </YeonLabel>
          <YeonLabel className="flex flex-col gap-2">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#555]"
            >
              덱 설명 (선택)
            </YeonText>
            <YeonField
              as="textarea"
              rows={3}
              value={preview.description ?? ""}
              maxLength={2000}
              disabled={isDraftLocked}
              onChange={(event) =>
                mutateDraft((current) => ({
                  ...current,
                  description: event.target.value || null,
                }))
              }
            />
          </YeonLabel>
          {preview.items.map((item, index) => (
            <YeonView
              key={item.key}
              className="border-b border-[#e5e5e5] pb-4 last:border-0"
            >
              <YeonView className="mb-2 flex items-center justify-between gap-2">
                <YeonText
                  as="strong"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[13px] text-[#111]"
                >
                  카드 {index + 1}
                </YeonText>
                <YeonView className="flex gap-1">
                  <YeonButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isDraftLocked || index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    위로
                  </YeonButton>
                  <YeonButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={
                      isDraftLocked || index === preview.items.length - 1
                    }
                    onClick={() => moveItem(index, 1)}
                  >
                    아래로
                  </YeonButton>
                  <YeonButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label={`카드 ${index + 1} 삭제`}
                    disabled={isDraftLocked}
                    onClick={() => removeItem(index)}
                  >
                    <YeonIcon name="trash" size={15} aria-hidden="true" />
                  </YeonButton>
                </YeonView>
              </YeonView>
              <YeonView className="grid gap-2 sm:grid-cols-2">
                <YeonField
                  as="textarea"
                  rows={3}
                  value={item.frontText}
                  maxLength={CARD_TEXT_MAX_LENGTH}
                  disabled={isDraftLocked}
                  aria-label={`카드 ${index + 1} 질문`}
                  onChange={(event) =>
                    updateItem(index, { frontText: event.target.value })
                  }
                />
                <YeonField
                  as="textarea"
                  rows={3}
                  value={item.backText}
                  maxLength={CARD_TEXT_MAX_LENGTH}
                  disabled={isDraftLocked}
                  aria-label={`카드 ${index + 1} 답`}
                  onChange={(event) =>
                    updateItem(index, { backText: event.target.value })
                  }
                />
              </YeonView>
            </YeonView>
          ))}
          <YeonButton
            type="button"
            variant="secondary"
            disabled={
              isDraftLocked || preview.items.length >= RECALL_AI_DECK_MAX_ITEMS
            }
            onClick={addItem}
          >
            <YeonIcon name="plus" size={16} aria-hidden="true" />
            카드 추가
          </YeonButton>
          {saveFailureKind ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-red-600"
            >
              {saveFailureKind === AI_DECK_SAVE_FAILURE_KINDS.ambiguous
                ? "저장 결과를 확인하지 못해 초안을 잠갔습니다. 같은 내용으로 저장을 다시 시도해 주세요."
                : "덱을 저장하지 못했습니다. 같은 내용으로 다시 저장하거나 초안을 수정해 주세요."}
            </YeonText>
          ) : null}
          <YeonButton
            type="button"
            variant="primary"
            disabled={!canSave}
            onClick={() => void saveDeck()}
          >
            {isSavePending
              ? "덱 저장 중..."
              : `${preview.items.length}장 한 번에 저장`}
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}
