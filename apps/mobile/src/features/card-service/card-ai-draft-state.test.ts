import { ApiClientError } from "@yeon/api-client";
import { describe, expect, it } from "vitest";
import {
  AI_DECK_SAVE_FAILURE_KINDS,
  classifyAiDeckSaveFailure,
  createAiDeckSavePayload,
  deriveAiDeckDraftMutationPolicy,
  deriveAiDeckOperationPolicy,
  getAiDeckDraftFingerprint,
  shouldApplyAiPreview,
} from "./card-ai-draft-state";

const draft = {
  title: "  한국사  ",
  description: "  조선 후기  ",
  items: [{ frontText: "  질문  ", backText: "  답  " }],
};

describe("card AI draft request state", () => {
  it("저장 payload를 요청 시점의 정규화된 값으로 고정한다", () => {
    expect(createAiDeckSavePayload("request-key", draft)).toEqual({
      idempotencyKey: "request-key",
      title: "한국사",
      description: "조선 후기",
      items: [{ frontText: "질문", backText: "답" }],
    });
  });

  it("확정 4xx와 결과가 불확실한 5xx·408·네트워크 실패를 구분한다", () => {
    expect(
      classifyAiDeckSaveFailure(new ApiClientError(400, "잘못된 요청"))
    ).toBe(AI_DECK_SAVE_FAILURE_KINDS.confirmed);
    expect(classifyAiDeckSaveFailure(new ApiClientError(409, "충돌"))).toBe(
      AI_DECK_SAVE_FAILURE_KINDS.confirmed
    );
    expect(
      classifyAiDeckSaveFailure(new ApiClientError(408, "시간 초과"))
    ).toBe(AI_DECK_SAVE_FAILURE_KINDS.ambiguous);
    expect(
      classifyAiDeckSaveFailure(new ApiClientError(502, "응답 파싱 실패"))
    ).toBe(AI_DECK_SAVE_FAILURE_KINDS.ambiguous);
    expect(classifyAiDeckSaveFailure(new TypeError("network failed"))).toBe(
      AI_DECK_SAVE_FAILURE_KINDS.ambiguous
    );
  });

  it("진행 중이거나 저장 결과가 불확실하면 입력·재생성·닫기를 잠근다", () => {
    expect(
      deriveAiDeckOperationPolicy({
        previewPending: true,
        saveFailureKind: null,
        savePending: false,
      })
    ).toMatchObject({
      canDismiss: false,
      canGeneratePreview: false,
      canMutateGenerationInput: false,
    });
    expect(
      deriveAiDeckOperationPolicy({
        previewPending: false,
        saveFailureKind: AI_DECK_SAVE_FAILURE_KINDS.ambiguous,
        savePending: false,
      })
    ).toEqual({
      canDismiss: false,
      canGeneratePreview: false,
      canMutateDraft: false,
      canMutateGenerationInput: false,
      canRetrySave: true,
    });
    expect(
      deriveAiDeckOperationPolicy({
        previewPending: false,
        saveFailureKind: AI_DECK_SAVE_FAILURE_KINDS.confirmed,
        savePending: false,
      })
    ).toMatchObject({
      canDismiss: true,
      canGeneratePreview: true,
      canMutateDraft: true,
      canMutateGenerationInput: true,
    });
  });

  it("확정 실패 뒤 payload가 바뀔 때만 저장 키를 회전한다", () => {
    const draftFingerprint = getAiDeckDraftFingerprint(draft);
    const failure = {
      draftFingerprint,
      kind: AI_DECK_SAVE_FAILURE_KINDS.confirmed,
    } as const;

    expect(deriveAiDeckDraftMutationPolicy(failure, draftFingerprint)).toEqual({
      allowed: true,
      rotateIdempotencyKey: false,
    });
    expect(
      deriveAiDeckDraftMutationPolicy(
        failure,
        getAiDeckDraftFingerprint({ ...draft, title: "근현대사" })
      )
    ).toEqual({ allowed: true, rotateIdempotencyKey: true });
  });

  it("응답이 불확실한 저장은 같은 payload 재시도 전까지 편집을 막는다", () => {
    expect(
      deriveAiDeckDraftMutationPolicy(
        {
          draftFingerprint: getAiDeckDraftFingerprint(draft),
          kind: AI_DECK_SAVE_FAILURE_KINDS.ambiguous,
        },
        getAiDeckDraftFingerprint({ ...draft, title: "근현대사" })
      )
    ).toEqual({ allowed: false, rotateIdempotencyKey: false });
  });

  it("생성 입력 revision이 달라진 응답은 적용하지 않는다", () => {
    expect(shouldApplyAiPreview(3, 3)).toBe(true);
    expect(shouldApplyAiPreview(3, 4)).toBe(false);
  });
});
