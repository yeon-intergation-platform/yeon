import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchPublicContentArticlesFromSpring = vi.fn();

vi.mock("@/server/public-content-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/public-content-spring-client")
  >("@/server/public-content-spring-client");

  return {
    ...actual,
    fetchPublicContentArticlesFromSpring: (...args: unknown[]) =>
      mockFetchPublicContentArticlesFromSpring(...args),
  };
});
import { GET } from "../route";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";

describe("api/v1/content route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 query를 검증한 뒤 Spring 목록 조회 결과를 반환한다", async () => {
    mockFetchPublicContentArticlesFromSpring.mockResolvedValue({
      articles: [
        {
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
        },
      ],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/content?channel=support&serviceKey=nexa&category=guides"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      articles: [
        expect.objectContaining({
          channel: "support",
          serviceKey: "nexa",
          slug: "nexa/guides/add-nexa-discord-bot",
        }),
      ],
    });
    expect(mockFetchPublicContentArticlesFromSpring).toHaveBeenCalledWith({
      channel: "support",
      serviceKey: "nexa",
      category: "guides",
    });
  });

  it("GET은 잘못된 channel query를 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/content?channel=invalid")
    );

    expect(response.status).toBe(400);
    expect(mockFetchPublicContentArticlesFromSpring).not.toHaveBeenCalled();
  });

  it("GET은 Spring 오류를 그대로 매핑한다", async () => {
    mockFetchPublicContentArticlesFromSpring.mockRejectedValue(
      new PublicContentSpringBackendHttpError(
        503,
        "공개 콘텐츠 목록을 불러오지 못했습니다."
      )
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/content?channel=support")
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: "공개 콘텐츠 목록을 불러오지 못했습니다.",
    });
  });
});
