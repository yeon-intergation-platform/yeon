import { describe, expect, it } from "vitest";
import {
  getPublicContentAdminArticleRows,
  getPublicContentAdminChannelSummaries,
  getPublicContentAdminDashboardStats,
  getValidPublicContentAdminChannel,
} from "./public-content-admin-model";
import { getPublicContentCollections } from "./public-content-data";

describe("public content admin model", () => {
  it("공개 콘텐츠 채널별 운영 현황을 계산한다", () => {
    const summaries = getPublicContentAdminChannelSummaries();

    expect(summaries).toHaveLength(3);
    expect(summaries.map((summary) => summary.channel)).toEqual([
      "support",
      "news",
      "blog",
    ]);
    expect(summaries.every((summary) => summary.articleCount > 0)).toBe(true);
    expect(
      new URL(summaries[0].searchConsoleUrl).searchParams.get("resource_id")
    ).toBe("https://support.yeon.world/");
    expect(summaries[0].sitemapUrl).toBe(
      "https://support.yeon.world/sitemap.xml"
    );
    expect(summaries[0].robotsUrl).toBe(
      "https://support.yeon.world/robots.txt"
    );
    expect(summaries.every((summary) => summary.sitemapHomeIncluded)).toBe(
      true
    );
    expect(
      summaries.every(
        (summary) => summary.sitemapArticleCount === summary.articleCount
      )
    ).toBe(true);
  });

  it("글 행마다 canonical과 sitemap 포함 여부를 제공한다", () => {
    const rows = getPublicContentAdminArticleRows("support");

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].canonicalUrl).toMatch(/^https:\/\/support\.yeon\.world\//);
    expect(rows[0].internalHref).toMatch(/^\/support\//);
    expect(rows.every((row) => row.sitemapIncluded)).toBe(true);
  });

  it("대시보드 전체 통계를 registry에서 파생한다", () => {
    const stats = getPublicContentAdminDashboardStats();

    expect(stats.channelCount).toBe(3);
    expect(stats.articleCount).toBe(33);
    expect(stats.gaMeasurementId).toBe("G-YGRNS3PQBQ");
    expect(stats.ga4ReportsUrl).toBe(
      "https://analytics.google.com/analytics/web/"
    );
    expect(
      new URL(stats.domainSearchConsoleUrl).searchParams.get("resource_id")
    ).toBe("sc-domain:yeon.world");
    expect(stats.serviceCount).toBeGreaterThanOrEqual(4);
    expect(stats.sitemapUrlCount).toBe(
      stats.articleCount +
        stats.channelCount +
        getPublicContentCollections("support").length +
        getPublicContentCollections("news").length +
        getPublicContentCollections("blog").length
    );
    expect(stats.sourcePathCount).toBeGreaterThan(0);
  });

  it("허용된 공개 콘텐츠 채널만 admin route로 인정한다", () => {
    expect(getValidPublicContentAdminChannel("support")).toBe("support");
    expect(getValidPublicContentAdminChannel("counseling")).toBeUndefined();
  });
});
