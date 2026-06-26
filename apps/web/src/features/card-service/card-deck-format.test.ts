import { describe, expect, it } from "vitest";
import {
  CARD_DECK_INVALID_DATE_LABEL,
  formatCardDeckMeta,
  formatYeonCardDeckCreatedDate,
  formatYeonCardDeckUpdatedDate,
} from "@yeon/ui/runtime/ports/card-deck";

describe("card deck date format policy", () => {
  it("created/updated date formatters share the same Korean long date policy", () => {
    expect(formatYeonCardDeckUpdatedDate("2026-06-03T00:00:00.000Z")).toBe(
      "2026년 6월 3일"
    );
    expect(formatYeonCardDeckCreatedDate("2026-06-03T00:00:00.000Z")).toBe(
      "2026년 6월 3일"
    );
  });

  it("missing or invalid dates use a stable fallback", () => {
    expect(formatYeonCardDeckUpdatedDate(null)).toBe(
      CARD_DECK_INVALID_DATE_LABEL
    );
    expect(formatYeonCardDeckCreatedDate("not-a-date")).toBe(
      CARD_DECK_INVALID_DATE_LABEL
    );
  });

  it("deck meta derives invalid updatedAt from the same fallback", () => {
    expect(
      formatCardDeckMeta({
        id: "deck-1",
        title: "테스트 덱",
        description: null,
        itemCount: 7,
        createdAt: "2026-06-03T00:00:00.000Z",
        updatedAt: "not-a-date",
      })
    ).toBe("카드 7장 · 업데이트 -");
  });
});
