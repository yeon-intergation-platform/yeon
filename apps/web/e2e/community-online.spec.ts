import { expect, test, type Page } from "@playwright/test";

const RUN_ONLINE_COMMUNITY_E2E = process.env.RUN_COMMUNITY_ONLINE_E2E === "1";

async function registerGuestIdentity(
  page: Page,
  nickname: string,
  password: string
) {
  const identityCard = page.locator('aside[aria-label="게스트 인증"]');
  const nicknameInput = identityCard.getByPlaceholder("닉네임 입력");
  const passwordInput = identityCard.getByPlaceholder("수정/삭제용 비밀번호");

  await expect(nicknameInput).not.toHaveValue("", { timeout: 15_000 });
  await nicknameInput.fill(nickname);
  await passwordInput.fill(password);
  await expect(nicknameInput).toHaveValue(nickname);
  await expect(passwordInput).toHaveValue(password);
  await identityCard.getByRole("button", { name: /등록/ }).click();
  await expect(identityCard.getByText("등록됨")).toBeVisible({
    timeout: 15_000,
  });
}

async function createPost(
  page: Page,
  title: string,
  content: string,
  category = "잡담"
) {
  await page.getByRole("button", { name: "글쓰기" }).click();
  await page.getByLabel("카테고리").selectOption(category);
  await page.getByPlaceholder("제목을 입력하세요").fill(title);
  await page.getByPlaceholder("내용을 입력하세요").fill(content);
  await page.getByRole("button", { name: /^게시$/ }).click();
  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
}

async function writeStoredGuestIdentity(
  page: Page,
  nickname: string,
  password: string
) {
  await page.evaluate(
    ({ nickname: nextNickname, password: nextPassword }) => {
      window.localStorage.setItem(
        "yeon-community-guest-nickname",
        nextNickname
      );
      window.localStorage.setItem(
        "yeon-community-guest-password",
        nextPassword
      );
    },
    { nickname, password }
  );
}

async function deletePostIfPresent(page: Page, title: string) {
  const article = page.locator("article").filter({ hasText: title }).first();
  const isVisible = await article
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (!isVisible) {
    return;
  }

  await article.getByRole("button", { name: "삭제" }).click();
  await page.waitForFunction(
    (text) => !document.body.innerText.includes(text),
    title,
    {
      timeout: 10_000,
    }
  );
}

test.describe("커뮤니티 온라인 게스트 인증 검증", () => {
  test.skip(
    !RUN_ONLINE_COMMUNITY_E2E,
    "Set RUN_COMMUNITY_ONLINE_E2E=1 after starting web and Spring backend locally."
  );

  test("저장된 게스트 비밀번호가 틀려도 화면 오류만 표시하고 runtime error로 번지지 않는다", async ({
    page,
  }) => {
    const stamp = Date.now();
    const nickname = `community-e2e-${stamp}`;
    const password = `pass-${stamp}`;
    const title = `커뮤니티 E2E 실패경계 ${stamp}`;
    const content = `저장 인증 실패경계 검증 ${stamp}`;
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.goto("/community");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: "domcontentloaded" });

      await registerGuestIdentity(page, nickname, password);
      await createPost(page, title, content);

      await writeStoredGuestIdentity(page, nickname, `wrong-${password}`);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(
        page.locator('aside[aria-label="게스트 인증"]').getByText("등록됨")
      ).toBeVisible({ timeout: 15_000 });

      const article = page
        .locator("article")
        .filter({ hasText: title })
        .first();
      await article.getByRole("button", { name: "삭제" }).click();

      await expect(article.getByText("삭제 권한이 없습니다.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByLabel("Runtime Error")).toHaveCount(0);
      expect(pageErrors).toEqual([]);
    } finally {
      await writeStoredGuestIdentity(page, nickname, password);
      await page.reload({ waitUntil: "domcontentloaded" });
      await deletePostIfPresent(page, title).catch(() => {});
    }
  });

  test("글 수정은 제목과 카테고리를 보존하고 본문만 바꾼다", async ({
    page,
  }) => {
    const stamp = Date.now();
    const nickname = `community-edit-${stamp}`;
    const password = `pass-${stamp}`;
    const title = `커뮤니티 수정 보존 ${stamp}`;
    const content = `수정 전 본문 ${stamp}`;
    const editedContent = `수정 후 본문 ${stamp}`;

    try {
      await page.goto("/community");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: "domcontentloaded" });

      await registerGuestIdentity(page, nickname, password);
      await createPost(page, title, content, "카드친구 모집");

      const postIndex = await page
        .locator("article")
        .evaluateAll(
          (articles, expectedTitle) =>
            articles.findIndex((article) =>
              article.textContent?.includes(String(expectedTitle))
            ),
          title
        );
      expect(postIndex).toBeGreaterThanOrEqual(0);

      const article = page.locator("article").nth(postIndex);
      await article.getByRole("button", { name: "수정" }).click();
      await expect(article.getByLabel("카테고리")).toHaveValue("카드친구 모집");
      await expect(article.getByPlaceholder("제목을 입력하세요")).toHaveValue(
        title
      );
      await article.getByPlaceholder("내용을 입력하세요").fill(editedContent);
      await article.getByRole("button", { name: "저장" }).click();

      await expect(article.getByRole("heading", { name: title })).toBeVisible({
        timeout: 15_000,
      });
      await expect(article.getByText("카드친구 모집")).toBeVisible();
      await expect(article.getByText(editedContent)).toBeVisible();
      await expect(article.getByText(content)).toHaveCount(0);
    } finally {
      await writeStoredGuestIdentity(page, nickname, password);
      await page.reload({ waitUntil: "domcontentloaded" });
      await deletePostIfPresent(page, title).catch(() => {});
    }
  });
});
