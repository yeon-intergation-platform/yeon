import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { CARD_SERVICE_TEXT } from "./card-service-copy";

const MOBILE_ROOT = process.cwd().endsWith("apps/mobile")
  ? process.cwd()
  : resolve(process.cwd(), "apps/mobile");

const FILES = [
  "src/features/card-service/card-deck-list-screen.tsx",
  "src/features/card-service/card-deck-detail-screen.tsx",
  "src/features/card-service/card-deck-play-screen.tsx",
];

describe("카드 서비스 접근성/문구 계약", () => {
  it("Pressable onPress는 accessibilityRole 또는 accessibilityLabel을 함께 갖는다", () => {
    for (const file of FILES) {
      const source = readFileSync(resolve(MOBILE_ROOT, file), "utf8");
      const pressableBlocks = [...source.matchAll(/<Pressable\\b[\\s\\S]*?>/g)];
      const missing = pressableBlocks.filter((entry) => {
        const source = entry[0];
        const hasOnPress = /onPress\\s*=/.test(source);
        const hasRole = /accessibilityRole\\s*=/.test(source);
        const hasLabel = /accessibilityLabel\\s*=/.test(source);
        return hasOnPress && !hasRole && !hasLabel;
      });

      expect(missing).toEqual([]);
    }
  });

  it("목록 카드 수량 접미사는 상수로만 관리한다", () => {
    const source = readFileSync(
      resolve(
        MOBILE_ROOT,
        "src/features/card-service/card-deck-list-screen.tsx"
      ),
      "utf8"
    );
    const hasSuffixConstant = /cardCountSuffix/.test(source);
    const suffixValue = CARD_SERVICE_TEXT.list.cardCountSuffix;

    expect(hasSuffixConstant).toBe(true);
    expect(suffixValue).toBe("장");
  });

  it("공통 액션 라벨 텍스트가 비어있지 않다", () => {
    expect(CARD_SERVICE_TEXT.shared.openDeckLabel).toBeTruthy();
    expect(CARD_SERVICE_TEXT.shared.openCardLabel).toBeTruthy();
    expect(CARD_SERVICE_TEXT.shared.closeModalLabel).toBeTruthy();
  });
});
