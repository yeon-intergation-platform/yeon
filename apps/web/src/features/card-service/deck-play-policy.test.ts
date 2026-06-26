import { describe, expect, it } from "vitest";
import {
  canMoveToNextCardDeckPlayItem,
  canMoveToPreviousCardDeckPlayItem,
  canSubmitCardDeckReview,
  clampCardDeckPlayIndex,
  parseCardDeckPlayIndexParam,
  resolveNextReviewCardDeckPlayIndex,
} from "@yeon/ui/runtime/ports/card-deck";

describe("card deck play policy", () => {
  it("URL index param은 음수, NaN, 빈 값을 0으로 정규화한다", () => {
    expect(parseCardDeckPlayIndexParam("2")).toBe(2);
    expect(parseCardDeckPlayIndexParam("-1")).toBe(0);
    expect(parseCardDeckPlayIndexParam("abc")).toBe(0);
    expect(parseCardDeckPlayIndexParam(null)).toBe(0);
  });

  it("현재 카드 index를 카드 수 경계 안으로 고정한다", () => {
    expect(clampCardDeckPlayIndex(-1, 3)).toBe(0);
    expect(clampCardDeckPlayIndex(1, 3)).toBe(1);
    expect(clampCardDeckPlayIndex(3, 3)).toBe(2);
    expect(clampCardDeckPlayIndex(10, 0)).toBe(0);
  });

  it("이전/다음 이동 가능 상태를 카드 수와 현재 index로 판정한다", () => {
    expect(
      canMoveToPreviousCardDeckPlayItem({ currentIndex: 0, itemCount: 3 })
    ).toBe(false);
    expect(
      canMoveToPreviousCardDeckPlayItem({ currentIndex: 1, itemCount: 3 })
    ).toBe(true);
    expect(
      canMoveToNextCardDeckPlayItem({ currentIndex: 1, itemCount: 3 })
    ).toBe(true);
    expect(
      canMoveToNextCardDeckPlayItem({ currentIndex: 2, itemCount: 3 })
    ).toBe(false);
    expect(
      canMoveToNextCardDeckPlayItem({ currentIndex: 0, itemCount: 0 })
    ).toBe(false);
  });

  it("복습 다음 카드는 마지막에서 첫 카드로 순환한다", () => {
    expect(
      resolveNextReviewCardDeckPlayIndex({ currentIndex: 0, itemCount: 3 })
    ).toBe(1);
    expect(
      resolveNextReviewCardDeckPlayIndex({ currentIndex: 2, itemCount: 3 })
    ).toBe(0);
    expect(
      resolveNextReviewCardDeckPlayIndex({ currentIndex: 0, itemCount: 0 })
    ).toBe(0);
  });

  it("복습 채점은 현재 카드가 있고 정답이 보이며 저장 중이 아닐 때만 가능하다", () => {
    expect(
      canSubmitCardDeckReview({
        currentItemId: "item-1",
        isAnswerVisible: true,
        isSaving: false,
      })
    ).toBe(true);
    expect(
      canSubmitCardDeckReview({
        currentItemId: null,
        isAnswerVisible: true,
        isSaving: false,
      })
    ).toBe(false);
    expect(
      canSubmitCardDeckReview({
        currentItemId: "item-1",
        isAnswerVisible: false,
        isSaving: false,
      })
    ).toBe(false);
    expect(
      canSubmitCardDeckReview({
        currentItemId: "item-1",
        isAnswerVisible: true,
        isSaving: true,
      })
    ).toBe(false);
  });
});
