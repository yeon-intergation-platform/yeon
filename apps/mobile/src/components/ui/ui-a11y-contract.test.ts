import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const MOBILE_ROOT = process.cwd().endsWith("apps/mobile")
  ? process.cwd()
  : resolve(process.cwd(), "apps/mobile");

function extractNumber(source: string, key: string) {
  const match = source.match(new RegExp(`${key}:\\s*(\\d+)`));
  return match ? Number.parseInt(match[1], 10) : null;
}

describe("UI 접근성 계약 (터치 타깃/라벨)", () => {
  it("ActionButton는 최소 높이 44px 이상", () => {
    const source = readFileSync(
      resolve(MOBILE_ROOT, "src/components/ui/action-button.tsx"),
      "utf8"
    );

    const minHeight = extractNumber(source, "minHeight");
    expect(minHeight).toBeGreaterThanOrEqual(44);
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain("accessibilityLabel");
  });

  it("TopBar 액션 버튼은 기본 padding으로 충분한 터치 영역 확보", () => {
    const source = readFileSync(
      resolve(MOBILE_ROOT, "src/components/ui/top-bar.tsx"),
      "utf8"
    );

    const paddingVertical = extractNumber(source, "paddingVertical");
    expect(paddingVertical).toBeGreaterThanOrEqual(10);
    expect(source).toContain('accessibilityRole="button"');
  });
});
