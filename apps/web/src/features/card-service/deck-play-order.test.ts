import { describe, expect, it } from "vitest";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { sortCardDeckItemsForPlay } from "@yeon/ui/runtime/ports/card-deck";

function makeItem(
  overrides: Pick<CardDeckItemDto, "id" | "createdAt"> &
    Partial<CardDeckItemDto>
): CardDeckItemDto {
  return {
    frontText: "front",
    backText: "back",
    imageStorageKey: null,
    imageUrl: null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    updatedAt: overrides.createdAt,
    ...overrides,
  };
}

describe("sortCardDeckItemsForPlay", () => {
  it("생성 시각 오름차순으로 안정 정렬한다", () => {
    const items = [
      makeItem({ id: "c", createdAt: "2026-01-03T00:00:00.000Z" }),
      makeItem({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      makeItem({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
    ];

    expect(sortCardDeckItemsForPlay(items).map((i) => i.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("초 미만 정밀도 표기가 달라도 시각 순서대로 정렬한다", () => {
    // 서버 toIso(Instant.toString())는 .000 같은 0 소수를 생략해 "...:00Z"로 출력한다.
    // 문자열 비교라면 ".500Z" < "Z"라 순서가 뒤집히지만, 시각상 .000이 먼저여야 한다.
    const items = [
      makeItem({ id: "later", createdAt: "2026-01-01T00:00:00.500Z" }),
      makeItem({ id: "exact", createdAt: "2026-01-01T00:00:00Z" }),
    ];

    expect(sortCardDeckItemsForPlay(items).map((i) => i.id)).toEqual([
      "exact",
      "later",
    ]);
  });

  it("생성 시각이 같으면 id로 결정적으로 정렬한다", () => {
    const sameCreatedAt = "2026-01-01T00:00:00.000Z";
    const items = [
      makeItem({ id: "z", createdAt: sameCreatedAt }),
      makeItem({ id: "x", createdAt: sameCreatedAt }),
      makeItem({ id: "y", createdAt: sameCreatedAt }),
    ];

    expect(sortCardDeckItemsForPlay(items).map((i) => i.id)).toEqual([
      "x",
      "y",
      "z",
    ]);
  });

  it("복습 우선순위(next_review_at)로 재정렬된 입력이 와도 같은 순서를 돌려준다", () => {
    const a = makeItem({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" });
    const b = makeItem({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" });
    const c = makeItem({ id: "c", createdAt: "2026-01-03T00:00:00.000Z" });

    // 채점 후 서버가 a를 맨 뒤로 보낸(미래 next_review_at) 순서로 다시 내려준 상황.
    const reordered = [
      b,
      c,
      { ...a, nextReviewAt: "2026-02-01T00:00:00.000Z" },
    ];

    expect(sortCardDeckItemsForPlay(reordered).map((i) => i.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("입력 배열을 변형하지 않는다", () => {
    const items = [
      makeItem({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
      makeItem({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
    ];
    const originalOrder = items.map((i) => i.id);

    sortCardDeckItemsForPlay(items);

    expect(items.map((i) => i.id)).toEqual(originalOrder);
  });
});
