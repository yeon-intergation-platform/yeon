import {
  RECALL_AI_DECK_MAX_ITEMS,
  RECALL_AI_INSTRUCTION_MAX_LENGTH,
  RECALL_AI_SOURCE_MAX_LENGTH,
  type CardDeckAiDraftItem,
  type CreateCardDeckAiPreviewBody,
  type CreateCardDeckWithItemsBody,
  type CardDeckAiPreviewResponse,
} from "@yeon/api-contract/recall";
import { CARD_TEXT_MAX_LENGTH } from "@yeon/api-contract/card-decks";
import { createRecallIdempotencyKey } from "@yeon/ui/runtime/ports/card-deck";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import {
  YeonActionButton as ActionButton,
  YeonFormStack as FormStack,
  YeonSegmentedControl as SegmentedControl,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  showYeonAlert,
  type YeonHref as Href,
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { useCardSession } from "./card-session-context";
import { createMobileCardRecallRepository } from "./runtime-adapters/card-recall-repository";
import { getCardServiceErrorMessage } from "./error-message";
import {
  AI_DECK_SAVE_FAILURE_KINDS,
  classifyAiDeckSaveFailure,
  createAiDeckSavePayload,
  deriveAiDeckDraftMutationPolicy,
  deriveAiDeckOperationPolicy,
  getAiDeckDraftFingerprint,
  shouldApplyAiPreview,
  type AiDeckSaveFailure,
} from "./card-ai-draft-state";

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

export function MobileCreateDeckAiForm({
  onCreated,
  onOperationLockChange,
}: {
  onCreated: () => void;
  onOperationLockChange?: (locked: boolean) => void;
}) {
  const { isSignedIn, sessionToken } = useCardSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const repository = useMemo(
    () =>
      sessionToken ? createMobileCardRecallRepository(sessionToken) : null,
    [sessionToken]
  );
  const [sourceText, setSourceText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [itemCount, setItemCount] = useState("10");
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
    mutationFn: async (body: CreateCardDeckAiPreviewBody) => {
      if (!repository) throw new Error("로그인이 필요합니다.");
      return repository.createAiPreview(body);
    },
  });
  const saveMutation = useMutation({
    mutationFn: async (body: CreateCardDeckWithItemsBody) => {
      if (!repository) throw new Error("로그인이 필요합니다.");
      return repository.createDeckWithItems(body);
    },
    onSuccess: async ({ deck }) => {
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(true),
      });
      onCreated();
      router.push({
        pathname: YEON_ROUTE_TEMPLATES.cardDeckDetail,
        params: { deckId: deck.id },
      } as Href);
    },
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
    if (!repository || !sourceText.trim() || !policy.canGeneratePreview) {
      return;
    }
    const requestRevision = previewInputRevisionRef.current;
    const body: CreateCardDeckAiPreviewBody = {
      idempotencyKey: previewKeyRef.current,
      sourceText: sourceText.trim(),
      instruction: instruction.trim() || null,
      itemCount: Number(itemCount),
    };
    previewPendingRef.current = true;
    try {
      const generated = await previewMutation.mutateAsync(body);
      if (
        !shouldApplyAiPreview(requestRevision, previewInputRevisionRef.current)
      ) {
        return;
      }
      replacePreview(toEditablePreview(generated));
      previewKeyRef.current = createRecallIdempotencyKey();
      resetSaveRequest();
    } catch (error) {
      if (
        !shouldApplyAiPreview(requestRevision, previewInputRevisionRef.current)
      ) {
        return;
      }
      showYeonAlert(
        "AI 초안 생성 실패",
        getCardServiceErrorMessage(error, "AI 카드 초안을 만들지 못했습니다.")
      );
    } finally {
      previewPendingRef.current = false;
    }
  }

  async function saveDeck() {
    const draft = previewRef.current;
    if (!repository || !draft || savePendingRef.current) return;
    const body = createAiDeckSavePayload(saveKeyRef.current, draft);
    const draftFingerprint = getAiDeckDraftFingerprint(draft);
    savePendingRef.current = true;
    try {
      await saveMutation.mutateAsync(body);
    } catch (error) {
      const kind = classifyAiDeckSaveFailure(error);
      saveFailureRef.current = { draftFingerprint, kind };
      setSaveFailureKind(kind);
      showYeonAlert(
        "덱 저장 실패",
        getCardServiceErrorMessage(
          error,
          kind === AI_DECK_SAVE_FAILURE_KINDS.ambiguous
            ? "응답을 확인할 수 없습니다. 초안을 바꾸지 말고 같은 요청으로 다시 저장해 주세요."
            : "같은 내용으로 다시 저장하거나 초안을 수정해 새 요청으로 저장해 주세요."
        )
      );
    } finally {
      savePendingRef.current = false;
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
    const policy = deriveAiDeckDraftMutationPolicy(
      saveFailureRef.current,
      getAiDeckDraftFingerprint(next)
    );
    if (!policy.allowed) return;
    if (policy.rotateIdempotencyKey) {
      resetSaveRequest();
    }
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
      const destination = index + offset;
      if (destination < 0 || destination >= current.items.length)
        return current;
      const items = [...current.items];
      const [item] = items.splice(index, 1);
      if (!item) return current;
      items.splice(destination, 0, item);
      return { ...current, items };
    });
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

  const operationPolicy = deriveAiDeckOperationPolicy({
    previewPending: previewMutation.isPending,
    saveFailureKind,
    savePending: saveMutation.isPending,
  });
  const isDraftLocked = !operationPolicy.canMutateDraft;

  useEffect(() => {
    onOperationLockChange?.(!operationPolicy.canDismiss);
  }, [onOperationLockChange, operationPolicy.canDismiss]);

  if (!isSignedIn || !repository) {
    return (
      <YeonView style={{ gap: 8, paddingVertical: 8 }}>
        <YeonText style={{ fontSize: 14, lineHeight: 20 }}>
          AI 초안 생성은 로그인 후 사용할 수 있습니다. 직접 입력 덱은
          비회원으로도 만들 수 있어요.
        </YeonText>
      </YeonView>
    );
  }

  const canSave = Boolean(
    preview?.title.trim() &&
    preview.items.length > 0 &&
    preview.items.every(
      (item) => item.frontText.trim() && item.backText.trim()
    ) &&
    !saveMutation.isPending &&
    !previewMutation.isPending
  );
  return (
    <FormStack gap="compact">
      <TextField
        disabled={isDraftLocked}
        label="학습 원문"
        maxLength={RECALL_AI_SOURCE_MAX_LENGTH}
        multiline
        multilineMinHeight={170}
        onChangeText={(value) => {
          markPreviewInputChanged(() => setSourceText(value));
        }}
        placeholder="강의 노트나 학습 내용을 붙여넣으세요."
        value={sourceText}
      />
      <TextField
        disabled={isDraftLocked}
        label="생성 지시 (선택)"
        maxLength={RECALL_AI_INSTRUCTION_MAX_LENGTH}
        onChangeText={(value) => {
          markPreviewInputChanged(() => setInstruction(value));
        }}
        placeholder="예: 시험 핵심 위주"
        value={instruction}
      />
      <YeonText style={{ fontSize: 13, fontWeight: "700" }}>카드 수</YeonText>
      <SegmentedControl
        value={itemCount}
        onValueChange={(value) => {
          markPreviewInputChanged(() => setItemCount(value));
        }}
        options={[
          { disabled: isDraftLocked, label: "5장", value: "5" },
          { disabled: isDraftLocked, label: "10장", value: "10" },
          { disabled: isDraftLocked, label: "20장", value: "20" },
        ]}
      />
      <ActionButton
        disabled={
          !sourceText.trim() ||
          previewMutation.isPending ||
          saveMutation.isPending ||
          !operationPolicy.canGeneratePreview
        }
        label={
          previewMutation.isPending
            ? "AI 초안 생성 중..."
            : preview
              ? "초안 다시 만들기"
              : "AI 초안 만들기"
        }
        onPress={() => void generatePreview()}
        variant="dark"
      />
      {preview ? (
        <FormStack gap="compact">
          {saveFailureKind === AI_DECK_SAVE_FAILURE_KINDS.ambiguous ? (
            <YeonText style={{ color: "#B54708", fontSize: 13 }}>
              저장 응답을 확인하지 못해 초안을 잠갔습니다. 같은 내용으로 저장을
              다시 시도해 주세요.
            </YeonText>
          ) : null}
          <TextField
            disabled={isDraftLocked}
            label="덱 제목"
            maxLength={120}
            onChangeText={(title) =>
              mutateDraft((current) => ({ ...current, title }))
            }
            value={preview.title}
          />
          <TextField
            disabled={isDraftLocked}
            label="덱 설명 (선택)"
            maxLength={2000}
            multiline
            onChangeText={(description) =>
              mutateDraft((current) => ({
                ...current,
                description: description || null,
              }))
            }
            value={preview.description ?? ""}
          />
          {preview.items.map((item, index) => (
            <YeonView
              key={item.key}
              style={{
                borderBottomColor: "#DFE3E8",
                borderBottomWidth: 1,
                gap: 8,
                paddingVertical: 10,
              }}
            >
              <YeonText style={{ fontSize: 13, fontWeight: "800" }}>
                카드 {index + 1}
              </YeonText>
              <TextField
                disabled={isDraftLocked}
                label="질문"
                maxLength={CARD_TEXT_MAX_LENGTH}
                multiline
                onChangeText={(frontText) => updateItem(index, { frontText })}
                showCounter
                value={item.frontText}
              />
              <TextField
                disabled={isDraftLocked}
                label="답"
                maxLength={CARD_TEXT_MAX_LENGTH}
                multiline
                onChangeText={(backText) => updateItem(index, { backText })}
                showCounter
                value={item.backText}
              />
              <YeonView style={{ flexDirection: "row", gap: 8 }}>
                <ActionButton
                  disabled={isDraftLocked || index === 0}
                  label="위로"
                  onPress={() => moveItem(index, -1)}
                  style={{ flex: 1 }}
                  variant="secondary"
                />
                <ActionButton
                  disabled={isDraftLocked || index === preview.items.length - 1}
                  label="아래로"
                  onPress={() => moveItem(index, 1)}
                  style={{ flex: 1 }}
                  variant="secondary"
                />
                <ActionButton
                  disabled={isDraftLocked}
                  label="삭제"
                  onPress={() =>
                    mutateDraft((current) => ({
                      ...current,
                      items: current.items.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                  style={{ flex: 1 }}
                  variant="danger"
                />
              </YeonView>
            </YeonView>
          ))}
          <ActionButton
            disabled={
              isDraftLocked || preview.items.length >= RECALL_AI_DECK_MAX_ITEMS
            }
            label="카드 추가"
            onPress={addItem}
            variant="secondary"
          />
          <ActionButton
            disabled={!canSave}
            label={
              saveMutation.isPending
                ? "덱 저장 중..."
                : `${preview.items.length}장 한 번에 저장`
            }
            onPress={() => void saveDeck()}
            variant="dark"
          />
        </FormStack>
      ) : null}
    </FormStack>
  );
}
