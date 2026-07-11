import type {
  CardDeckAiDraftItem,
  CardDeckAiPreviewResponse,
  CreateCardDeckWithItemsBody,
} from "@yeon/api-contract/recall";

export const AI_DECK_SAVE_FAILURE_KINDS = {
  ambiguous: "ambiguous",
  confirmed: "confirmed",
} as const;

export type AiDeckSaveFailureKind =
  (typeof AI_DECK_SAVE_FAILURE_KINDS)[keyof typeof AI_DECK_SAVE_FAILURE_KINDS];

type SaveableAiDeckDraft = Pick<
  CardDeckAiPreviewResponse,
  "title" | "description"
> & {
  items: readonly CardDeckAiDraftItem[];
};

export type AiDeckSaveFailure = {
  draftFingerprint: string;
  kind: AiDeckSaveFailureKind;
};

export type AiDeckOperationPolicy = {
  canDismiss: boolean;
  canGeneratePreview: boolean;
  canMutateDraft: boolean;
  canMutateGenerationInput: boolean;
  canRetrySave: boolean;
};

export function createAiDeckSavePayload(
  idempotencyKey: string,
  draft: SaveableAiDeckDraft
): CreateCardDeckWithItemsBody {
  return {
    idempotencyKey,
    title: draft.title.trim(),
    description: draft.description?.trim() || null,
    items: draft.items.map(({ frontText, backText }) => ({
      frontText: frontText.trim(),
      backText: backText.trim(),
    })),
  };
}

export function getAiDeckDraftFingerprint(draft: SaveableAiDeckDraft): string {
  const { idempotencyKey: _idempotencyKey, ...payload } =
    createAiDeckSavePayload("00000000-0000-4000-8000-000000000000", draft);
  return JSON.stringify(payload);
}

function getHttpStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null;
  }
  const status = error.status;
  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

export function classifyAiDeckSaveFailure(
  error: unknown
): AiDeckSaveFailureKind {
  const status = getHttpStatus(error);
  return status !== null && status >= 400 && status < 500 && status !== 408
    ? AI_DECK_SAVE_FAILURE_KINDS.confirmed
    : AI_DECK_SAVE_FAILURE_KINDS.ambiguous;
}

export function deriveAiDeckDraftMutationPolicy(
  failure: AiDeckSaveFailure | null,
  nextDraftFingerprint: string
): { allowed: boolean; rotateIdempotencyKey: boolean } {
  if (!failure) {
    return { allowed: true, rotateIdempotencyKey: false };
  }
  if (failure.kind === AI_DECK_SAVE_FAILURE_KINDS.ambiguous) {
    return { allowed: false, rotateIdempotencyKey: false };
  }
  return {
    allowed: true,
    rotateIdempotencyKey: failure.draftFingerprint !== nextDraftFingerprint,
  };
}

export function deriveAiDeckOperationPolicy({
  previewPending,
  saveFailureKind,
  savePending,
}: {
  previewPending: boolean;
  saveFailureKind: AiDeckSaveFailureKind | null;
  savePending: boolean;
}): AiDeckOperationPolicy {
  const resultIsAmbiguous =
    saveFailureKind === AI_DECK_SAVE_FAILURE_KINDS.ambiguous;
  const operationLocked = previewPending || savePending || resultIsAmbiguous;
  return {
    canDismiss: !operationLocked,
    canGeneratePreview: !operationLocked,
    canMutateDraft: !operationLocked,
    canMutateGenerationInput: !operationLocked,
    canRetrySave: !previewPending && !savePending,
  };
}

export function shouldApplyAiPreview(
  requestRevision: number,
  currentRevision: number
): boolean {
  return requestRevision === currentRevision;
}
