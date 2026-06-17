import {
  getPublicContentAdminDashboardData,
  type PublicContentAdminDashboardData,
} from "./public-content-admin-model";
import {
  getPublicContentFreshnessState,
  PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS,
} from "./public-content-freshness";

export type PublicContentGovernanceStatus = "manual" | "ready" | "warning";

export type PublicContentGovernanceItem = {
  evidence: string;
  id: string;
  owner: string;
  status: PublicContentGovernanceStatus;
  title: string;
};

export type PublicContentGovernanceSection = {
  id: "launch-week" | "monthly" | "on-change";
  items: readonly PublicContentGovernanceItem[];
  title: string;
};

export type PublicContentGovernanceReport = {
  generatedAt: string;
  sections: readonly PublicContentGovernanceSection[];
  summary: {
    articleCount: number;
    channelCount: number;
    manualCount: number;
    readyCount: number;
    warningCount: number;
  };
};

type PublicContentGovernanceReportOptions = {
  dashboard?: PublicContentAdminDashboardData;
  generatedAt?: string;
};

const STATUS_LABELS = {
  manual: "수동 확인",
  ready: "정상",
  warning: "확인 필요",
} as const satisfies Record<PublicContentGovernanceStatus, string>;

function countRowsMissingSourcePath(
  dashboard: PublicContentAdminDashboardData
) {
  return dashboard.rows.filter((row) => row.article.sourcePaths.length === 0)
    .length;
}

function countStaleSupportRows(
  dashboard: PublicContentAdminDashboardData,
  referenceDate: string
) {
  return dashboard.rows.filter((row) => {
    const state = getPublicContentFreshnessState(
      {
        channel: row.article.channel,
        reviewedAt: row.article.reviewedAt,
        updatedAt: row.article.updatedAt,
      },
      { referenceDate }
    );

    return state.status === "warning";
  }).length;
}

function hasCompleteSitemapCoverage(
  dashboard: PublicContentAdminDashboardData
) {
  return dashboard.summaries.every(
    (summary) =>
      summary.sitemapHomeIncluded &&
      summary.sitemapArticleCount === summary.articleCount
  );
}

function buildReadyWarningItem(params: {
  evidence: string;
  id: string;
  isReady: boolean;
  owner: string;
  title: string;
}): PublicContentGovernanceItem {
  return {
    evidence: params.evidence,
    id: params.id,
    owner: params.owner,
    status: params.isReady ? "ready" : "warning",
    title: params.title,
  };
}

function buildLaunchWeekItems(
  dashboard: PublicContentAdminDashboardData
): PublicContentGovernanceItem[] {
  return [
    {
      evidence: `Domain property ${dashboard.stats.domainSearchConsoleUrl}`,
      id: "search-console-index-state",
      owner: "운영자",
      status: "manual",
      title: "Search Console 색인 상태 확인",
    },
    {
      evidence: dashboard.summaries
        .map((summary) => `${summary.label}: ${summary.searchConsoleUrl}`)
        .join(" / "),
      id: "url-prefix-property-registration",
      owner: "운영자",
      status: "manual",
      title: "support/news/blog URL-prefix property 등록 확인",
    },
    {
      evidence: dashboard.summaries
        .map((summary) => `${summary.label}: ${summary.sitemapUrl}`)
        .join(" / "),
      id: "sitemap-submission-errors",
      owner: "운영자",
      status: "manual",
      title: "host별 sitemap 제출 오류 확인",
    },
    {
      evidence: `GA4 ${dashboard.stats.gaMeasurementId}에서 page_location host 기준 page_view 분리`,
      id: "host-page-view-split",
      owner: "운영자",
      status: "manual",
      title: "support/news/blog host별 page_view 확인",
    },
    {
      evidence: `GA4 ${dashboard.stats.gaMeasurementId} ${dashboard.stats.ga4ReportsUrl}`,
      id: "support-cta-clicks",
      owner: "운영자",
      status: "manual",
      title: "support CTA 클릭 확인",
    },
    {
      evidence: "Search Console 페이지 색인 리포트에서 404 증가 여부 확인",
      id: "public-404-review",
      owner: "운영자",
      status: "manual",
      title: "public 404 증가 여부 확인",
    },
    {
      evidence:
        "public_content_link_click에서 news channel, article_card link_kind, 제품/support target_url 확인",
      id: "news-product-link-clicks",
      owner: "운영자",
      status: "manual",
      title: "news 관련 제품/support 링크 클릭 확인",
    },
    {
      evidence:
        "public_content_link_click에서 blog channel, related_article/source link_kind, support target_url 확인",
      id: "blog-related-link-clicks",
      owner: "운영자",
      status: "manual",
      title: "blog 관련 support/source 링크 클릭 확인",
    },
  ];
}

function buildMonthlyItems(
  dashboard: PublicContentAdminDashboardData,
  referenceDate: string
): PublicContentGovernanceItem[] {
  const missingSourcePathCount = countRowsMissingSourcePath(dashboard);
  const staleSupportRowCount = countStaleSupportRows(dashboard, referenceDate);
  const titleAndDescriptionWarningCount =
    dashboard.stats.titleWarningCount +
    dashboard.stats.metaDescriptionMissingCount;

  return [
    buildReadyWarningItem({
      evidence: `${dashboard.stats.seoWarningCount}개 SEO warning`,
      id: "seo-warning-queue",
      isReady: dashboard.stats.seoWarningCount === 0,
      owner: "콘텐츠 운영",
      title: "SEO warning queue 처리",
    }),
    buildReadyWarningItem({
      evidence: `${titleAndDescriptionWarningCount}개 title/description 후보`,
      id: "title-description-improvement",
      isReady: titleAndDescriptionWarningCount === 0,
      owner: "콘텐츠 운영",
      title: "노출 대비 클릭률 개선 후보 점검",
    }),
    buildReadyWarningItem({
      evidence: hasCompleteSitemapCoverage(dashboard)
        ? "모든 channel 홈과 발행 글이 sitemap에 포함됨"
        : "sitemap 누락 channel 또는 글 존재",
      id: "sitemap-coverage",
      isReady: hasCompleteSitemapCoverage(dashboard),
      owner: "운영자",
      title: "sitemap coverage 확인",
    }),
    {
      evidence:
        "Search Console 페이지 색인 생성 리포트에서 색인 제외 급증, 404 증가, canonical mismatch를 확인",
      id: "index-exclusion-404-canonical-review",
      owner: "운영자",
      status: "manual",
      title: "색인 제외/404/canonical mismatch 월간 확인",
    },
    {
      evidence:
        "Search Console Sitemaps 리포트에서 support/news/blog/discord-ai 제출 실패를 확인하고 알림 후보로 기록",
      id: "sitemap-failure-alert-candidate",
      owner: "운영자",
      status: "manual",
      title: "sitemap 제출 실패 알림 후보 기록",
    },
    buildReadyWarningItem({
      evidence: `${missingSourcePathCount}개 글 source path 누락`,
      id: "source-traceability",
      isReady: missingSourcePathCount === 0,
      owner: "콘텐츠 운영",
      title: "support/news/blog 근거 경로 점검",
    }),
    buildReadyWarningItem({
      evidence: `${staleSupportRowCount}개 support 글 stale, 기준 ${PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS}일`,
      id: "content-freshness-review",
      owner: "콘텐츠 운영",
      isReady: staleSupportRowCount === 0,
      title: "오래된 글 최신성 점검",
    }),
    {
      evidence:
        "Search Console query에서 발행 글별 유입과 노출은 높고 클릭이 낮은 글을 제목/description 후보로 기록",
      id: "query-opportunity-review",
      owner: "콘텐츠 운영",
      status: "manual",
      title: "발행 글별 query 유입과 개선 후보 기록",
    },
  ];
}

function buildOnChangeItems(
  dashboard: PublicContentAdminDashboardData
): PublicContentGovernanceItem[] {
  return [
    {
      evidence:
        "신규 기능이 생기면 support 글 후보를 먼저 만들고 실제 문의/오류 로그를 반영",
      id: "new-feature-support-candidate",
      owner: "제품/운영",
      status: "manual",
      title: "신규 기능 support 후보 생성",
    },
    {
      evidence:
        "신규 배포가 있으면 news update 후보를 먼저 만들고 사용자 영향도를 기록",
      id: "release-news-candidate",
      owner: "제품/운영",
      status: "manual",
      title: "신규 배포 news 후보 생성",
    },
    {
      evidence:
        "의미 있는 기술 결정이 있으면 blog 후보를 만들고 repo 근거 경로를 남김",
      id: "technical-decision-blog-candidate",
      owner: "개발/운영",
      status: "manual",
      title: "기술 결정 blog 후보 생성",
    },
    buildReadyWarningItem({
      evidence: `${dashboard.stats.channelCount}개 channel, ${dashboard.stats.serviceCount}개 service, ${dashboard.stats.articleCount}개 글`,
      id: "information-architecture-fit",
      isReady:
        dashboard.stats.channelCount === 3 &&
        dashboard.stats.serviceCount >= 5 &&
        dashboard.stats.articleCount > 0,
      owner: "제품/운영",
      title: "정보 구조와 실제 서비스 구조 재검토",
    }),
    {
      evidence:
        "자동 Search Console 연동은 GOOGLE_APPLICATION_CREDENTIALS와 verification token 준비 후 별도 execute 작업으로 진행",
      id: "google-api-credential-gate",
      owner: "운영자",
      status: "manual",
      title: "Google API credential 준비 후 자동 제출",
    },
    {
      evidence:
        "GitHub PR/check/run 상태 확인은 API 할당 보호를 위해 8분 이상 간격으로 제한",
      id: "github-api-polling-interval",
      owner: "개발/운영",
      status: "manual",
      title: "GitHub API 폴링 간격 유지",
    },
  ];
}

function summarizeSections(
  sections: readonly PublicContentGovernanceSection[],
  dashboard: PublicContentAdminDashboardData
) {
  const items = sections.flatMap((section) => [...section.items]);

  return {
    articleCount: dashboard.stats.articleCount,
    channelCount: dashboard.stats.channelCount,
    manualCount: items.filter((item) => item.status === "manual").length,
    readyCount: items.filter((item) => item.status === "ready").length,
    warningCount: items.filter((item) => item.status === "warning").length,
  };
}

export function buildPublicContentGovernanceReport(
  options: PublicContentGovernanceReportOptions = {}
): PublicContentGovernanceReport {
  const dashboard = options.dashboard ?? getPublicContentAdminDashboardData();
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const sections: PublicContentGovernanceSection[] = [
    {
      id: "launch-week",
      items: buildLaunchWeekItems(dashboard),
      title: "출시 첫 주 확인",
    },
    {
      id: "monthly",
      items: buildMonthlyItems(dashboard, generatedAt),
      title: "월간 품질 점검",
    },
    {
      id: "on-change",
      items: buildOnChangeItems(dashboard),
      title: "변경 발생 시 후보 생성",
    },
  ];

  return {
    generatedAt,
    sections,
    summary: summarizeSections(sections, dashboard),
  };
}

export function formatPublicContentGovernanceReportAsMarkdown(
  report: PublicContentGovernanceReport
) {
  const lines = [
    "# 공개 콘텐츠 운영 거버넌스 리포트",
    "",
    `생성 시각: ${report.generatedAt}`,
    "",
    `요약: channel ${report.summary.channelCount}개, article ${report.summary.articleCount}개, 정상 ${report.summary.readyCount}개, 수동 확인 ${report.summary.manualCount}개, 확인 필요 ${report.summary.warningCount}개`,
  ];

  report.sections.forEach((section) => {
    lines.push("", `## ${section.title}`, "");
    section.items.forEach((item) => {
      lines.push(
        `- [${STATUS_LABELS[item.status]}] ${item.title} (${item.owner})`,
        `  - evidence: ${item.evidence}`
      );
    });
  });

  return lines.join("\n");
}
