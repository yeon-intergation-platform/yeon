import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchPublicContentArticleFromSpring = vi.fn();

vi.mock("@/server/public-content-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/public-content-spring-client")
  >("@/server/public-content-spring-client");

  return {
    ...actual,
    fetchPublicContentArticleFromSpring: (...args: unknown[]) =>
      mockFetchPublicContentArticleFromSpring(...args),
  };
});
import { GET } from "../route";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";

describe("api/v1/content/[channel]/[...slug] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 channel과 slug를 검증한 뒤 Spring 상세 조회 결과를 반환한다", async () => {
    mockFetchPublicContentArticleFromSpring.mockResolvedValue({
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
        ctaLabel: "권한 가이드 보기",
        ctaHref: "/nexa/guides/discord-bot-permissions",
      },
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/content/support/nexa/guides/add-nexa-discord-bot"
      ),
      {
        params: Promise.resolve({
          channel: "support",
          slug: ["nexa", "guides", "add-nexa-discord-bot"],
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      article: expect.objectContaining({
        channel: "support",
        slug: "nexa/guides/add-nexa-discord-bot",
      }),
    });
    expect(mockFetchPublicContentArticleFromSpring).toHaveBeenCalledWith({
      channel: "support",
      slug: "nexa/guides/add-nexa-discord-bot",
    });
  });

  it("GET은 잘못된 slug path를 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/content/support/NEXA/guides"),
      {
        params: Promise.resolve({
          channel: "support",
          slug: ["NEXA", "guides"],
        }),
      }
    );

    expect(response.status).toBe(400);
    expect(mockFetchPublicContentArticleFromSpring).not.toHaveBeenCalled();
  });

  it("GET은 Spring 404를 그대로 매핑한다", async () => {
    mockFetchPublicContentArticleFromSpring.mockRejectedValue(
      new PublicContentSpringBackendHttpError(
        404,
        "공개 콘텐츠 글을 찾을 수 없습니다."
      )
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/content/support/nexa/missing"),
      {
        params: Promise.resolve({
          channel: "support",
          slug: ["nexa", "missing"],
        }),
      }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "공개 콘텐츠 글을 찾을 수 없습니다.",
    });
  });
});
