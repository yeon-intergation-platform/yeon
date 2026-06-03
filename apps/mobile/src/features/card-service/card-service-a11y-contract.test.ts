import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { formatCardDeckMeta } from "@yeon/ui/runtime/ports/card-deck";
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

  it("목록 카드 수량 메타는 공용 SSOT(formatCardDeckMeta)로만 파생한다", () => {
    // SSOT 마이그레이션 이후 덱 메타("카드 N장 · 업데이트 …") 포맷은
    // packages/ui/runtime/ports/card-deck/format.ts 한곳에서만 만든다.
    // 화면은 접미사를 직접 하드코딩하지 않고 공용 포맷터를 호출한다.
    const source = readFileSync(
      resolve(
        MOBILE_ROOT,
        "src/features/card-service/card-deck-list-screen.tsx"
      ),
      "utf8"
    );
    const usesSsotFormatter = /formatCardDeckMeta/.test(source);
    const meta = formatCardDeckMeta({
      id: "deck_test",
      title: "테스트 덱",
      description: null,
      itemCount: 3,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });

    expect(usesSsotFormatter).toBe(true);
    expect(meta).toContain("장");
    // 복습 카운트 접미사 상수는 여전히 "장"으로 유지한다.
    expect(CARD_SERVICE_TEXT.list.cardCountSuffix).toBe("장");
  });

  it("공통 액션 라벨 텍스트가 비어있지 않다", () => {
    expect(CARD_SERVICE_TEXT.shared.openDeckLabel).toBeTruthy();
    expect(CARD_SERVICE_TEXT.shared.openCardLabel).toBeTruthy();
    expect(CARD_SERVICE_TEXT.shared.closeModalLabel).toBeTruthy();
  });
});
