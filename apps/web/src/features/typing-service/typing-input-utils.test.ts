import { describe, expect, it } from "vitest";
import { normalizeTypingInput } from "./typing-input-utils";

describe("normalizeTypingInput", () => {
  it("빠르게 들어온 연속 입력을 그대로 유지한다", () => {
    expect(normalizeTypingInput("리듬을 유지한 채", 20)).toBe(
      "리듬을 유지한 채"
    );
  });

  it("오타 뒤에 이어진 입력을 자르지 않는다", () => {
    expect(normalizeTypingInput("리듬을 유자한 채 속도를", 20)).toBe(
      "리듬을 유자한 채 속도를"
    );
  });

  it("백스페이스로 줄어든 값을 그대로 반영한다", () => {
    expect(normalizeTypingInput("리듬을", 20)).toBe("리듬을");
    expect(normalizeTypingInput("", 20)).toBe("");
  });

  it("문장 길이를 넘는 입력만 자른다", () => {
    expect(normalizeTypingInput("가나다라마", 3)).toBe("가나다");
  });
});
