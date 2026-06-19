import { chromium } from "playwright";

const outDir =
  "/Users/osuma/coding_stuffs/yeon/ai-log/hyeonjun/2026-06-19/game-service-screenshots";

const shots = [
  { name: "hub-desktop", path: "/game-service", w: 1280, h: 1000, full: true },
  { name: "hub-mobile", path: "/game-service", w: 390, h: 1200, full: true },
  {
    name: "detail-2048-desktop",
    path: "/game-service/2048",
    w: 1280,
    h: 1400,
    full: true,
    waitIframe: true,
  },
  {
    name: "detail-2048-mobile",
    path: "/game-service/2048",
    w: 390,
    h: 1600,
    full: true,
    waitIframe: true,
  },
];

const browser = await chromium.launch();
try {
  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3100${s.path}`, { waitUntil: "load" });
    await page.waitForTimeout(s.waitIframe ? 4000 : 2000);
    // iframe 실제 로드 여부 확인
    let iframeInfo = "n/a";
    if (s.waitIframe) {
      const frames = page.frames();
      iframeInfo = `frames=${frames.length} urls=${frames.map((f) => f.url()).join(",")}`;
    }
    const file = `${outDir}/after-${s.name}.png`;
    await page.screenshot({ path: file, fullPage: s.full });
    console.log(`saved ${file} | ${iframeInfo}`);
    await ctx.close();
  }

  // landing 홈에 게임 카드 노출 확인
  const ctx2 = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
  });
  const page2 = await ctx2.newPage();
  await page2.goto("http://localhost:3100/", { waitUntil: "load" });
  await page2.waitForTimeout(3000);
  const hasGameCard = await page2
    .getByText("게임", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  console.log(`landing 게임 카드 노출: ${hasGameCard}`);
  await ctx2.close();
} finally {
  await browser.close();
}
