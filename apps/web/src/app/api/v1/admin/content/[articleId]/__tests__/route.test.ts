import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const mockFetchAdminPublicContentArticleFromSpring = vi.fn();
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
    fetchAdminPublicContentArticleFromSpring: (...args: unknown[]) =>
      mockFetchAdminPublicContentArticleFromSpring(...args),
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

describe("api/v1/admin/content/[articleId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthSessionTokensFromRequest.mockReturnValue([
      { source: "cookie", token: "valid-token" },
    ]);
    mockGetAuthUserBySessionToken.mockResolvedValue(createAuthUser());
  });

  it("GET은 인증 사용자 id와 articleId로 Spring admin 상세를 조회한다", async () => {
    mockFetchAdminPublicContentArticleFromSpring.mockResolvedValue({
      article: {
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
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/admin/content/content-support-nexa-add-bot"
      ),
      {
        params: Promise.resolve({
          articleId: "content-support-nexa-add-bot",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      article: expect.objectContaining({ id: "content-support-nexa-add-bot" }),
    });
    expect(mockFetchAdminPublicContentArticleFromSpring).toHaveBeenCalledWith({
      userId: USER_ID,
      articleId: "content-support-nexa-add-bot",
    });
  });

  it("GET은 잘못된 articleId를 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/admin/content/%20"),
      {
        params: Promise.resolve({
          articleId: " ",
        }),
      }
    );

    expect(response.status).toBe(400);
    expect(mockFetchAdminPublicContentArticleFromSpring).not.toHaveBeenCalled();
  });

  it("GET은 Spring 404를 그대로 매핑한다", async () => {
    mockFetchAdminPublicContentArticleFromSpring.mockRejectedValue(
      new PublicContentSpringBackendHttpError(
        404,
        "관리 대상 공개 콘텐츠 글을 찾을 수 없습니다."
      )
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/admin/content/missing"),
      {
        params: Promise.resolve({
          articleId: "missing",
        }),
      }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: "NOT_FOUND",
      message: "관리 대상 공개 콘텐츠 글을 찾을 수 없습니다.",
    });
  });
});
