import { describe, expect, it } from "vitest";
import {
  formatElapsedSeconds,
  formatRemainingSeconds,
  normalizeQueryText,
} from "./focus-desk-format";

describe("focus-desk-format", () => {
  it("query text는 공백과 빈 값을 null로 보정한다", () => {
    expect(normalizeQueryText(" deck-1 ")).toBe("deck-1");
    expect(normalizeQueryText("   ")).toBeNull();
    expect(normalizeQueryText(null)).toBeNull();
  });

  it("남은 시간은 음수와 소수 입력도 안정적인 타이머 문자열로 표시한다", () => {
    expect(formatRemainingSeconds(1500)).toBe("25:00");
    expect(formatRemainingSeconds(61.9)).toBe("1:01");
    expect(formatRemainingSeconds(-3)).toBe("0:00");
  });

  it("경과 시간은 사용자에게 읽히는 한국어 단위로 표시한다", () => {
    expect(formatElapsedSeconds(59)).toBe("59초");
    expect(formatElapsedSeconds(60)).toBe("1분");
    expect(formatElapsedSeconds(125)).toBe("2분 5초");
  });
});
