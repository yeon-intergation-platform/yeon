import {
  CARD_REVIEW_DIFFICULTIES,
  CARD_STUDY_MODES,
  type CardDeckDetailResponse,
  type CardDeckItemDto,
} from "@yeon/api-contract/card-decks";
import { describe, expect, it } from "vitest";
import { replaceCardDeckDetailItem } from "./card-deck-detail-cache";

function item(
  id: string,
  patch: Partial<CardDeckItemDto> = {}
): CardDeckItemDto {
  return {
    id,
    frontText: `front ${id}`,
    backText: `back ${id}`,
    imageStorageKey: null,
    imageUrl: null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
    ...patch,
  };
}

function detail(items: CardDeckItemDto[]): CardDeckDetailResponse {
  return {
    deck: {
      id: "deck-1",
      title: "테스트 덱",
      description: null,
      itemCount: items.length,
      createdAt: "2026-06-30T00:00:00.000Z",
      updatedAt: "2026-06-30T00:00:00.000Z",
    },
    items,
    studyMode: CARD_STUDY_MODES.review,
  };
}

describe("replaceCardDeckDetailItem", () => {
  it("복습 저장 결과를 deck detail cache item으로 치환한다", () => {
    const original = detail([
      item("card-1", { reviewDifficulty: CARD_REVIEW_DIFFICULTIES.hard }),
      item("card-2"),
    ]);
    const reviewed = item("card-1", {
      lastReviewedAt: "2026-06-30T01:00:00.000Z",
      nextReviewAt: "2026-07-01T01:00:00.000Z",
      reviewDifficulty: CARD_REVIEW_DIFFICULTIES.easy,
      updatedAt: "2026-06-30T01:00:00.000Z",
    });

    expect(replaceCardDeckDetailItem(original, reviewed)).toEqual({
      ...original,
      items: [reviewed, original.items[1]],
    });
  });
});
