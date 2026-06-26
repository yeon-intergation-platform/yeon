import { describe, expect, it, vi } from "vitest";

vi.mock("@yeon/ui/runtime/YeonBrowserRuntime", () => ({
  getYeonNow: () => new Date("2026-06-27T10:30:00.000Z").getTime(),
}));

describe("community date format", () => {
  it("invalid ISO 입력은 날짜 formatter에서 안전한 fallback으로 표시한다", async () => {
    const {
      formatCommunityMediumDateTime,
      formatCommunityShortDateTime,
      readCommunityDateTimeMs,
    } = await import("./community-date-format");

    expect(formatCommunityShortDateTime("not-a-date")).toBe("날짜 없음");
    expect(formatCommunityMediumDateTime("not-a-date")).toBe("날짜 없음");
    expect(readCommunityDateTimeMs("not-a-date")).toBeNull();
  });

  it("relative time은 invalid ISO를 NaN 경로로 흘리지 않고 fallback을 반환한다", async () => {
    const { formatCommunityRelativeTime } =
      await import("./community-date-format");

    expect(formatCommunityRelativeTime("not-a-date")).toBe("날짜 없음");
  });

  it("relative time은 현재 시각 기준으로 분/시간/날짜 fallback을 구분한다", async () => {
    const { formatCommunityRelativeTime } =
      await import("./community-date-format");

    expect(formatCommunityRelativeTime("2026-06-27T10:29:30.000Z")).toBe(
      "방금 전"
    );
    expect(formatCommunityRelativeTime("2026-06-27T10:00:00.000Z")).toBe(
      "30분 전"
    );
    expect(formatCommunityRelativeTime("2026-06-27T08:30:00.000Z")).toBe(
      "2시간 전"
    );
  });
});
