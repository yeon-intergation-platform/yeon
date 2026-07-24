import { describe, expect, it } from "vitest";
import {
  TYPING_FALLBACK_PASSAGE_BY_LOCALE,
  TYPING_PASSAGES,
} from "./typing-content";

describe("한국어 기본 타자 지식 덱", () => {
  it("2025~2026년 여러 분야의 지식 문장을 30개 제공한다", () => {
    expect(TYPING_PASSAGES).toHaveLength(30);
    expect(TYPING_PASSAGES.map((passage) => passage.id)).toEqual(
      expect.arrayContaining([
        "trend-kpop-demon-hunters-views",
        "trend-rage-bait",
        "trend-spherex-cosmic-map",
        "trend-beta-pictoris-d",
      ])
    );
  });

  it("모든 문장 ID가 고유하고 최신 발표 연도를 포함한다", () => {
    const ids = TYPING_PASSAGES.map((passage) => passage.id);

    expect(new Set(ids).size).toBe(TYPING_PASSAGES.length);
    expect(
      TYPING_PASSAGES.every(
        (passage) =>
          passage.prompt.includes("2025년") || passage.prompt.includes("2026년")
      )
    ).toBe(true);
  });

  it("API fallback도 기본 지식 덱의 첫 문장을 사용한다", () => {
    expect(TYPING_FALLBACK_PASSAGE_BY_LOCALE.ko).toBe(TYPING_PASSAGES[0]);
  });
});
