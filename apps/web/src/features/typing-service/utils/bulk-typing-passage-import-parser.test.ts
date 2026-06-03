import { describe, expect, it } from "vitest";
import {
  parseBulkTypingPassageImportInput,
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
  TYPING_PASSAGE_TEXT_MAX_LENGTH,
} from "./bulk-typing-passage-import-parser";

describe("parseBulkTypingPassageImportInput", () => {
  it("[[PASSAGE]], [[TITLE]], [[TEXT]] 마커로 여러 문단을 파싱한다", () => {
    const result = parseBulkTypingPassageImportInput(`[[PASSAGE]]
[[TITLE]]
짧은 호흡 연습
[[TEXT]]
오늘은 정확하게 끝까지 치는 연습을 합니다.
[[PASSAGE]]
[[TITLE]]
Flow warmup
[[TEXT]]
Keep your eyes one word ahead.`);

    expect(result.errors).toEqual([]);
    expect(result.passages).toEqual([
      {
        title: "짧은 호흡 연습",
        prompt: "오늘은 정확하게 끝까지 치는 연습을 합니다.",
      },
      { title: "Flow warmup", prompt: "Keep your eyes one word ahead." },
    ]);
  });

  it("[[TITLE]]은 선택 사항이고 [[TEXT]]만으로도 문단을 만든다", () => {
    const result = parseBulkTypingPassageImportInput(`[[TEXT]]
제목 없는 문장`);

    expect(result.errors).toEqual([]);
    expect(result.passages).toEqual([{ prompt: "제목 없는 문장" }]);
  });

  it("마커는 공백 포함 한 줄 전체가 일치하면 인식한다", () => {
    const result = parseBulkTypingPassageImportInput(`  [[TEXT]]  
본문`);

    expect(result.errors).toEqual([]);
    expect(result.passages[0]).toEqual({ prompt: "본문" });
  });

  it("마커와 내용이 같은 줄에 붙으면 마커로 인식하지 않고 빈 줄 기준 fallback을 쓴다", () => {
    const result = parseBulkTypingPassageImportInput(`[[TEXT]]본문`);

    expect(result.errors).toEqual([]);
    expect(result.warnings[0]).toContain("빈 줄 기준");
    expect(result.passages).toEqual([{ prompt: "[[TEXT]]본문" }]);
  });

  it("본문 안의 일반 마커 문자열은 내용으로 유지한다", () => {
    const result = parseBulkTypingPassageImportInput(`[[TEXT]]
문장 안의 [[TITLE]] 문자열은 마커가 아니다`);

    expect(result.errors).toEqual([]);
    expect(result.passages[0]).toEqual({
      prompt: "문장 안의 [[TITLE]] 문자열은 마커가 아니다",
    });
  });

  it("내용으로 마커 한 줄이 필요하면 백슬래시로 이스케이프할 수 있다", () => {
    const result = parseBulkTypingPassageImportInput(`[[TITLE]]
\\[[PASSAGE]]
[[TEXT]]
\\[[TEXT]]`);

    expect(result.errors).toEqual([]);
    expect(result.passages[0]).toEqual({
      title: "[[PASSAGE]]",
      prompt: "[[TEXT]]",
    });
  });

  it("[[TEXT]]가 없으면 오류를 반환한다", () => {
    const result = parseBulkTypingPassageImportInput(`[[TITLE]]
제목만 있음`);

    expect(result.passages).toEqual([]);
    expect(result.errors[0]).toContain("본문([[TEXT]])");
  });

  it("마커가 없으면 빈 줄 문단 그룹으로 fallback 파싱한다", () => {
    const result = parseBulkTypingPassageImportInput(`첫 번째 문단입니다.
계속 이어집니다.

두 번째 문단입니다.`);

    expect(result.errors).toEqual([]);
    expect(result.warnings[0]).toContain("빈 줄 기준");
    expect(result.passages).toEqual([
      { prompt: "첫 번째 문단입니다.\n계속 이어집니다." },
      { prompt: "두 번째 문단입니다." },
    ]);
  });

  it("본문 최대 길이와 최대 개수를 검증한다", () => {
    const longResult = parseBulkTypingPassageImportInput(`[[TEXT]]
${"가".repeat(TYPING_PASSAGE_TEXT_MAX_LENGTH + 1)}`);
    expect(longResult.errors[0]).toContain(
      `${TYPING_PASSAGE_TEXT_MAX_LENGTH}자`
    );

    const tooMany = Array.from(
      { length: TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS + 1 },
      (_, index) => `문단 ${index + 1}`
    ).join("\n\n");
    const countResult = parseBulkTypingPassageImportInput(tooMany);
    expect(countResult.passages).toHaveLength(
      TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS
    );
    expect(countResult.errors[0]).toContain(
      `${TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}개`
    );
  });
});
