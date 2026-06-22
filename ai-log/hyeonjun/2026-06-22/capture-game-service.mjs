import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const outDir =
  "/Users/osuma/coding_stuffs/yeon/ai-log/hyeonjun/2026-06-22/game-service-screenshots";
mkdirSync(outDir, { recursive: true });

// game.yeon.world 서브도메인 라우팅을 로컬에서 재현한다. Host 헤더는 Chromium 금지
// 헤더라 직접 못 넣으므로, host-resolver-rules로 game.yeon.world를 127.0.0.1로 매핑해
// 실제 Host 헤더(game.yeon.world)가 dev 서버에 전달되게 한다.
const BASE = "http://game.yeon.world:3100";
const HOST_HEADER = {};

const browser = await chromium.launch({
  args: ["--host-resolver-rules=MAP game.yeon.world 127.0.0.1"],
});
try {
  // 1) 허브 desktop / mobile
  for (const v of [
    { name: "hub-desktop", w: 1280, h: 1000 },
    { name: "hub-mobile", w: 390, h: 1400 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: 2,
      extraHTTPHeaders: HOST_HEADER,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const cards = await page.locator('a[href^="/game-service/"]').count();
    await page.screenshot({ path: `${outDir}/after-${v.name}.png`, fullPage: true });
    console.log(`saved after-${v.name}.png | cards=${cards}`);
    await ctx.close();
  }

  // 2) 상세: 클릭 게이트(포스터) → "게임 시작" 클릭 → iframe 로드
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1200 },
    deviceScaleFactor: 2,
    extraHTTPHeaders: HOST_HEADER,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/commando-gun-shooting`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const iframeBeforeClick = await page.locator("iframe").count();
  await page.screenshot({
    path: `${outDir}/after-detail-poster.png`,
    fullPage: true,
  });
  console.log(`saved after-detail-poster.png | iframeBeforeClick=${iframeBeforeClick}`);

  await page.getByRole("button", { name: /게임 시작/ }).click();
  await page.waitForTimeout(5000);
  const frames = page.frames();
  const gameFrame = frames.find((f) => f.url().includes("gamemonetize"));
  await page.screenshot({
    path: `${outDir}/after-detail-playing.png`,
    fullPage: true,
  });
  console.log(
    `saved after-detail-playing.png | frames=${frames.length} gameFrame=${gameFrame ? gameFrame.url() : "none"}`
  );
  await ctx.close();
} finally {
  await browser.close();
}
