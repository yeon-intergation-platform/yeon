import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_CONTENT_ARTICLES,
  buildPublicContentCanonicalUrl,
} from "../src/features/public-content/public-content-data";
import { publicContentBlocksToMarkdown } from "../src/features/public-content/public-content-markdown";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../..");
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "apps/backend/src/main/resources/public-content/articles.json"
);
const SEED_SOURCE_PATH =
  "apps/backend/src/main/resources/public-content/articles.json";

function toIsoDate(value: string) {
  return value.includes("T") ? value : `${value}T00:00:00.000Z`;
}

const articles = PUBLIC_CONTENT_ARTICLES.map((article) => ({
  channel: article.channel,
  serviceKey: article.service,
  category: article.category,
  slug: article.slugSegments.join("/"),
  title: article.title,
  description: article.description,
  summary: article.summary,
  canonicalUrl: buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  ),
  publishedAt: toIsoDate(article.publishedAt),
  updatedAt: toIsoDate(article.updatedAt),
  readingMinutes: article.readingMinutes,
  bodyFormat: "markdown",
  bodyMarkdown: publicContentBlocksToMarkdown(article.body),
  ctaLabel: article.ctaLabel ?? null,
  ctaHref: article.ctaHref ?? null,
  metaDescription: article.description,
  sourcePaths: [SEED_SOURCE_PATH],
}));

async function main() {
  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify({ articles }, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `[public-content:seed] ${articles.length}개 글을 동기화했습니다.`
  );
}

void main();
