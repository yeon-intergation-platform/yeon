#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_DIR = resolve(new URL("..", import.meta.url).pathname);
const SUBMIT_SCRIPT = resolve(
  ROOT_DIR,
  "apps/web/scripts/submit-search-console-sitemaps.mjs"
);
const SEARCH_CONSOLE_DOC = resolve(
  ROOT_DIR,
  "docs/seo/google-search-console.md"
);

function readSearchConsoleTargets() {
  const output = execFileSync("node", [SUBMIT_SCRIPT], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
      FORCE_COLOR: "0",
    },
  });

  const targets = [];
  for (const line of output.split("\n")) {
    const match = line.match(
      /^- (?<siteUrl>https:\/\/[^ ]+\/) sitemap=(?<sitemapUrl>https:\/\/[^ ]+\/sitemap\.xml) owner=(?<owner>.+)$/
    );
    if (!match?.groups) continue;
    targets.push({
      siteUrl: match.groups.siteUrl,
      sitemapUrl: match.groups.sitemapUrl,
      owner: match.groups.owner,
    });
  }

  if (targets.length === 0) {
    throw new Error(
      "Search Console 제출 대상 dry-run 출력에서 target을 찾지 못했습니다."
    );
  }

  return targets;
}

function assertDocContainsTargets(targets) {
  const doc = readFileSync(SEARCH_CONSOLE_DOC, "utf8");
  const missing = [];

  for (const target of targets) {
    if (!doc.includes(target.siteUrl)) {
      missing.push(`property ${target.siteUrl}`);
    }
    if (!doc.includes(target.sitemapUrl)) {
      missing.push(`sitemap ${target.sitemapUrl}`);
    }
  }

  if (/\b8개\b|위 8개/.test(doc)) {
    missing.push("stale count phrase: 8개");
  }

  if (missing.length > 0) {
    throw new Error(
      `Search Console 운영 문서가 제출 대상과 다릅니다:\n- ${missing.join("\n- ")}`
    );
  }
}

try {
  const targets = readSearchConsoleTargets();
  assertDocContainsTargets(targets);
  console.log(
    `Search Console target 검증 OK: ${targets.length}개 property/sitemap 문서 반영`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
