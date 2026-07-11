import { describe, expect, it } from "vitest";
import {
  RECALL_API_PATHS,
  createCardDeckAiPreviewBodySchema,
  createCardDeckWithItemsBodySchema,
  createRecallAttemptBodySchema,
  recallGradeResponseSchema,
} from "../recall";

describe("백지 학습 계약", () => {
  it("카드 식별자를 인코딩한 안정적인 API 경로를 만든다", () => {
    expect(RECALL_API_PATHS.attempts("deck/a", "item b")).toBe(
      "/api/v1/card-decks/deck%2Fa/items/item%20b/recall-attempts"
    );
    expect(RECALL_API_PATHS.attemptHistory("deck/a", 30)).toBe(
      "/api/v1/card-decks/deck%2Fa/recall-attempts?limit=30"
    );
  });

  it("채점 요청에서 정답과 질문을 받지 않는다", () => {
    const parsed = createRecallAttemptBodySchema.parse({
      userAnswer: "서울",
      idempotencyKey: "48ee70fc-316b-4f63-aad1-dd58b02d51eb",
      question: "대한민국의 수도는?",
      answer: "서울",
    });

    expect(parsed).toEqual({
      userAnswer: "서울",
      idempotencyKey: "48ee70fc-316b-4f63-aad1-dd58b02d51eb",
    });
  });

  it("AI 덱 초안과 원자 저장 입력의 경계를 검증한다", () => {
    expect(
      createCardDeckAiPreviewBodySchema.safeParse({
        idempotencyKey: "e5f8e4fd-e344-4560-8996-28d18afcaa57",
        sourceText: "한국사 조선 후기",
        itemCount: 10,
      }).success
    ).toBe(true);
    expect(
      createCardDeckWithItemsBodySchema.safeParse({
        idempotencyKey: "b1f52f44-f636-46a5-a9de-42929638d54d",
        title: "조선 후기",
        items: [{ frontText: "영조의 정책은?", backText: "탕평책" }],
      }).success
    ).toBe(true);
  });

  it("채점 응답에 시도와 SRS 결과를 함께 요구한다", () => {
    const parsed = recallGradeResponseSchema.safeParse({
      attemptId: "rca_1",
      score: 92,
      verdict: "pass",
      missedPoints: [],
      feedback: "핵심 내용을 정확히 썼습니다.",
      reviewDifficulty: "good",
      lastReviewedAt: "2026-07-11T00:00:00.000Z",
      nextReviewAt: "2026-07-14T00:00:00.000Z",
      createdAt: "2026-07-11T00:00:00.000Z",
    });

    expect(parsed.success).toBe(true);
  });
});
