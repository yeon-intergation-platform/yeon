import { describe, expect, it } from "vitest";
import {
  createCardRecallSessionIdentity,
  shouldApplyCardRecallResponse,
  summarizeCardRecallCompletions,
} from "./card-recall-session-state";

describe("card recall session state", () => {
  const card = (id: string, frontText = "질문", backText = "답") => ({
    id,
    frontText,
    backText,
    imageStorageKey: null,
    imageUrl: null,
  });

  it("덱·카드 순서·카드 내용이 바뀌면 세션 identity가 달라진다", () => {
    const current = createCardRecallSessionIdentity("deck-1", [
      card("card-1"),
      card("card-2"),
    ]);

    expect(
      createCardRecallSessionIdentity("deck-2", [
        card("card-1"),
        card("card-2"),
      ])
    ).not.toBe(current);
    expect(
      createCardRecallSessionIdentity("deck-1", [
        card("card-2"),
        card("card-1"),
      ])
    ).not.toBe(current);
    expect(
      createCardRecallSessionIdentity("deck-1", [
        card("card-1", "수정된 질문"),
        card("card-2"),
      ])
    ).not.toBe(current);
  });

  it("세션이 교체된 뒤 도착한 늦은 응답은 적용하지 않는다", () => {
    const submitted = createCardRecallSessionIdentity("deck-1", [
      card("card-1"),
    ]);
    const current = createCardRecallSessionIdentity("deck-2", [card("card-2")]);

    expect(shouldApplyCardRecallResponse(submitted, submitted)).toBe(true);
    expect(shouldApplyCardRecallResponse(submitted, current)).toBe(false);
  });

  it("완료를 card ID별로 집계하고 로그인 점수만 평균 낸다", () => {
    expect(
      summarizeCardRecallCompletions({
        "card-1": { score: 90 },
        "card-2": { score: 70 },
        "card-3": { score: null },
      })
    ).toEqual({ averageScore: 80, solvedCount: 3 });
    expect(
      summarizeCardRecallCompletions({ "guest-card": { score: null } })
    ).toEqual({ averageScore: null, solvedCount: 1 });
  });
});
