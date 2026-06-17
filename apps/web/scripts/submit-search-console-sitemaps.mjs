#!/usr/bin/env node

import { google } from "googleapis";

const WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";

const SEARCH_CONSOLE_TARGETS = [
  {
    siteUrl: "https://yeon.world/",
    sitemapUrl: "https://yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://typing.yeon.world/",
    sitemapUrl: "https://typing.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://card.yeon.world/",
    sitemapUrl: "https://card.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://community.yeon.world/",
    sitemapUrl: "https://community.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://support.yeon.world/",
    sitemapUrl: "https://support.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://news.yeon.world/",
    sitemapUrl: "https://news.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://blog.yeon.world/",
    sitemapUrl: "https://blog.yeon.world/sitemap.xml",
    owner: "yeon-web",
  },
  {
    siteUrl: "https://discord-ai.yeon.world/",
    sitemapUrl: "https://discord-ai.yeon.world/sitemap.xml",
    owner: "discord-assitant",
  },
];

function hasArg(name) {
  return process.argv.includes(name);
}

function printUsage() {
  console.log(`Usage:
  pnpm --filter @yeon/web search-console:sitemaps
  pnpm --filter @yeon/web search-console:sitemaps -- --execute

Options:
  --execute       실제 Search Console API sites.add + sitemaps.submit 실행
  --skip-sites    --execute 시 sites.add 생략
  --skip-sitemaps --execute 시 sitemaps.submit 생략
  --help          도움말 출력`);
}

function printTargets() {
  for (const target of SEARCH_CONSOLE_TARGETS) {
    console.log(
      `- ${target.siteUrl} sitemap=${target.sitemapUrl} owner=${target.owner}`
    );
  }
}

async function getWebmastersClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: [WEBMASTERS_SCOPE],
  });
  const authClient = await auth.getClient();

  return google.webmasters({ version: "v3", auth: authClient });
}

async function addSite(webmasters, target) {
  await webmasters.sites.add({
    siteUrl: target.siteUrl,
  });
}

async function submitSitemap(webmasters, target) {
  await webmasters.sitemaps.submit({
    siteUrl: target.siteUrl,
    feedpath: target.sitemapUrl,
  });
}

async function run() {
  if (hasArg("--help")) {
    printUsage();
    return;
  }

  const execute = hasArg("--execute");
  const shouldAddSites = !hasArg("--skip-sites");
  const shouldSubmitSitemaps = !hasArg("--skip-sitemaps");

  console.log("[search-console] targets");
  printTargets();

  if (!execute) {
    console.log("[search-console] dry-run only. API 호출 없음.");
    console.log(
      "[search-console] 실행하려면 GOOGLE_APPLICATION_CREDENTIALS 또는 ADC를 준비한 뒤 --execute를 붙이세요."
    );
    return;
  }

  if (!shouldAddSites && !shouldSubmitSitemaps) {
    throw new Error("--skip-sites와 --skip-sitemaps를 동시에 줄 수 없습니다.");
  }

  console.log(
    `[search-console] credentials=${
      process.env.GOOGLE_APPLICATION_CREDENTIALS ? "env-set" : "adc-default"
    }`
  );

  const webmasters = await getWebmastersClient();
  const failures = [];

  for (const target of SEARCH_CONSOLE_TARGETS) {
    try {
      if (shouldAddSites) {
        await addSite(webmasters, target);
        console.log(`[search-console] site added ${target.siteUrl}`);
      }

      if (shouldSubmitSitemaps) {
        await submitSitemap(webmasters, target);
        console.log(`[search-console] sitemap submitted ${target.sitemapUrl}`);
      }
    } catch (error) {
      failures.push({
        target,
        message: error instanceof Error ? error.message : String(error),
      });
      console.error(
        `[search-console] failed ${target.siteUrl}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  if (failures.length > 0) {
    console.error(`[search-console] ${failures.length}개 대상 처리 실패`);
    process.exitCode = 1;
    return;
  }

  console.log("[search-console] 모든 대상 처리 완료");
}

run().catch((error) => {
  console.error(
    `[search-console] 실행 실패: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  process.exitCode = 1;
});
