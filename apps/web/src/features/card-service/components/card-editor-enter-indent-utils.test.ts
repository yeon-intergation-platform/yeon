import { describe, expect, it } from "vitest";
import { getCardEditorLineLeadingIndentBeforeCursor } from "./card-editor-enter-indent-utils";

describe("card-editor-enter-indent-utils", () => {
  it("일반 공백 들여쓰기를 반환한다", () => {
    expect(getCardEditorLineLeadingIndentBeforeCursor("    들여쓴 문장")).toBe(
      "    "
    );
  });

  it("탭 들여쓰기를 반환한다", () => {
    expect(getCardEditorLineLeadingIndentBeforeCursor("\t\t들여쓴 문장")).toBe(
      "\t\t"
    );
  });

  it("들여쓰기가 없으면 빈 문자열을 반환한다", () => {
    expect(getCardEditorLineLeadingIndentBeforeCursor("들여쓰기 없음")).toBe(
      ""
    );
  });

  it("커서 앞 마지막 줄의 들여쓰기만 반환한다", () => {
    expect(
      getCardEditorLineLeadingIndentBeforeCursor("  첫 줄\n    두 번째 줄")
    ).toBe("    ");
  });

  it("공백만 있는 줄도 사용자가 입력한 들여쓰기로 유지한다", () => {
    expect(getCardEditorLineLeadingIndentBeforeCursor("  ")).toBe("  ");
  });
});
