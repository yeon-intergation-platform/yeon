import type {
  PublicContentAdminArticleDto,
  PublicContentSitemapEntryDto,
  PublicContentStatus,
  PublicContentVisibility,
} from "@yeon/api-contract/public-content";
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
import { GA4_REPORTS_URL, GA_MEASUREMENT_ID } from "@/lib/analytics-constants";

type PublicContentAdminArticleView = {
  id: string;
  canonicalUrl: string;
  category: string;
  channel: PublicContentChannel;
  metaDescription: string | null;
  noindex: boolean;
  publishedAt: string | null;
  readingMinutes: number;
  serviceKey: string;
  slugSegments: readonly string[];
  sourcePaths: readonly string[];
  status: PublicContentStatus;
  summary: string;
  title: string;
  updatedAt: string;
  visibility: PublicContentVisibility;
};

export type PublicContentAdminArticleRow = {
  article: PublicContentAdminArticleView;
  canonicalUrl: string;
  categoryLabel: string;
  channelLabel: string;
  internalHref: string;
  seoWarnings: readonly string[];
  serviceLabel: string;
  sitemapIncluded: boolean;
  statusLabel: string;
  visibilityLabel: string;
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
  robotsUrl: string;
  searchConsoleUrl: string;
  serviceLabels: readonly string[];
  seoWarningCount: number;
  sitemapArticleCount: number;
  sitemapHomeIncluded: boolean;
  sitemapUrl: string;
  statusCounts: Record<PublicContentStatus, number>;
};

export type PublicContentAdminDashboardStats = {
  channelCount: number;
  articleCount: number;
  archivedCount: number;
  canonicalMissingCount: number;
  domainSearchConsoleUrl: string;
  draftCount: number;
  ga4ReportsUrl: string;
  gaMeasurementId: string;
  metaDescriptionMissingCount: number;
  noindexCount: number;
  publishedCount: number;
  reviewCount: number;
  seoWarningCount: number;
  serviceCount: number;
  sitemapUrlCount: number;
  sourcePathCount: number;
  statusCounts: Record<PublicContentStatus, number>;
  lastUpdatedAt: string | null;
};

export type PublicContentAdminDashboardData = {
  rows: readonly PublicContentAdminArticleRow[];
  stats: PublicContentAdminDashboardStats;
  summaries: readonly PublicContentAdminChannelSummary[];
};

export const PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER: readonly PublicContentChannel[] =
  [
    PUBLIC_CONTENT_CHANNELS.support,
    PUBLIC_CONTENT_CHANNELS.news,
    PUBLIC_CONTENT_CHANNELS.blog,
  ];

const normalizeUrl = (url: string) => url.replace(/\/$/, "");
const SEARCH_CONSOLE_URL = "https://search.google.com/search-console";
const DOMAIN_SEARCH_CONSOLE_PROPERTY = "sc-domain:yeon.world";
const ADMIN_STATUSES: readonly PublicContentStatus[] = [
  "draft",
  "review",
  "published",
  "archived",
];
const STATUS_LABELS = {
  draft: "초안",
  review: "검토",
  published: "발행",
  archived: "보관",
} as const satisfies Record<PublicContentStatus, string>;
const VISIBILITY_LABELS = {
  public: "공개",
  unlisted: "링크 공개",
  internal: "내부",
} as const satisfies Record<PublicContentVisibility, string>;

function buildSearchConsoleUrl(resourceId: string) {
  return `${SEARCH_CONSOLE_URL}?${new URLSearchParams({
    resource_id: resourceId,
  }).toString()}`;
}

function getCategoryLabel(category: string) {
  return (
    PUBLIC_CONTENT_CATEGORY_LABELS[
      category as keyof typeof PUBLIC_CONTENT_CATEGORY_LABELS
    ] ?? category
  );
}

function getServiceLabel(serviceKey: string) {
  return (
    PUBLIC_CONTENT_SERVICE_LABELS[
      serviceKey as keyof typeof PUBLIC_CONTENT_SERVICE_LABELS
    ] ?? serviceKey
  );
}

function getSitemapUrlSet(
  entries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
) {
  if (entries) {
    return new Set(entries.map((entry) => normalizeUrl(entry.url)));
  }

  return new Set(
    getPublicContentSitemapEntries().map((entry) => normalizeUrl(entry.url))
  );
}

function getLastUpdatedAt(articles: readonly PublicContentAdminArticleView[]) {
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

function createEmptyStatusCounts(): Record<PublicContentStatus, number> {
  return ADMIN_STATUSES.reduce(
    (acc, status) => ({
      ...acc,
      [status]: 0,
    }),
    {} as Record<PublicContentStatus, number>
  );
}

function getStatusCounts(
  articles: readonly PublicContentAdminArticleView[]
): Record<PublicContentStatus, number> {
  return articles.reduce((acc, article) => {
    acc[article.status] += 1;
    return acc;
  }, createEmptyStatusCounts());
}

function getSeoWarnings(params: {
  article: PublicContentAdminArticleView;
  sitemapIncluded: boolean;
}) {
  const warnings: string[] = [];

  if (params.article.noindex) {
    warnings.push("noindex");
  }
  if (!params.article.metaDescription?.trim()) {
    warnings.push("meta description 누락");
  }
  if (!params.article.canonicalUrl.trim()) {
    warnings.push("canonical 누락");
  }
  if (
    params.article.status === "published" &&
    params.article.visibility === "public" &&
    !params.article.noindex &&
    !params.sitemapIncluded
  ) {
    warnings.push("sitemap 누락");
  }

  return warnings;
}

function toStaticAdminArticleView(
  article: PublicContentArticle
): PublicContentAdminArticleView {
  const canonicalUrl = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );

  return {
    id: `${article.channel}:${article.slugSegments.join("/")}`,
    canonicalUrl,
    category: article.category,
    channel: article.channel,
    metaDescription: article.description,
    noindex: false,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    serviceKey: article.service,
    slugSegments: article.slugSegments,
    sourcePaths: article.sourcePaths,
    status: "published",
    summary: article.summary,
    title: article.title,
    updatedAt: article.updatedAt,
    visibility: "public",
  };
}

function toSpringAdminArticleView(
  article: PublicContentAdminArticleDto
): PublicContentAdminArticleView {
  return {
    id: article.id,
    canonicalUrl: article.canonicalUrl,
    category: article.category,
    channel: article.channel,
    metaDescription: article.metaDescription,
    noindex: article.noindex,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    serviceKey: article.serviceKey,
    slugSegments: article.slug.split("/"),
    sourcePaths: article.sourcePaths,
    status: article.status,
    summary: article.summary,
    title: article.title,
    updatedAt: article.updatedAt,
    visibility: article.visibility,
  };
}

function getStaticAdminArticleViews(channel?: PublicContentChannel) {
  return getPublicContentArticles(channel).map(toStaticAdminArticleView);
}

function buildPublicContentAdminRowsFromViews(
  articles: readonly PublicContentAdminArticleView[],
  sitemapEntries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
): PublicContentAdminArticleRow[] {
  const sitemapUrls = getSitemapUrlSet(sitemapEntries);

  return articles.map((article) => {
    const channelConfig = PUBLIC_CONTENT_CHANNEL_CONFIG[article.channel];
    const internalHref = buildPublicContentInternalHref(
      article.channel,
      article.slugSegments
    );
    const sitemapIncluded = sitemapUrls.has(normalizeUrl(article.canonicalUrl));
    const seoWarnings = getSeoWarnings({ article, sitemapIncluded });

    return {
      article,
      canonicalUrl: article.canonicalUrl,
      categoryLabel: getCategoryLabel(article.category),
      channelLabel: channelConfig.label,
      internalHref,
      seoWarnings,
      serviceLabel: getServiceLabel(article.serviceKey),
      sitemapIncluded,
      statusLabel: STATUS_LABELS[article.status],
      visibilityLabel: VISIBILITY_LABELS[article.visibility],
    };
  });
}

function buildPublicContentAdminChannelSummariesFromViews(
  articles: readonly PublicContentAdminArticleView[],
  sitemapEntries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
): PublicContentAdminChannelSummary[] {
  const sitemapUrls = getSitemapUrlSet(sitemapEntries);

  return PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER.map((channel) => {
    const config = PUBLIC_CONTENT_CHANNEL_CONFIG[channel];
    const channelArticles = articles.filter(
      (article) => article.channel === channel
    );
    const rows = buildPublicContentAdminRowsFromViews(
      channelArticles,
      sitemapEntries
    );
    const categoryLabels = new Set(
      channelArticles.map((article) => getCategoryLabel(article.category))
    );
    const serviceLabels = new Set(
      channelArticles.map((article) => getServiceLabel(article.serviceKey))
    );

    return {
      channel,
      adminHref: `/admin/content/${channel}`,
      articleCount: channelArticles.length,
      categoryLabels: [...categoryLabels],
      host: config.host,
      label: config.label,
      lastUpdatedAt: getLastUpdatedAt(channelArticles),
      publicHomeUrl: config.host,
      robotsUrl: `${config.host}/robots.txt`,
      searchConsoleUrl: buildSearchConsoleUrl(`${config.host}/`),
      serviceLabels: [...serviceLabels],
      seoWarningCount: rows.reduce(
        (count, row) => count + row.seoWarnings.length,
        0
      ),
      sitemapArticleCount: rows.filter((row) => row.sitemapIncluded).length,
      sitemapHomeIncluded: sitemapUrls.has(normalizeUrl(config.host)),
      sitemapUrl: `${config.host}/sitemap.xml`,
      statusCounts: getStatusCounts(channelArticles),
    };
  });
}

function buildPublicContentAdminDashboardStatsFromViews(
  articles: readonly PublicContentAdminArticleView[],
  rows: readonly PublicContentAdminArticleRow[],
  sitemapEntries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
): PublicContentAdminDashboardStats {
  const services = new Set(articles.map((article) => article.serviceKey));
  const sourcePaths = new Set(
    articles.flatMap((article) => [...article.sourcePaths])
  );
  const statusCounts = getStatusCounts(articles);

  return {
    channelCount: PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER.length,
    articleCount: articles.length,
    archivedCount: statusCounts.archived,
    canonicalMissingCount: articles.filter(
      (article) => !article.canonicalUrl.trim()
    ).length,
    domainSearchConsoleUrl: buildSearchConsoleUrl(
      DOMAIN_SEARCH_CONSOLE_PROPERTY
    ),
    draftCount: statusCounts.draft,
    ga4ReportsUrl: GA4_REPORTS_URL,
    gaMeasurementId: GA_MEASUREMENT_ID,
    metaDescriptionMissingCount: articles.filter(
      (article) => !article.metaDescription?.trim()
    ).length,
    noindexCount: articles.filter((article) => article.noindex).length,
    publishedCount: statusCounts.published,
    reviewCount: statusCounts.review,
    seoWarningCount: rows.reduce(
      (count, row) => count + row.seoWarnings.length,
      0
    ),
    serviceCount: services.size,
    sitemapUrlCount: getSitemapUrlSet(sitemapEntries).size,
    sourcePathCount: sourcePaths.size,
    statusCounts,
    lastUpdatedAt: getLastUpdatedAt(articles),
  };
}

function buildPublicContentAdminDashboardDataFromViews(
  articles: readonly PublicContentAdminArticleView[],
  sitemapEntries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
): PublicContentAdminDashboardData {
  const rows = buildPublicContentAdminRowsFromViews(articles, sitemapEntries);

  return {
    rows,
    stats: buildPublicContentAdminDashboardStatsFromViews(
      articles,
      rows,
      sitemapEntries
    ),
    summaries: buildPublicContentAdminChannelSummariesFromViews(
      articles,
      sitemapEntries
    ),
  };
}

export function buildPublicContentAdminDashboardData(params: {
  articles: readonly PublicContentAdminArticleDto[];
  sitemapEntries?: readonly PublicContentSitemapEntryDto[];
}): PublicContentAdminDashboardData {
  return buildPublicContentAdminDashboardDataFromViews(
    params.articles.map(toSpringAdminArticleView),
    params.sitemapEntries
  );
}

export function buildPublicContentAdminChannelData(params: {
  articles: readonly PublicContentAdminArticleDto[];
  channel: PublicContentChannel;
  sitemapEntries?: readonly PublicContentSitemapEntryDto[];
}) {
  const dashboard = buildPublicContentAdminDashboardData({
    articles: params.articles,
    sitemapEntries: params.sitemapEntries,
  });

  return {
    rows: dashboard.rows.filter(
      (row) => row.article.channel === params.channel
    ),
    summary:
      dashboard.summaries.find(
        (summary) => summary.channel === params.channel
      ) ?? null,
  };
}

export function getPublicContentAdminArticleRows(
  channel?: PublicContentChannel
): PublicContentAdminArticleRow[] {
  return buildPublicContentAdminRowsFromViews(
    getStaticAdminArticleViews(channel)
  );
}

export function getPublicContentAdminChannelSummaries(): PublicContentAdminChannelSummary[] {
  return buildPublicContentAdminChannelSummariesFromViews(
    getStaticAdminArticleViews()
  );
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
  const dashboard = buildPublicContentAdminDashboardDataFromViews(
    getStaticAdminArticleViews()
  );

  return dashboard.stats;
}
