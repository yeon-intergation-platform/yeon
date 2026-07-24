import { describe, expect, it } from "vitest";
import {
  TYPING_FALLBACK_PASSAGE_BY_LOCALE,
  TYPING_PASSAGES,
} from "./typing-content";

describe("한국어 기본 타자 지식 덱", () => {
  it("여러 분야의 지식 문장을 충분히 제공한다", () => {
    expect(TYPING_PASSAGES).toHaveLength(8);
    expect(TYPING_PASSAGES.map((passage) => passage.id)).toEqual(
      expect.arrayContaining([
        "curiosity-qr-recovery",
        "curiosity-mars-sunset",
        "curiosity-octopus-hearts",
        "curiosity-emoji-roots",
      ])
    );
  });

  it("API fallback도 기본 지식 덱의 첫 문장을 사용한다", () => {
    expect(TYPING_FALLBACK_PASSAGE_BY_LOCALE.ko).toBe(TYPING_PASSAGES[0]);
  });
});
