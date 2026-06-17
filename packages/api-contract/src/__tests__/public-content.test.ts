import { describe, expect, it } from "vitest";

import {
  PUBLIC_CONTENT_API_PATHS,
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_STATUSES,
  createPublicContentArticleBodySchema,
  publicContentArticleResponseSchema,
  publicContentListQuerySchema,
  publicContentSlugSchema,
  updatePublicContentArticleBodySchema,
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

  it("keeps create requests draft and public by default", () => {
    const parsed = createPublicContentArticleBodySchema.parse({
      channel: "support",
      serviceKey: "nexa",
      category: "guides",
      slug: "nexa/guides/add-nexa-discord-bot",
      title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
      description: "NEXA 설치 전 권한과 테스트 순서를 정리합니다.",
      summary: "서버 권한 확인부터 첫 질문 테스트까지 순서대로 진행합니다.",
      bodyMarkdown: "본문입니다.",
    });

    expect(parsed.status).toBe(PUBLIC_CONTENT_STATUSES.draft);
    expect(parsed.visibility).toBe("public");
    expect(parsed.bodyFormat).toBe("markdown");
    expect(parsed.authorKey).toBe("yeon");
  });

  it("rejects empty update requests", () => {
    expect(() => updatePublicContentArticleBodySchema.parse({})).toThrow(
      "수정할 공개 콘텐츠 필드가 필요합니다."
    );
    expect(() =>
      updatePublicContentArticleBodySchema.parse({ title: undefined })
    ).toThrow("수정할 공개 콘텐츠 필드가 필요합니다.");
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
        sourcePaths: [],
      },
    });

    expect(response.article.channel).toBe("blog");
  });

  it("builds stable public and admin API paths", () => {
    expect(
      PUBLIC_CONTENT_API_PATHS.publicArticle(
        PUBLIC_CONTENT_CHANNELS.support,
        "nexa/guides/add-nexa-discord-bot"
      )
    ).toBe("/api/v1/content/support/nexa/guides/add-nexa-discord-bot");
    expect(PUBLIC_CONTENT_API_PATHS.adminPublish("article-1")).toBe(
      "/api/v1/admin/content/article-1/publish"
    );
  });
});
