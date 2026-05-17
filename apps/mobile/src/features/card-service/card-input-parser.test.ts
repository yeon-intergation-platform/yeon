import { describe, expect, it } from "vitest";

import { parseAiCardInput } from "./card-input-parser";

describe("parseAiCardInput", () => {
  it("Q/A 페어를 카드 단위로 파싱한다", () => {
    const text = [
      "[[Q]]",
      "질문1",
      "[[A]]",
      "답1",
      "[[CARD]]",
      "[[Q]]",
      "질문2",
      "[[A]]",
      "답2",
    ].join("\n");

    const cards = parseAiCardInput(text);

    expect(cards).toEqual([
      { frontText: "질문1", backText: "답1" },
      { frontText: "질문2", backText: "답2" },
    ]);
  });

  it("Q 또는 A 구분자가 없는 라인은 무시한다", () => {
    const cards = parseAiCardInput(
      ["인트로", "[[CARD]]", "질문", "[[A]]", "답"].join("\n")
    );

    expect(cards).toEqual([]);
  });

  it("한 줄로 된 빈칸과 CRLF을 정규화한다", () => {
    const cards = parseAiCardInput("[[Q]]\r\n질문\r\n[[A]]\r\n\r\n답\r\n");

    expect(cards).toEqual([{ frontText: "질문", backText: "답" }]);
  });
});
