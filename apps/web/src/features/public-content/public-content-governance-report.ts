import {
  getPublicContentAdminDashboardData,
  type PublicContentAdminDashboardData,
} from "./public-content-admin-model";

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
        .map((summary) => `${summary.label}: ${summary.sitemapUrl}`)
        .join(" / "),
      id: "sitemap-submission-errors",
      owner: "운영자",
      status: "manual",
      title: "host별 sitemap 제출 오류 확인",
    },
    {
      evidence: "Search Console 페이지 색인 리포트에서 404 증가 여부 확인",
      id: "public-404-review",
      owner: "운영자",
      status: "manual",
      title: "public 404 증가 여부 확인",
    },
    {
      evidence: `GA4 ${dashboard.stats.gaMeasurementId} ${dashboard.stats.ga4ReportsUrl}`,
      id: "support-cta-clicks",
      owner: "운영자",
      status: "manual",
      title: "support CTA 클릭 확인",
    },
  ];
}

function buildMonthlyItems(
  dashboard: PublicContentAdminDashboardData
): PublicContentGovernanceItem[] {
  const missingSourcePathCount = countRowsMissingSourcePath(dashboard);
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
    buildReadyWarningItem({
      evidence: `${missingSourcePathCount}개 글 source path 누락`,
      id: "source-traceability",
      isReady: missingSourcePathCount === 0,
      owner: "콘텐츠 운영",
      title: "support/news/blog 근거 경로 점검",
    }),
    {
      evidence:
        "오래된 support 글, 과거 news 공지, blog 기술 변경 사항은 사람이 최신 정책과 대조",
      id: "content-freshness-review",
      owner: "콘텐츠 운영",
      status: "manual",
      title: "오래된 글 최신성 점검",
    },
    {
      evidence:
        "Search Console query에서 노출은 높고 클릭이 낮은 글을 제목/description 후보로 기록",
      id: "query-opportunity-review",
      owner: "콘텐츠 운영",
      status: "manual",
      title: "검색 query 기반 개선 후보 기록",
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
  const sections: PublicContentGovernanceSection[] = [
    {
      id: "launch-week",
      items: buildLaunchWeekItems(dashboard),
      title: "출시 첫 주 확인",
    },
    {
      id: "monthly",
      items: buildMonthlyItems(dashboard),
      title: "월간 품질 점검",
    },
    {
      id: "on-change",
      items: buildOnChangeItems(dashboard),
      title: "변경 발생 시 후보 생성",
    },
  ];

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
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
