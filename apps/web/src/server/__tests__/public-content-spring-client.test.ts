import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchAdminPublicContentArticleFromSpring,
  fetchAdminPublicContentArticlesFromSpring,
  fetchPublicContentArticleFromSpring,
} from "../public-content-spring-client";

describe("public-content-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;
  const userId = "00000000-0000-4000-8000-000000000001";

  function createAdminArticle(id = "content-support-nexa-add-bot") {
    return {
      id,
      channel: "support",
      serviceKey: "nexa",
      category: "guides",
      slug: "nexa/guides/add-nexa-discord-bot",
      title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
      description: "설명입니다.",
      summary: "요약입니다.",
      canonicalUrl:
        "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
      publishedAt: null,
      updatedAt: "2026-06-17T00:00:00.000Z",
      readingMinutes: 4,
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
      sourcePaths: ["apps/web/src/features/public-content"],
      redirectTo: null,
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("공개 콘텐츠 조회는 내부 토큰을 보내지 않는다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          article: {
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
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchPublicContentArticleFromSpring({
      channel: "support",
      slug: "nexa/guides/add-nexa-discord-bot",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(url).toBe(
      "http://spring.test/api/v1/content/support/nexa/guides/add-nexa-discord-bot"
    );
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-Internal-Token")).toBeNull();
  });

  it("관리자 목록 조회는 내부 토큰과 인증 사용자 id를 Spring으로 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ articles: [createAdminArticle()] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdminPublicContentArticlesFromSpring({
      userId,
      query: {
        channel: "support",
        status: "draft",
        visibility: "internal",
      },
    });

    const [rawUrl, init] = fetchMock.mock.calls[0]!;
    const url = new URL(String(rawUrl));
    const headers = new Headers(init?.headers);
    expect(`${url.origin}${url.pathname}`).toBe(
      "http://spring.test/api/v1/admin/content"
    );
    expect(url.searchParams.get("channel")).toBe("support");
    expect(url.searchParams.get("status")).toBe("draft");
    expect(url.searchParams.get("visibility")).toBe("internal");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-User-Id")).toBe(userId);
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("관리자 상세 조회는 articleId를 경로 세그먼트로 인코딩한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ article: createAdminArticle("content/support 1") }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdminPublicContentArticleFromSpring({
      userId,
      articleId: "content/support 1",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(url).toBe(
      "http://spring.test/api/v1/admin/content/content%2Fsupport%201"
    );
    expect(headers.get("X-Yeon-User-Id")).toBe(userId);
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });
});
