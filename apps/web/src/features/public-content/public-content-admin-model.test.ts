import { describe, expect, it } from "vitest";
import {
  buildPublicContentAdminChannelData,
  buildPublicContentAdminDashboardData,
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
    expect(stats.publishedCount).toBe(stats.articleCount);
    expect(stats.draftCount).toBe(0);
    expect(stats.seoWarningCount).toBe(0);
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

  it("Spring admin DTO에서 상태와 SEO 경고를 계산한다", () => {
    const dashboard = buildPublicContentAdminDashboardData({
      articles: [
        {
          id: "article-published",
          channel: "support",
          serviceKey: "nexa",
          category: "guides",
          slug: "nexa/guides/add-nexa-discord-bot",
          title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
          description: "설명입니다.",
          summary: "요약입니다.",
          canonicalUrl:
            "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
          publishedAt: "2026-06-17T00:00:00.000Z",
          updatedAt: "2026-06-17T00:00:00.000Z",
          readingMinutes: 4,
          bodyFormat: "markdown",
          bodyMarkdown: "본문입니다.",
          ctaLabel: null,
          ctaHref: null,
          status: "published",
          visibility: "public",
          noindex: false,
          metaTitle: null,
          metaDescription: "검색 설명입니다.",
          ogImageUrl: null,
          authorKey: "yeon",
          sourceRepo: "yeon",
          sourcePaths: ["docs/source.md"],
          redirectTo: null,
        },
        {
          id: "article-draft",
          channel: "support",
          serviceKey: "nexa",
          category: "faq",
          slug: "nexa/faq/free-plan-limit",
          title: "NEXA 무료 플랜에서는 무엇까지 사용할 수 있나요?",
          description: "설명입니다.",
          summary: "요약입니다.",
          canonicalUrl: "https://support.yeon.world/nexa/faq/free-plan-limit",
          publishedAt: null,
          updatedAt: "2026-06-17T01:00:00.000Z",
          readingMinutes: 3,
          bodyFormat: "markdown",
          bodyMarkdown: "본문입니다.",
          ctaLabel: null,
          ctaHref: null,
          status: "draft",
          visibility: "internal",
          noindex: true,
          metaTitle: null,
          metaDescription: null,
          ogImageUrl: null,
          authorKey: "yeon",
          sourceRepo: "yeon",
          sourcePaths: [],
          redirectTo: null,
        },
      ],
      sitemapEntries: [
        {
          url: "https://support.yeon.world",
          lastModified: "2026-06-17T00:00:00.000Z",
          changeFrequency: "weekly",
          priority: 0.9,
        },
        {
          url: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
          lastModified: "2026-06-17T00:00:00.000Z",
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ],
    });

    expect(dashboard.stats.articleCount).toBe(2);
    expect(dashboard.stats.publishedCount).toBe(1);
    expect(dashboard.stats.draftCount).toBe(1);
    expect(dashboard.stats.noindexCount).toBe(1);
    expect(dashboard.stats.metaDescriptionMissingCount).toBe(1);
    expect(dashboard.stats.seoWarningCount).toBe(2);
    expect(dashboard.recentPublishedRows.map((row) => row.article.id)).toEqual([
      "article-published",
    ]);
    expect(dashboard.recentUpdatedRows.map((row) => row.article.id)).toEqual([
      "article-draft",
      "article-published",
    ]);
    expect(dashboard.seoWarningRows.map((row) => row.article.id)).toEqual([
      "article-draft",
    ]);
    expect(dashboard.rows[0].sitemapIncluded).toBe(true);
    expect(dashboard.rows[1].seoWarnings).toEqual([
      "noindex",
      "meta description 누락",
    ]);
    expect(dashboard.summaries[0].statusCounts.draft).toBe(1);
    expect(dashboard.summaries[0].seoWarningCount).toBe(2);
  });

  it("Spring admin DTO에서 채널 화면 데이터를 분리한다", () => {
    const data = buildPublicContentAdminChannelData({
      channel: "blog",
      articles: [
        {
          id: "blog-article",
          channel: "blog",
          serviceKey: "yeon",
          category: "engineering",
          slug: "engineering/backend/public-content-spring-api",
          title: "공개 콘텐츠 Spring API 설계 기록",
          description: "설명입니다.",
          summary: "요약입니다.",
          canonicalUrl:
            "https://blog.yeon.world/engineering/backend/public-content-spring-api",
          publishedAt: "2026-06-17T00:00:00.000Z",
          updatedAt: "2026-06-17T00:00:00.000Z",
          readingMinutes: 6,
          bodyFormat: "markdown",
          bodyMarkdown: "본문입니다.",
          ctaLabel: null,
          ctaHref: null,
          status: "review",
          visibility: "unlisted",
          noindex: false,
          metaTitle: null,
          metaDescription: "검색 설명입니다.",
          ogImageUrl: null,
          authorKey: "yeon",
          sourceRepo: "yeon",
          sourcePaths: ["apps/backend"],
          redirectTo: null,
        },
      ],
      sitemapEntries: [],
    });

    expect(data.summary?.channel).toBe("blog");
    expect(data.summary?.statusCounts.review).toBe(1);
    expect(data.recentUpdatedRows.map((row) => row.article.id)).toEqual([
      "blog-article",
    ]);
    expect(data.seoWarningRows).toHaveLength(0);
    expect(data.rows).toHaveLength(1);
    expect(data.rows[0].serviceLabel).toBe("yeon");
  });
});
