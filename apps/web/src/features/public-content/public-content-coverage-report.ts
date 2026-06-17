import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CATEGORY_LABELS,
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_SERVICE_LABELS,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentArticle,
  type PublicContentChannel,
  type PublicContentService,
} from "./public-content-data";

type PublicContentCoverageTarget = {
  category?: string;
  channel: PublicContentChannel;
  id: string;
  label: string;
  minArticles: number;
  service?: PublicContentService;
};

export type PublicContentCoverageBucket = PublicContentCoverageTarget & {
  articleCount: number;
  status: "covered" | "missing";
};

export type PublicContentCoverageChannelSummary = {
  articleCount: number;
  categoryCounts: readonly {
    category: string;
    count: number;
    label: string;
  }[];
  channel: PublicContentChannel;
  host: string;
  label: string;
  serviceCounts: readonly {
    count: number;
    label: string;
    service: PublicContentService;
  }[];
};

export type PublicContentCoverageReport = {
  buckets: readonly PublicContentCoverageBucket[];
  channels: readonly PublicContentCoverageChannelSummary[];
  generatedAt: string;
  summary: {
    articleCount: number;
    coveredBucketCount: number;
    missingBucketCount: number;
    targetBucketCount: number;
  };
};

type PublicContentCoverageReportOptions = {
  articles?: readonly PublicContentArticle[];
  generatedAt?: string;
};

const COVERAGE_TARGETS: readonly PublicContentCoverageTarget[] = [
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    id: "support:nexa",
    label: "support NEXA 문서",
    minArticles: 1,
    service: PUBLIC_CONTENT_SERVICES.nexa,
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    id: "support:typing",
    label: "support 타자연습 문서",
    minArticles: 1,
    service: PUBLIC_CONTENT_SERVICES.typing,
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    id: "support:card",
    label: "support 플래시카드 문서",
    minArticles: 1,
    service: PUBLIC_CONTENT_SERVICES.card,
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    id: "support:community",
    label: "support 커뮤니티 문서",
    minArticles: 1,
    service: PUBLIC_CONTENT_SERVICES.community,
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    id: "support:account",
    label: "support 계정/정책 문서",
    minArticles: 1,
    service: PUBLIC_CONTENT_SERVICES.account,
  },
  {
    category: "notice",
    channel: PUBLIC_CONTENT_CHANNELS.news,
    id: "news:notice",
    label: "news 공식 공지",
    minArticles: 1,
  },
  {
    category: "updates",
    channel: PUBLIC_CONTENT_CHANNELS.news,
    id: "news:updates",
    label: "news 제품 업데이트",
    minArticles: 1,
  },
  {
    category: "news",
    channel: PUBLIC_CONTENT_CHANNELS.news,
    id: "news:news",
    label: "news 업계 뉴스 해설",
    minArticles: 1,
  },
  {
    category: "engineering",
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    id: "blog:engineering",
    label: "blog 기술 글",
    minArticles: 1,
  },
  {
    category: "product",
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    id: "blog:product",
    label: "blog 제품 글",
    minArticles: 1,
  },
  {
    category: "devlog",
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    id: "blog:devlog",
    label: "blog 개발 일지",
    minArticles: 1,
  },
  {
    category: "essay",
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    id: "blog:essay",
    label: "blog 에세이",
    minArticles: 1,
  },
];

const STATUS_LABELS = {
  covered: "채움",
  missing: "비어 있음",
} as const satisfies Record<PublicContentCoverageBucket["status"], string>;

function getCategoryLabel(category: string) {
  return (
    PUBLIC_CONTENT_CATEGORY_LABELS[
      category as keyof typeof PUBLIC_CONTENT_CATEGORY_LABELS
    ] ?? category
  );
}

function getServiceLabel(service: PublicContentService) {
  return PUBLIC_CONTENT_SERVICE_LABELS[service];
}

function countTargetArticles(
  articles: readonly PublicContentArticle[],
  target: PublicContentCoverageTarget
) {
  return articles.filter((article) => {
    if (article.channel !== target.channel) {
      return false;
    }
    if (target.service && article.service !== target.service) {
      return false;
    }
    if (target.category && article.category !== target.category) {
      return false;
    }
    return true;
  }).length;
}

function buildBuckets(articles: readonly PublicContentArticle[]) {
  return COVERAGE_TARGETS.map((target) => {
    const articleCount = countTargetArticles(articles, target);
    const status: PublicContentCoverageBucket["status"] =
      articleCount >= target.minArticles ? "covered" : "missing";

    return {
      ...target,
      articleCount,
      status,
    };
  });
}

function countBy<T extends string>(
  articles: readonly PublicContentArticle[],
  getKey: (article: PublicContentArticle) => T
) {
  const counts = new Map<T, number>();

  articles.forEach((article) => {
    const key = getKey(article);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
}

function buildChannelSummaries(
  articles: readonly PublicContentArticle[]
): PublicContentCoverageChannelSummary[] {
  return Object.values(PUBLIC_CONTENT_CHANNELS).map((channel) => {
    const channelArticles = articles.filter(
      (article) => article.channel === channel
    );
    const serviceCounts = countBy(
      channelArticles,
      (article) => article.service
    );
    const categoryCounts = countBy(
      channelArticles,
      (article) => article.category
    );
    const config = PUBLIC_CONTENT_CHANNEL_CONFIG[channel];

    return {
      articleCount: channelArticles.length,
      categoryCounts: [...categoryCounts.entries()]
        .map(([category, count]) => ({
          category,
          count,
          label: getCategoryLabel(category),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
      channel,
      host: config.host,
      label: config.label,
      serviceCounts: [...serviceCounts.entries()]
        .map(([service, count]) => ({
          count,
          label: getServiceLabel(service),
          service,
        }))
        .sort((a, b) => a.service.localeCompare(b.service)),
    };
  });
}

export function buildPublicContentCoverageReport(
  options: PublicContentCoverageReportOptions = {}
): PublicContentCoverageReport {
  const articles = options.articles ?? PUBLIC_CONTENT_ARTICLES;
  const buckets = buildBuckets(articles);

  return {
    buckets,
    channels: buildChannelSummaries(articles),
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    summary: {
      articleCount: articles.length,
      coveredBucketCount: buckets.filter(
        (bucket) => bucket.status === "covered"
      ).length,
      missingBucketCount: buckets.filter(
        (bucket) => bucket.status === "missing"
      ).length,
      targetBucketCount: buckets.length,
    },
  };
}

function formatCountList(rows: readonly { count: number; label: string }[]) {
  if (rows.length === 0) {
    return "없음";
  }

  return rows.map((row) => `${row.label} ${row.count}개`).join(", ");
}

export function formatPublicContentCoverageReportAsMarkdown(
  report: PublicContentCoverageReport
) {
  const lines = [
    "# 공개 콘텐츠 Coverage 리포트",
    "",
    `생성 시각: ${report.generatedAt}`,
    "",
    `요약: article ${report.summary.articleCount}개, target bucket ${report.summary.targetBucketCount}개, 채움 ${report.summary.coveredBucketCount}개, 비어 있음 ${report.summary.missingBucketCount}개`,
    "",
    "## 채널 요약",
    "",
    ...report.channels.flatMap((channel) => [
      `- ${channel.label}: ${channel.articleCount}개 (${channel.host})`,
      `  - service: ${formatCountList(channel.serviceCounts)}`,
      `  - category: ${formatCountList(channel.categoryCounts)}`,
    ]),
    "",
    "## 정책 Bucket",
    "",
    ...report.buckets.map(
      (bucket) =>
        `- [${STATUS_LABELS[bucket.status]}] ${bucket.label} (${bucket.articleCount}/${bucket.minArticles})`
    ),
  ];

  return `${lines.join("\n")}\n`;
}
