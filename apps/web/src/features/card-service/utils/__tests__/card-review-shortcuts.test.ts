import { describe, expect, it } from "vitest";
import { CARD_REVIEW_DIFFICULTIES } from "@yeon/api-contract/card-decks";
import {
  isCardReviewRevealShortcut,
  isCardReviewSkipShortcut,
  resolveCardReviewDifficultyShortcut,
} from "../card-review-shortcuts";

function keyboardEvent(code: string, key: string) {
  return { code, key };
}

describe("card review shortcuts", () => {
  it("스킵 단축키는 한국어 입력 상태에서도 물리 S 키로 동작한다", () => {
    expect(isCardReviewSkipShortcut(keyboardEvent("KeyS", "ㄴ"))).toBe(true);
  });

  it("스킵 단축키는 기존 영문 key 판정도 유지한다", () => {
    expect(isCardReviewSkipShortcut(keyboardEvent("", "S"))).toBe(true);
  });

  it("스킵 단축키는 다른 물리 키의 한글 입력을 스킵으로 보지 않는다", () => {
    expect(isCardReviewSkipShortcut(keyboardEvent("KeyD", "ㅇ"))).toBe(false);
  });

  it("숫자 채점 단축키는 물리 숫자 키와 키패드를 인식한다", () => {
    expect(
      resolveCardReviewDifficultyShortcut(keyboardEvent("Digit1", "!"))
    ).toBe(CARD_REVIEW_DIFFICULTIES.hard);
    expect(
      resolveCardReviewDifficultyShortcut(keyboardEvent("Numpad3", "PageDown"))
    ).toBe(CARD_REVIEW_DIFFICULTIES.easy);
  });

  it("정답 공개 단축키는 물리 스페이스 키를 인식한다", () => {
    expect(isCardReviewRevealShortcut(keyboardEvent("Space", "Process"))).toBe(
      true
    );
  });
});
