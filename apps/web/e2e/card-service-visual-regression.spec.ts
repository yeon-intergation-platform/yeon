import { test, expect } from "@playwright/test";

/**
 * 카드 서비스 시각적 회귀 베이스라인 (slice 19).
 * Universal UI 포트/SSOT 이관이 카드 화면을 시각적으로 깨뜨리지 않음을 보장한다.
 *
 * 최초/갱신: pnpm --filter @yeon/web exec playwright test card-service-visual-regression --update-snapshots --project=chromium
 * 이후: 저장된 스냅샷과 비교.
 *
 * 동적 요소(커뮤니티 채팅 위젯·BGM·접속 수)는 <main> 밖이므로 main 영역만 캡처해 결정성을 확보한다.
 */
test.describe("카드 서비스 시각적 회귀", () => {
  test("덱 목록 빈 상태(게스트) 스냅샷", async ({ page }) => {
    await page.goto("/card-service/decks");
    await page.waitForLoadState("networkidle");
    // 클라이언트 쿼리(repository.listDecks)가 빈 상태로 정착할 때까지 대기.
    await page.waitForTimeout(900);

    await expect(page.locator("main").first()).toHaveScreenshot(
      "card-decks-empty-guest.png",
      { maxDiffPixels: 200 }
    );
  });
});
