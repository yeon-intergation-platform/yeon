import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_OAUTH_STATE_COOKIE_NAME } from "../constants";
import { completeSocialAuth } from "../handlers";
import { createOAuthStateCookieValue } from "../oauth-state";

const { completeSocialAuthInSpringMock } = vi.hoisted(() => ({
  completeSocialAuthInSpringMock: vi.fn(),
}));

vi.mock("@/server/root-auth-spring-client", () => ({
  completeSocialAuthInSpring: completeSocialAuthInSpringMock,
}));

describe("social auth handlers", () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    completeSocialAuthInSpringMock.mockResolvedValue({
      userId: "usr_test",
      sessionToken: "session-token",
      expiresAt: new Date("2026-06-18T00:00:00.000Z"),
    });
    process.env.AUTH_SECRET = "oauth-handler-test-secret";
    process.env.NEXT_PUBLIC_APP_URL = "https://yeon.world";
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it("토큰 교환 appOrigin은 callback 요청 origin이 아니라 authorization redirect_uri의 canonical origin을 사용한다", async () => {
    const oauthState = createOAuthStateCookieValue({
      provider: "google",
      nextPath: "/card-service",
    });
    const request = new NextRequest(
      `http://yeon-prod-web:3000/api/auth/google/callback?state=${oauthState.state}&code=provider-code`,
      {
        headers: {
          cookie: `${AUTH_OAUTH_STATE_COOKIE_NAME}=${oauthState.cookieValue}`,
        },
      }
    );

    const response = await completeSocialAuth(request, "google");

    expect(completeSocialAuthInSpringMock).toHaveBeenCalledWith({
      provider: "google",
      code: "provider-code",
      codeVerifier: oauthState.codeVerifier,
      appOrigin: "https://yeon.world",
    });
    expect(response.headers.get("location")).toBe(
      "https://yeon.world/card-service"
    );
  });

  it("모바일 mobileReturnUrl이면 세션 쿠키 대신 딥링크로 세션 토큰을 반환한다", async () => {
    const oauthState = createOAuthStateCookieValue({
      provider: "google",
      nextPath: "/card-service",
      mobileReturnUrl: "yeon-card-service://auth/social",
    });
    const request = new NextRequest(
      `http://yeon-prod-web:3000/api/auth/google/callback?state=${oauthState.state}&code=provider-code`,
      {
        headers: {
          cookie: `${AUTH_OAUTH_STATE_COOKIE_NAME}=${oauthState.cookieValue}`,
        },
      }
    );

    const response = await completeSocialAuth(request, "google");

    const location = response.headers.get("location") ?? "";
    expect(location).toContain("yeon-card-service://auth/social");
    expect(location).toContain("token=session-token");
    // 토큰은 딥링크로만 전달 — 세션 쿠키는 설정하지 않는다.
    expect(response.cookies.get("yeon.session")).toBeUndefined();
  });

  it("허용되지 않은 scheme의 mobileReturnUrl은 무시되고 기존 웹 쿠키 플로우를 탄다", async () => {
    // http(s) 등 비허용 scheme은 normalizeMobileReturnUrl에서 null 처리 → 웹 흐름.
    const oauthState = createOAuthStateCookieValue({
      provider: "google",
      nextPath: "/card-service",
      mobileReturnUrl: "https://evil.example/steal",
    });
    const request = new NextRequest(
      `http://yeon-prod-web:3000/api/auth/google/callback?state=${oauthState.state}&code=provider-code`,
      {
        headers: {
          cookie: `${AUTH_OAUTH_STATE_COOKIE_NAME}=${oauthState.cookieValue}`,
        },
      }
    );

    const response = await completeSocialAuth(request, "google");

    expect(response.headers.get("location")).toBe(
      "https://yeon.world/card-service"
    );
    expect(response.cookies.get("yeon.session")).toBeDefined();
  });
});
