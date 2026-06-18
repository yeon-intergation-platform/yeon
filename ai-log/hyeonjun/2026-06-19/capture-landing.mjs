import { chromium } from "playwright";

const phase = process.argv[2] ?? "before";
const outDir =
  "/Users/osuma/coding_stuffs/yeon/ai-log/hyeonjun/2026-06-19/landing-cta-align-screenshots";

const targets = [
  { name: "desktop", width: 1280, height: 1400 },
  { name: "mobile", width: 390, height: 1600 },
];

const browser = await chromium.launch();
try {
  for (const t of targets) {
    const ctx = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3100/", { waitUntil: "load" });
    // 서비스 카드 그리드(운영 중 배지)가 보일 때까지 대기
    await page.getByText("운영 중").first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(800);
    // 카드 그리드 컨테이너(키보드 타자연습 카드의 grid 조상)만 캡처
    const grid = page
      .getByText("키보드 타자연습")
      .first()
      .locator("xpath=ancestor::*[contains(@class,'grid')][1]");
    const file = `${outDir}/${phase}-platform-home-service-cards-${t.name}.png`;
    if ((await grid.count()) > 0) {
      await grid.screenshot({ path: file });
    } else {
      await page.screenshot({ path: file, fullPage: true });
    }
    console.log("saved", file);
    await ctx.close();
  }
} finally {
  await browser.close();
}
