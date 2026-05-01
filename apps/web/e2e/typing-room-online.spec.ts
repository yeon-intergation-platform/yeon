import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

const RUN_ONLINE_TYPING_ROOM_E2E =
  process.env.RUN_TYPING_ROOM_ONLINE_E2E === "1";
const WEB_HEALTH_PATH =
  process.env.TYPING_ROOM_WEB_HEALTH_PATH ?? "/typing-service/rooms";
const RACE_SERVER_HTTP_URL =
  process.env.RACE_SERVER_HTTP_URL ?? "http://localhost:2567";
const HOST_NAME = "E2E Host";
const GUEST_NAME = "E2E Guest";

async function setTypingIdentity(
  context: BrowserContext,
  nickname: string,
  playerId: string,
) {
  await context.addInitScript(
    ({ nickname: name, playerId: id }) => {
      window.localStorage.setItem(
        "yeon:typing-profile",
        JSON.stringify({ nickname: name, characterId: "camel" }),
      );
      window.localStorage.setItem("yeon:typing-player-id", id);
      window.localStorage.setItem(
        "yeon:typing-settings",
        JSON.stringify({
          state: {
            settings: {
              locale: "ko",
              selectedDeckIdsByLanguage: { ko: "local-default-ko" },
            },
          },
          version: 0,
        }),
      );
    },
    { nickname, playerId },
  );
}

async function createPlayerPage(
  browser: Browser,
  nickname: string,
  playerId: string,
) {
  const context = await browser.newContext();
  await setTypingIdentity(context, nickname, playerId);
  const page = await context.newPage();
  return { context, page };
}

async function getPromptText(page: Page) {
  await expect(page.getByLabel("타자 입력 영역")).toBeEnabled({
    timeout: 8_000,
  });
  const prompt = await page
    .locator("textarea[aria-label='타자 입력 영역']")
    .locator("xpath=preceding-sibling::div[1]")
    .innerText();
  return prompt.replace(/\s+/g, " ").trim();
}

test.describe("온라인 타자방 2-browser 검증", () => {
  test.skip(
    !RUN_ONLINE_TYPING_ROOM_E2E,
    "Set RUN_TYPING_ROOM_ONLINE_E2E=1 after starting web and race-server locally.",
  );

  test("second browser joins, readies, starts with the same prompt, progresses, and shows results", async ({
    browser,
    request,
    baseURL,
  }) => {
    const raceHealth = await request.get(`${RACE_SERVER_HTTP_URL}/health`);
    expect(
      raceHealth.ok(),
      "race-server /health should respond before browser flow",
    ).toBeTruthy();

    const webHealth = await request.get(`${baseURL}${WEB_HEALTH_PATH}`);
    expect(
      webHealth.ok(),
      "web typing room page should respond before browser flow",
    ).toBeTruthy();

    const host = await createPlayerPage(browser, HOST_NAME, "e2e-host-player");
    const guest = await createPlayerPage(
      browser,
      GUEST_NAME,
      "e2e-guest-player",
    );

    try {
      await host.page.goto("/typing-service/rooms");
      await host.page.getByLabel("방 제목").fill(`E2E 타자방 ${Date.now()}`);
      await host.page.getByLabel("최대 인원").selectOption("2");
      await host.page.getByRole("button", { name: "타자방 만들기" }).click();

      await expect(host.page.getByText(HOST_NAME)).toBeVisible({
        timeout: 15_000,
      });
      await expect(host.page.getByText(/Players\s*1\s*\/\s*2/)).toBeVisible();
      const invitePath = new URL(host.page.url()).pathname;
      expect(invitePath).toMatch(/\/typing-service\/rooms\/[^/]+$/);

      await guest.page.goto(invitePath);
      await expect(guest.page.getByText(GUEST_NAME)).toBeVisible({
        timeout: 15_000,
      });
      await expect(host.page.getByText(GUEST_NAME)).toBeVisible({
        timeout: 15_000,
      });
      await expect(host.page.getByText(/Players\s*2\s*\/\s*2/)).toBeVisible();

      await guest.page.getByRole("button", { name: "준비하기" }).click();
      await expect(host.page.getByText("준비완료")).toHaveCount(2, {
        timeout: 5_000,
      });
      await expect(
        host.page.getByRole("button", { name: /시작하기/ }),
      ).toBeEnabled();
      await host.page.getByRole("button", { name: /시작하기/ }).click();

      const hostPrompt = await getPromptText(host.page);
      const guestPrompt = await getPromptText(guest.page);
      expect(hostPrompt).toBeTruthy();
      expect(guestPrompt).toBe(hostPrompt);

      await host.page
        .getByLabel("타자 입력 영역")
        .fill(hostPrompt.slice(0, Math.ceil(hostPrompt.length / 2)));
      await expect(host.page.getByText(/progress\s+[1-9][0-9]?%/)).toBeVisible({
        timeout: 3_000,
      });
      await expect(
        guest.page.getByText(new RegExp(`${HOST_NAME}.*[1-9][0-9]?%`, "s")),
      ).toBeVisible({ timeout: 5_000 });

      await host.page.getByLabel("타자 입력 영역").fill(hostPrompt);
      await guest.page.getByLabel("타자 입력 영역").fill(guestPrompt);

      await expect(
        host.page.getByRole("heading", { name: "타자 대결 결과" }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        guest.page.getByRole("heading", { name: "타자 대결 결과" }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(host.page.getByText(HOST_NAME).last()).toBeVisible();
      await expect(host.page.getByText(GUEST_NAME).last()).toBeVisible();
    } finally {
      await host.context.close();
      await guest.context.close();
    }
  });
});
