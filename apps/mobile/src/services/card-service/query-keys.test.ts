import { describe, expect, it } from "vitest";
import {
  CARD_RECALL_EXCLUSION_REASONS,
  createRecallIdempotencyKey,
  getCardRecallExclusionReason,
  isCardRecallEligible,
} from "@yeon/ui/runtime/ports/card-deck";
import { cardServiceQueryKeys } from "./query-keys";

describe("cardServiceQueryKeys", () => {
  it("로그인/비로그인 키가 구분되어 캐시 분할된다", () => {
    // queryKey SSOT(card-deck/query-keys.ts)로 통일: 상세도 "decks" 네임스페이스 하위.
    // idx=158 fix: 인자 순서 (isAuthenticated, deckId) — web adapter와 동일.
    expect(cardServiceQueryKeys.deckDetail(true, "deck-1")).toEqual([
      "card-service",
      "decks",
      "server",
      "deck-1",
    ]);

    expect(cardServiceQueryKeys.deckDetail(false, "deck-1")).toEqual([
      "card-service",
      "decks",
      "guest",
      "deck-1",
    ]);
  });

  it("decks 키도 서버/게스트 구분이 유지된다", () => {
    expect(cardServiceQueryKeys.decks(true)).toEqual([
      "card-service",
      "decks",
      "server",
    ]);
    expect(cardServiceQueryKeys.decks(false)).toEqual([
      "card-service",
      "decks",
      "guest",
    ]);
  });

  it("백지 기록 키도 서버/게스트 범위를 분리한다", () => {
    expect(cardServiceQueryKeys.recallHistory(true, "deck-1")).toEqual([
      "card-service",
      "recall",
      "server",
      "deck-1",
      "history",
    ]);
    expect(cardServiceQueryKeys.recallHistory(false, "deck-1")).toEqual([
      "card-service",
      "recall",
      "guest",
      "deck-1",
      "history",
    ]);
  });

  it("백지 mutation용 UUID를 플랫폼 공용 형식으로 만든다", () => {
    const first = createRecallIdempotencyKey();
    const second = createRecallIdempotencyKey();

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(second).not.toBe(first);
  });
});

describe("card recall eligibility", () => {
  it("질문과 답에 실제 내용이 있는 카드만 학습 대상으로 본다", () => {
    expect(isCardRecallEligible({ frontText: "질문", backText: "답" })).toBe(
      true
    );
    expect(
      isCardRecallEligible({
        frontText: '<p><img src="question.png" /></p>',
        backText: "답",
      })
    ).toBe(false);
    expect(
      isCardRecallEligible({
        frontText: '<p><img src="question.png" alt="세포 구조" /></p>',
        backText: "답",
      })
    ).toBe(true);
    expect(
      getCardRecallExclusionReason({
        frontText: "<p><br></p>",
        backText: "답",
      })
    ).toBe(CARD_RECALL_EXCLUSION_REASONS.missingQuestion);
    expect(
      getCardRecallExclusionReason({ frontText: "질문", backText: "   " })
    ).toBe(CARD_RECALL_EXCLUSION_REASONS.missingAnswer);
    expect(
      getCardRecallExclusionReason({ frontText: "", backText: "<p></p>" })
    ).toBe(CARD_RECALL_EXCLUSION_REASONS.missingQuestionAndAnswer);
  });
});
