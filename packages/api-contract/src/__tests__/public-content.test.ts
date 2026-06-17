import { describe, expect, it } from "vitest";

import {
  PUBLIC_CONTENT_API_PATHS,
  PUBLIC_CONTENT_CHANNELS,
  publicContentArticleResponseSchema,
  publicContentAdminArticleResponseSchema,
  publicContentImportManuscriptFrontmatterSchema,
  publicContentListQuerySchema,
  publicContentSlugSchema,
} from "../public-content";

describe("public content API contract", () => {
  it("validates public list filters with channel and service keys", () => {
    const parsed = publicContentListQuerySchema.parse({
      channel: PUBLIC_CONTENT_CHANNELS.support,
      serviceKey: "nexa",
      category: "guides",
    });

    expect(parsed).toEqual({
      channel: "support",
      serviceKey: "nexa",
      category: "guides",
    });
  });

  it("validates stable nested article slugs", () => {
    expect(
      publicContentSlugSchema.parse("nexa/guides/add-nexa-discord-bot")
    ).toBe("nexa/guides/add-nexa-discord-bot");
    expect(() => publicContentSlugSchema.parse("NEXA/guides")).toThrow();
    expect(() => publicContentSlugSchema.parse("nexa//guides")).toThrow();
  });

  it("validates portable public article responses", () => {
    const response = publicContentArticleResponseSchema.parse({
      article: {
        channel: "blog",
        serviceKey: "yeon",
        category: "engineering",
        slug: "engineering/search-console-sitemap-operations",
        title: "Search Console과 sitemap을 운영 절차에 넣는 이유",
        description: "공개 사이트가 늘어날 때 운영 절차를 정리합니다.",
        summary: "canonical, robots, sitemap을 운영에 넣는 이유를 설명합니다.",
        canonicalUrl:
          "https://blog.yeon.world/engineering/search-console-sitemap-operations",
        publishedAt: "2026-06-17T00:00:00.000Z",
        updatedAt: "2026-06-17T00:00:00.000Z",
        readingMinutes: 5,
        bodyMarkdown: "본문입니다.",
        ctaLabel: null,
        ctaHref: null,
      },
    });

    expect(response.article.channel).toBe("blog");
    expect("sourcePaths" in response.article).toBe(false);
  });

  it("allows root-relative CTA hrefs for same-channel public links", () => {
    const response = publicContentArticleResponseSchema.parse({
      article: {
        channel: "support",
        serviceKey: "nexa",
        category: "troubleshooting",
        slug: "nexa/troubleshooting/bot-not-responding",
        title: "NEXA 봇이 응답하지 않을 때 확인할 5가지",
        description: "NEXA 봇이 응답하지 않을 때 확인할 항목입니다.",
        summary: "응답 없음 문제를 권한과 채널 기준으로 좁힙니다.",
        canonicalUrl:
          "https://support.yeon.world/nexa/troubleshooting/bot-not-responding",
        publishedAt: "2026-06-17T00:00:00.000Z",
        updatedAt: "2026-06-17T00:00:00.000Z",
        readingMinutes: 4,
        bodyMarkdown: "본문입니다.",
        ctaLabel: "권한 가이드 보기",
        ctaHref: "/nexa/guides/discord-bot-permissions",
      },
    });

    expect(response.article.ctaHref).toBe(
      "/nexa/guides/discord-bot-permissions"
    );
  });

  it("keeps source paths only on admin article responses", () => {
    const response = publicContentAdminArticleResponseSchema.parse({
      article: {
        id: "article-1",
        channel: "support",
        serviceKey: "nexa",
        category: "guides",
        slug: "nexa/guides/add-nexa-discord-bot",
        title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
        description: "NEXA 설치 전 권한과 테스트 순서를 정리합니다.",
        summary: "서버 권한 확인부터 첫 질문 테스트까지 순서대로 진행합니다.",
        canonicalUrl:
          "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
        publishedAt: "2026-06-17T00:00:00.000Z",
        updatedAt: "2026-06-17T00:00:00.000Z",
        readingMinutes: 4,
        bodyMarkdown: "본문입니다.",
        ctaLabel: null,
        ctaHref: null,
        status: "published",
        visibility: "public",
        metaTitle: null,
        metaDescription: null,
        ogImageUrl: null,
        authorKey: "yeon",
        sourceRepo: "yeon",
        sourcePaths: ["/docs/example.md"],
        redirectTo: null,
      },
    });

    expect(response.article.sourcePaths).toEqual(["/docs/example.md"]);
  });

  it("allows draft admin article responses without publishedAt", () => {
    const response = publicContentAdminArticleResponseSchema.parse({
      article: {
        id: "draft-1",
        channel: "blog",
        serviceKey: "yeon",
        category: "engineering",
        slug: "engineering/draft-search-console-note",
        title: "Search Console 초안",
        description: "공개 전 운영 초안입니다.",
        summary: "초안 상태에서는 publishedAt이 없을 수 있습니다.",
        canonicalUrl:
          "https://blog.yeon.world/engineering/draft-search-console-note",
        publishedAt: null,
        updatedAt: "2026-06-17T00:00:00.000Z",
        readingMinutes: 3,
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
        sourceRepo: null,
        sourcePaths: [],
        redirectTo: null,
      },
    });

    expect(response.article.publishedAt).toBeNull();
    expect(response.article.status).toBe("draft");
  });

  it("validates markdown import frontmatter with the shared contract", () => {
    const frontmatter = publicContentImportManuscriptFrontmatterSchema.parse({
      title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
      description: "NEXA 설치 전 권한과 테스트 순서를 정리합니다.",
      channel: "support",
      service: "nexa",
      category: "guides",
      slug: "nexa/guides/add-nexa-discord-bot",
      status: "draft",
      source_repo: "discord-assitant",
      source_path: ["/Users/osuma/coding_stuffs/discord-assitant/README.md"],
    });

    expect(frontmatter.service).toBe("nexa");
    expect(frontmatter.source_path).toHaveLength(1);
    expect(() =>
      publicContentImportManuscriptFrontmatterSchema.parse({
        ...frontmatter,
        extra_field: "허용하지 않음",
      })
    ).toThrow();
  });

  it("builds stable public and read-only admin API paths", () => {
    expect(
      PUBLIC_CONTENT_API_PATHS.publicArticle(
        PUBLIC_CONTENT_CHANNELS.support,
        "nexa/guides/add-nexa-discord-bot"
      )
    ).toBe("/api/v1/content/support/nexa/guides/add-nexa-discord-bot");
    expect(PUBLIC_CONTENT_API_PATHS.adminArticle("article-1")).toBe(
      "/api/v1/admin/content/article-1"
    );
  });
});
