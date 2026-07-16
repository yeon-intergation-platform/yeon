import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const mockTransitionAdminPublicContentArticleInSpring = vi.fn();
const mockGetAuthSessionTokensFromRequest = vi.fn();
const mockGetAuthUserBySessionToken = vi.fn();
const mockClearAuthSessionCookie = vi.fn((response) => response);
const mockRevalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

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
    transitionAdminPublicContentArticleInSpring: (...args: unknown[]) =>
      mockTransitionAdminPublicContentArticleInSpring(...args),
  };
});

import { POST } from "../route";

describe("api/v1/admin/content/[articleId]/[action] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthSessionTokensFromRequest.mockReturnValue([
      { source: "cookie", token: "valid-token" },
    ]);
    mockGetAuthUserBySessionToken.mockResolvedValue({
      id: USER_ID,
      email: "admin@yeon.world",
      displayName: "관리자",
      avatarUrl: null,
      lastLoginAt: "2026-07-16T00:00:00.000Z",
      providers: ["google"],
    });
    mockTransitionAdminPublicContentArticleInSpring.mockResolvedValue({
      article: { id: "123", status: "published", version: 4 },
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("발행 성공 후 cache 무효화가 실패해도 성공 응답을 유지한다", async () => {
    mockRevalidateTag.mockImplementation(() => {
      throw new Error("cache unavailable");
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/admin/content/123/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: 3 }),
      }),
      { params: Promise.resolve({ articleId: "123", action: "publish" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      article: { id: "123", status: "published", version: 4 },
    });
    expect(mockRevalidateTag).toHaveBeenCalledOnce();
    expect(
      mockTransitionAdminPublicContentArticleInSpring
    ).toHaveBeenCalledWith({
      userId: USER_ID,
      articleId: "123",
      action: "publish",
      body: { version: 3 },
    });
  });
});
