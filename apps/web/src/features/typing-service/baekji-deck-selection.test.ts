import { describe, expect, it } from "vitest";
import { resolveBaekjiSelectedDeckId } from "./baekji-deck-selection";

const decks = [{ id: "deck-1" }, { id: "deck-2" }];

describe("baekji deck selection", () => {
  it("사용자가 고르기 전에는 첫 덱을 자동 선택하지 않는다", () => {
    expect(resolveBaekjiSelectedDeckId(null, decks)).toBe("");
  });

  it("목록에 실제로 있는 덱만 선택 상태로 인정한다", () => {
    expect(resolveBaekjiSelectedDeckId("deck-2", decks)).toBe("deck-2");
    expect(resolveBaekjiSelectedDeckId("missing", decks)).toBe("");
  });
});
