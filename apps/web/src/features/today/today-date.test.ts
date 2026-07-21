import { describe, expect, it } from "vitest";

import {
  addMonths,
  buildCalendarCells,
  formatMinutes,
  normalizeDate,
} from "./today-date";

describe("today-date", () => {
  it("잘못된 날짜 query는 명시한 기본 날짜로 복구한다", () => {
    expect(normalizeDate("not-a-date", "2026-07-22")).toBe("2026-07-22");
    expect(normalizeDate("2026-02-30", "2026-07-22")).toBe("2026-07-22");
    expect(normalizeDate("2026-07-24", "2026-07-22")).toBe("2026-07-24");
  });

  it("월 이동 시 연도 경계를 처리한다", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("달력은 이전달과 다음달을 포함한 42칸을 만든다", () => {
    const cells = buildCalendarCells("2026-07");
    expect(cells).toHaveLength(42);
    expect(cells[0]?.date).toBe("2026-06-28");
    expect(cells.at(-1)?.date).toBe("2026-08-08");
  });

  it("분 단위를 읽기 좋은 시간으로 표현한다", () => {
    expect(formatMinutes(45)).toBe("45분");
    expect(formatMinutes(130)).toBe("2시간 10분");
  });
});
