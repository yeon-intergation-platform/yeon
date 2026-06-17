import { describe, expect, it } from "vitest";
import {
  buildPublicContentGovernanceReport,
  formatPublicContentGovernanceReportAsMarkdown,
} from "./public-content-governance-report";
import { getPublicContentAdminDashboardData } from "./public-content-admin-model";

function findItem(
  report: ReturnType<typeof buildPublicContentGovernanceReport>,
  itemId: string
) {
  return report.sections
    .flatMap((section) => section.items)
    .find((item) => item.id === itemId);
}

describe("public content governance report", () => {
  it("현재 registry 기준 출시 후 운영 점검 리포트를 만든다", () => {
    const dashboard = getPublicContentAdminDashboardData();
    const report = buildPublicContentGovernanceReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });

    expect(report.sections.map((section) => section.id)).toEqual([
      "launch-week",
      "monthly",
      "on-change",
    ]);
    expect(report.summary.articleCount).toBe(dashboard.stats.articleCount);
    expect(report.summary.channelCount).toBe(dashboard.stats.channelCount);
    expect(report.summary.warningCount).toBe(0);
    expect(findItem(report, "search-console-index-state")?.status).toBe(
      "manual"
    );
    expect(findItem(report, "url-prefix-property-registration")?.status).toBe(
      "manual"
    );
    expect(findItem(report, "host-page-view-split")?.status).toBe("manual");
    expect(findItem(report, "news-product-link-clicks")?.status).toBe("manual");
    expect(findItem(report, "blog-related-link-clicks")?.status).toBe("manual");
    expect(findItem(report, "seo-warning-queue")?.status).toBe("ready");
    expect(
      findItem(report, "index-exclusion-404-canonical-review")?.status
    ).toBe("manual");
    expect(findItem(report, "sitemap-failure-alert-candidate")?.status).toBe(
      "manual"
    );
    expect(findItem(report, "source-traceability")?.status).toBe("ready");
    expect(findItem(report, "content-freshness-review")?.status).toBe("ready");
    expect(findItem(report, "information-architecture-fit")?.status).toBe(
      "ready"
    );
    expect(findItem(report, "google-api-credential-gate")?.status).toBe(
      "manual"
    );
    expect(findItem(report, "github-api-polling-interval")?.status).toBe(
      "manual"
    );
  });

  it("Markdown 출력에 수동 확인과 자동 evidence를 함께 담는다", () => {
    const report = buildPublicContentGovernanceReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });
    const markdown = formatPublicContentGovernanceReportAsMarkdown(report);

    expect(markdown).toContain("# 공개 콘텐츠 운영 거버넌스 리포트");
    expect(markdown).toContain("## 출시 첫 주 확인");
    expect(markdown).toContain("[수동 확인] Search Console 색인 상태 확인");
    expect(markdown).toContain(
      "[수동 확인] support/news/blog URL-prefix property 등록 확인"
    );
    expect(markdown).toContain("[정상] SEO warning queue 처리");
    expect(markdown).toContain("[정상] 오래된 글 최신성 점검");
  });

  it("support 글 freshness는 reviewedAt을 updatedAt보다 우선한다", () => {
    const dashboard = getPublicContentAdminDashboardData();
    const supportRowIndex = dashboard.rows.findIndex(
      (row) => row.article.channel === "support"
    );
    const rows = dashboard.rows.map((row, index) =>
      index === supportRowIndex
        ? {
            ...row,
            article: {
              ...row.article,
              reviewedAt: "2026-06-17",
              updatedAt: "2025-01-01",
            },
          }
        : row
    );

    expect(supportRowIndex).toBeGreaterThanOrEqual(0);
    expect(
      findItem(
        buildPublicContentGovernanceReport({
          dashboard: { ...dashboard, rows },
          generatedAt: "2026-06-17T00:00:00.000Z",
        }),
        "content-freshness-review"
      )?.status
    ).toBe("ready");
  });

  it("support 글이 180일 넘게 확인되지 않으면 warning으로 표시한다", () => {
    const dashboard = getPublicContentAdminDashboardData();
    const supportRowIndex = dashboard.rows.findIndex(
      (row) => row.article.channel === "support"
    );
    const rows = dashboard.rows.map((row, index) =>
      index === supportRowIndex
        ? {
            ...row,
            article: {
              ...row.article,
              reviewedAt: null,
              updatedAt: "2025-01-01",
            },
          }
        : row
    );

    expect(supportRowIndex).toBeGreaterThanOrEqual(0);
    expect(
      findItem(
        buildPublicContentGovernanceReport({
          dashboard: { ...dashboard, rows },
          generatedAt: "2026-06-17T00:00:00.000Z",
        }),
        "content-freshness-review"
      )?.status
    ).toBe("warning");
  });
});
