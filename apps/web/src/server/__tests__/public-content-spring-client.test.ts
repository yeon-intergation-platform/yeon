import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPublicContentArticleFromSpring } from "../public-content-spring-client";

describe("public-content-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

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
});
