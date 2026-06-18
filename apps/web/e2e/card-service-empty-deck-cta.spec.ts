import { expect, test, type Page } from "@playwright/test";

async function clearGuestCardStore(page: Page) {
  await page.goto("/card-service/decks");
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase("yeon-guest-card-service");
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => resolve(undefined);
      request.onblocked = () => resolve(undefined);
    });
  });
  await page.reload();
}

test.describe("카드 서비스 빈 덱 CTA", () => {
  test("빈 덱 상세에서는 학습 시작 대신 첫 카드 추가를 기본 행동으로 제공한다", async ({
    page,
  }) => {
    await clearGuestCardStore(page);

    await expect(page.getByText("아직 덱이 없습니다")).toBeVisible();
    await page.getByRole("button", { name: "첫 덱 만들기" }).click();
    await page.locator("dialog[open] input").first().fill("빈 덱 CTA 검증");
    await page
      .locator("dialog[open] textarea")
      .first()
      .fill("학습 전 카드 추가 유도 검증용 덱");
    await page
      .locator("dialog[open]")
      .getByRole("button", { name: "만들기", exact: true })
      .click();

    await expect(page.getByText("빈 덱 CTA 검증").first()).toBeVisible();
    await page.getByText("빈 덱 CTA 검증").first().click();

    await expect(page.getByText("아직 카드가 없습니다.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /첫 카드 추가/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "+ 카드 추가", exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "카드 추가", exact: true })
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: /학습 시작/ })).toHaveCount(0);

    await page.getByRole("button", { name: /첫 카드 추가/ }).click();
    await expect(page.locator("dialog[open]")).toContainText("카드 추가");
  });
});
