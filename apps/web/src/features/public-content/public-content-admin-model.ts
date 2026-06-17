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
import { getPublicContentTitleQualityWarnings } from "./public-content-title-quality";
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
  titleWarningCount: number;
  lastUpdatedAt: string | null;
};

export type PublicContentAdminOpsChecklistStatus =
  | "manual"
  | "ready"
  | "warning";

export type PublicContentAdminOpsChecklistItem = {
  href?: string;
  id: string;
  label: string;
  note: string;
  status: PublicContentAdminOpsChecklistStatus;
  value: string;
};

export type PublicContentAdminDashboardData = {
  opsChecklist: readonly PublicContentAdminOpsChecklistItem[];
  recentPublishedRows: readonly PublicContentAdminArticleRow[];
  recentUpdatedRows: readonly PublicContentAdminArticleRow[];
  rows: readonly PublicContentAdminArticleRow[];
  seoWarningRows: readonly PublicContentAdminArticleRow[];
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
const ADMIN_QUEUE_LIMIT = 5;

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

function getSortableTime(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getRowsByDateDesc(
  rows: readonly PublicContentAdminArticleRow[],
  getDate: (row: PublicContentAdminArticleRow) => string | null
) {
  return [...rows].sort(
    (a, b) => getSortableTime(getDate(b)) - getSortableTime(getDate(a))
  );
}

function getRecentPublishedRows(rows: readonly PublicContentAdminArticleRow[]) {
  return getRowsByDateDesc(
    rows.filter(
      (row) => row.article.status === "published" && row.article.publishedAt
    ),
    (row) => row.article.publishedAt
  ).slice(0, ADMIN_QUEUE_LIMIT);
}

function getRecentUpdatedRows(rows: readonly PublicContentAdminArticleRow[]) {
  return getRowsByDateDesc(rows, (row) => row.article.updatedAt).slice(
    0,
    ADMIN_QUEUE_LIMIT
  );
}

function getSeoWarningRows(rows: readonly PublicContentAdminArticleRow[]) {
  return [...rows]
    .filter((row) => row.seoWarnings.length > 0)
    .sort((a, b) => {
      const warningDiff = b.seoWarnings.length - a.seoWarnings.length;
      if (warningDiff !== 0) {
        return warningDiff;
      }

      return (
        getSortableTime(b.article.updatedAt) -
        getSortableTime(a.article.updatedAt)
      );
    })
    .slice(0, ADMIN_QUEUE_LIMIT);
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
  warnings.push(
    ...getPublicContentTitleQualityWarnings({
      channel: params.article.channel,
      serviceKey: params.article.serviceKey,
      title: params.article.title,
    })
  );
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
    titleWarningCount: rows.reduce(
      (count, row) =>
        count +
        row.seoWarnings.filter((warning) => warning.startsWith("title")).length,
      0
    ),
    lastUpdatedAt: getLastUpdatedAt(articles),
  };
}

function buildPublicContentAdminOpsChecklist(params: {
  stats: PublicContentAdminDashboardStats;
  summaries: readonly PublicContentAdminChannelSummary[];
}): PublicContentAdminOpsChecklistItem[] {
  const sitemapReady = params.summaries.every(
    (summary) =>
      summary.sitemapHomeIncluded &&
      summary.sitemapArticleCount === summary.articleCount
  );
  const robotsLinkCount = params.summaries.filter((summary) =>
    summary.robotsUrl.trim()
  ).length;
  const searchConsoleLinkCount = params.summaries.filter((summary) =>
    summary.searchConsoleUrl.trim()
  ).length;
  const firstSitemapUrl = params.summaries[0]?.sitemapUrl;
  const firstRobotsUrl = params.summaries[0]?.robotsUrl;

  return [
    {
      href: params.stats.domainSearchConsoleUrl,
      id: "domain-search-console",
      label: "Domain property",
      note: "sc-domain:yeon.world에서 전체 subdomain 노출과 색인을 수동 확인합니다.",
      status: "manual",
      value: "수동 확인",
    },
    {
      id: "url-prefix-properties",
      label: "URL-prefix properties",
      note: "support, news, blog URL-prefix property 등록 상태를 각 채널 카드의 Search Console 링크로 확인합니다.",
      status: "manual",
      value: `${searchConsoleLinkCount}/${params.summaries.length}`,
    },
    {
      id: "sitemap-coverage",
      label: "Sitemap coverage",
      note: "채널 홈과 발행 public 글이 host별 sitemap에 포함되는지 계산합니다.",
      status: sitemapReady ? "ready" : "warning",
      value: sitemapReady ? "정상" : "확인 필요",
      ...(firstSitemapUrl ? { href: firstSitemapUrl } : {}),
    },
    {
      id: "robots-links",
      label: "Robots links",
      note: "각 공개 콘텐츠 host의 robots.txt 확인 링크가 준비되어 있습니다.",
      status: robotsLinkCount === params.summaries.length ? "ready" : "warning",
      value: `${robotsLinkCount}/${params.summaries.length}`,
      ...(firstRobotsUrl ? { href: firstRobotsUrl } : {}),
    },
    {
      href: params.stats.ga4ReportsUrl,
      id: "ga4-events",
      label: "GA4 events",
      note: "page_view, public_content_cta_click, public_content_link_click을 GA4에서 확인합니다.",
      status: params.stats.gaMeasurementId ? "ready" : "warning",
      value: params.stats.gaMeasurementId || "측정 ID 누락",
    },
    {
      id: "seo-warning-queue",
      label: "SEO warning queue",
      note: "noindex, meta description, canonical, sitemap, title 품질 경고 수입니다.",
      status: params.stats.seoWarningCount === 0 ? "ready" : "warning",
      value: `${params.stats.seoWarningCount}개`,
    },
    {
      id: "title-quality",
      label: "Title quality",
      note: "검색 의도와 서비스 단서가 부족한 제목을 공개 전 점검합니다.",
      status: params.stats.titleWarningCount === 0 ? "ready" : "warning",
      value: `${params.stats.titleWarningCount}개`,
    },
    {
      id: "source-path-traceability",
      label: "Source traceability",
      note: "공개 글의 repo 근거 경로가 남아 있는지 확인합니다.",
      status: params.stats.sourcePathCount > 0 ? "ready" : "warning",
      value: `${params.stats.sourcePathCount}개`,
    },
  ];
}

function buildPublicContentAdminDashboardDataFromViews(
  articles: readonly PublicContentAdminArticleView[],
  sitemapEntries?: readonly Pick<PublicContentSitemapEntryDto, "url">[]
): PublicContentAdminDashboardData {
  const rows = buildPublicContentAdminRowsFromViews(articles, sitemapEntries);
  const summaries = buildPublicContentAdminChannelSummariesFromViews(
    articles,
    sitemapEntries
  );
  const stats = buildPublicContentAdminDashboardStatsFromViews(
    articles,
    rows,
    sitemapEntries
  );

  return {
    opsChecklist: buildPublicContentAdminOpsChecklist({ stats, summaries }),
    recentPublishedRows: getRecentPublishedRows(rows),
    recentUpdatedRows: getRecentUpdatedRows(rows),
    rows,
    seoWarningRows: getSeoWarningRows(rows),
    stats,
    summaries,
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
    recentUpdatedRows: dashboard.recentUpdatedRows.filter(
      (row) => row.article.channel === params.channel
    ),
    rows: dashboard.rows.filter(
      (row) => row.article.channel === params.channel
    ),
    seoWarningRows: dashboard.seoWarningRows.filter(
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

export function getPublicContentAdminDashboardData(): PublicContentAdminDashboardData {
  return buildPublicContentAdminDashboardDataFromViews(
    getStaticAdminArticleViews()
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
