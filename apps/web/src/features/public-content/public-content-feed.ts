import {
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  buildPublicContentCanonicalUrl,
  getPublicContentArticles,
  getPublicContentChannelConfig,
  type PublicContentArticle,
  type PublicContentChannel,
} from "./public-content-data";

const RSS_ITEM_LIMIT = 50;

export const PUBLIC_CONTENT_RSS_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600",
  "Content-Type": "application/rss+xml; charset=utf-8",
} as const;

function compareArticlesByPublishedDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

export function escapePublicContentRssText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRssDate(value: string) {
  return new Date(value).toUTCString();
}

function getFeedUrl(channel: PublicContentChannel) {
  return `${PUBLIC_CONTENT_CHANNEL_CONFIG[channel].host}/feed.xml`;
}

function getMostRecentUpdatedAt(articles: readonly PublicContentArticle[]) {
  return (
    articles
      .map((article) => article.updatedAt)
      .sort((left, right) => right.localeCompare(left))[0] ?? null
  );
}

function buildRssItem(article: PublicContentArticle) {
  const link = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );

  return [
    "    <item>",
    `      <title>${escapePublicContentRssText(article.title)}</title>`,
    `      <link>${escapePublicContentRssText(link)}</link>`,
    `      <guid isPermaLink="true">${escapePublicContentRssText(link)}</guid>`,
    `      <description>${escapePublicContentRssText(article.description)}</description>`,
    `      <pubDate>${formatRssDate(article.publishedAt)}</pubDate>`,
    `      <category>${escapePublicContentRssText(article.category)}</category>`,
    "    </item>",
  ].join("\n");
}

export function buildPublicContentRssFeed(
  channel: PublicContentChannel,
  sourceArticles?: readonly PublicContentArticle[]
) {
  const config = getPublicContentChannelConfig(channel);
  const articles = getPublicContentArticles(channel, sourceArticles)
    .sort(compareArticlesByPublishedDate)
    .slice(0, RSS_ITEM_LIMIT);
  const lastUpdatedAt = getMostRecentUpdatedAt(articles);
  const lastBuildDate = lastUpdatedAt
    ? formatRssDate(lastUpdatedAt)
    : formatRssDate(new Date().toISOString());
  const feedUrl = getFeedUrl(channel);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapePublicContentRssText(config.title)}</title>`,
    `    <link>${escapePublicContentRssText(config.host)}</link>`,
    `    <description>${escapePublicContentRssText(config.description)}</description>`,
    "    <language>ko-KR</language>",
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapePublicContentRssText(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...articles.map(buildRssItem),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
