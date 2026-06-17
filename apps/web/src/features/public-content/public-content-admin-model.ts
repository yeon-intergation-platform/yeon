import {
  buildPublicContentCanonicalUrl,
  buildPublicContentInternalHref,
  getPublicContentArticles,
  getPublicContentSitemapEntries,
  PUBLIC_CONTENT_CATEGORY_LABELS,
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_SERVICE_LABELS,
  type PublicContentArticle,
  type PublicContentChannel,
} from "./public-content-data";

export type PublicContentAdminArticleRow = {
  article: PublicContentArticle;
  canonicalUrl: string;
  categoryLabel: string;
  channelLabel: string;
  internalHref: string;
  serviceLabel: string;
  sitemapIncluded: boolean;
};

export type PublicContentAdminChannelSummary = {
  channel: PublicContentChannel;
  adminHref: string;
  articleCount: number;
  categoryLabels: readonly string[];
  host: string;
  label: string;
  lastUpdatedAt: string | null;
  publicHomeUrl: string;
  serviceLabels: readonly string[];
  sitemapArticleCount: number;
  sitemapHomeIncluded: boolean;
};

export type PublicContentAdminDashboardStats = {
  channelCount: number;
  articleCount: number;
  serviceCount: number;
  sitemapUrlCount: number;
  sourcePathCount: number;
  lastUpdatedAt: string | null;
};

export const PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER: readonly PublicContentChannel[] =
  [
    PUBLIC_CONTENT_CHANNELS.support,
    PUBLIC_CONTENT_CHANNELS.news,
    PUBLIC_CONTENT_CHANNELS.blog,
  ];

const normalizeUrl = (url: string) => url.replace(/\/$/, "");

function getCategoryLabel(category: string) {
  return (
    PUBLIC_CONTENT_CATEGORY_LABELS[
      category as keyof typeof PUBLIC_CONTENT_CATEGORY_LABELS
    ] ?? category
  );
}

function getSitemapUrlSet() {
  return new Set(
    getPublicContentSitemapEntries().map((entry) => normalizeUrl(entry.url))
  );
}

function getLastUpdatedAt(articles: readonly PublicContentArticle[]) {
  return (
    articles
      .map((article) => article.updatedAt)
      .sort((a, b) => b.localeCompare(a))[0] ?? null
  );
}

export function getValidPublicContentAdminChannel(value: string) {
  return PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER.find(
    (channel) => channel === value
  );
}

export function getPublicContentAdminArticleRows(
  channel?: PublicContentChannel
): PublicContentAdminArticleRow[] {
  const sitemapUrls = getSitemapUrlSet();

  return getPublicContentArticles(channel).map((article) => {
    const canonicalUrl = buildPublicContentCanonicalUrl(
      article.channel,
      article.slugSegments
    );
    const channelConfig = PUBLIC_CONTENT_CHANNEL_CONFIG[article.channel];

    return {
      article,
      canonicalUrl,
      categoryLabel: getCategoryLabel(article.category),
      channelLabel: channelConfig.label,
      internalHref: buildPublicContentInternalHref(
        article.channel,
        article.slugSegments
      ),
      serviceLabel: PUBLIC_CONTENT_SERVICE_LABELS[article.service],
      sitemapIncluded: sitemapUrls.has(normalizeUrl(canonicalUrl)),
    };
  });
}

export function getPublicContentAdminChannelSummaries(): PublicContentAdminChannelSummary[] {
  const sitemapUrls = getSitemapUrlSet();

  return PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER.map((channel) => {
    const config = PUBLIC_CONTENT_CHANNEL_CONFIG[channel];
    const articles = getPublicContentArticles(channel);
    const rows = getPublicContentAdminArticleRows(channel);
    const categoryLabels = new Set(
      articles.map((article) => getCategoryLabel(article.category))
    );
    const serviceLabels = new Set(
      articles.map((article) => PUBLIC_CONTENT_SERVICE_LABELS[article.service])
    );

    return {
      channel,
      adminHref: `/admin/content/${channel}`,
      articleCount: articles.length,
      categoryLabels: [...categoryLabels],
      host: config.host,
      label: config.label,
      lastUpdatedAt: getLastUpdatedAt(articles),
      publicHomeUrl: config.host,
      serviceLabels: [...serviceLabels],
      sitemapArticleCount: rows.filter((row) => row.sitemapIncluded).length,
      sitemapHomeIncluded: sitemapUrls.has(normalizeUrl(config.host)),
    };
  });
}

export function getPublicContentAdminChannelSummary(
  channel: PublicContentChannel
) {
  return (
    getPublicContentAdminChannelSummaries().find(
      (summary) => summary.channel === channel
    ) ?? null
  );
}

export function getPublicContentAdminDashboardStats(): PublicContentAdminDashboardStats {
  const articles = getPublicContentArticles();
  const services = new Set(articles.map((article) => article.service));
  const sourcePaths = new Set(
    articles.flatMap((article) => [...article.sourcePaths])
  );

  return {
    channelCount: PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER.length,
    articleCount: articles.length,
    serviceCount: services.size,
    sitemapUrlCount: getPublicContentSitemapEntries().length,
    sourcePathCount: sourcePaths.size,
    lastUpdatedAt: getLastUpdatedAt(articles),
  };
}
