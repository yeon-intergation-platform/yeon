import { chromium } from "playwright";

const phase = process.argv[2] ?? "before";
const outDir =
  "/Users/osuma/coding_stuffs/yeon/ai-log/hyeonjun/2026-06-19/header-brand-nav-screenshots";

// dev(localhost) = root domain → 서비스 경로 prefix 포함
const routes = [
  { slug: "typing", path: "/typing-service" },
  { slug: "card", path: "/card-service" },
  { slug: "community", path: "/community" },
  { slug: "news", path: "/news" },
];

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto(`http://localhost:3100${r.path}`, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    // 헤더 영역만 (상단 120px)
    const file = `${outDir}/${phase}-header-${r.slug}.png`;
    await page.screenshot({
      path: file,
      clip: { x: 0, y: 0, width: 1280, height: 110 },
    });
    // 브랜드 링크 href 기록
    const href = await page
      .locator("header a, nav a")
      .first()
      .getAttribute("href")
      .catch(() => null);
    console.log(`saved ${file} | first-link href=${href}`);
  }
  await ctx.close();
} finally {
  await browser.close();
}
