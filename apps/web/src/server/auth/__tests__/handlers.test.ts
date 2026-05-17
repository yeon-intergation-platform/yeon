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
});
