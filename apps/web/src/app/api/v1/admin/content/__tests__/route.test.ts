import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const mockFetchAdminPublicContentArticlesFromSpring = vi.fn();
const mockGetAuthSessionTokensFromRequest = vi.fn();
const mockGetAuthUserBySessionToken = vi.fn();
const mockClearAuthSessionCookie = vi.fn((response) => response);

vi.mock("@/server/auth/request-session-token", () => ({
  getAuthSessionTokensFromRequest: (...args: unknown[]) =>
    mockGetAuthSessionTokensFromRequest(...args),
}));

vi.mock("@/server/auth/session", () => ({
  clearAuthSessionCookie: (response: unknown) =>
    mockClearAuthSessionCookie(response),
  getAuthUserBySessionToken: (...args: unknown[]) =>
    mockGetAuthUserBySessionToken(...args),
}));

vi.mock("@/server/public-content-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/public-content-spring-client")
  >("@/server/public-content-spring-client");

  return {
    ...actual,
    fetchAdminPublicContentArticlesFromSpring: (...args: unknown[]) =>
      mockFetchAdminPublicContentArticlesFromSpring(...args),
  };
});
import { GET } from "../route";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";

function createAuthUser() {
  return {
    id: USER_ID,
    email: "admin@yeon.world",
    displayName: "관리자",
    avatarUrl: null,
    lastLoginAt: "2026-06-17T00:00:00.000Z",
    providers: ["google"],
  };
}

describe("api/v1/admin/content route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthSessionTokensFromRequest.mockReturnValue([
      { source: "cookie", token: "valid-token" },
    ]);
    mockGetAuthUserBySessionToken.mockResolvedValue(createAuthUser());
  });

  it("GET은 인증 사용자 id와 검증된 query로 Spring admin 목록을 조회한다", async () => {
    mockFetchAdminPublicContentArticlesFromSpring.mockResolvedValue({
      articles: [
        {
          id: "content-support-nexa-add-bot",
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
          sourcePaths: [],
          redirectTo: null,
        },
      ],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/admin/content?channel=support&status=draft&visibility=internal"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      articles: [
        expect.objectContaining({ id: "content-support-nexa-add-bot" }),
      ],
    });
    expect(mockFetchAdminPublicContentArticlesFromSpring).toHaveBeenCalledWith({
      userId: USER_ID,
      query: {
        channel: "support",
        status: "draft",
        visibility: "internal",
      },
    });
  });

  it("GET은 잘못된 admin query를 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/admin/content?status=deleted")
    );

    expect(response.status).toBe(400);
    expect(
      mockFetchAdminPublicContentArticlesFromSpring
    ).not.toHaveBeenCalled();
  });

  it("GET은 인증되지 않은 요청을 401로 거절하고 쿠키 세션을 정리한다", async () => {
    mockGetAuthUserBySessionToken.mockResolvedValue(null);

    const response = await GET(
      new NextRequest("http://localhost/api/v1/admin/content")
    );

    expect(response.status).toBe(401);
    expect(mockClearAuthSessionCookie).toHaveBeenCalledOnce();
    expect(
      mockFetchAdminPublicContentArticlesFromSpring
    ).not.toHaveBeenCalled();
  });

  it("GET은 Spring admin 권한 오류를 그대로 매핑한다", async () => {
    mockFetchAdminPublicContentArticlesFromSpring.mockRejectedValue(
      new PublicContentSpringBackendHttpError(403, "관리자 권한이 필요합니다.")
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/admin/content?channel=support")
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "관리자 권한이 필요합니다.",
    });
  });
});
