import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authErrorCodes } from "../auth-errors";
import { buildSocialAuthorizationUrl } from "../social-providers";

describe("social providers", () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.KAKAO_REST_API_KEY = "kakao-rest-key";
    process.env.NEXT_PUBLIC_APP_URL = "https://yeon.world";
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it("buildSocialAuthorizationUrl은 google auth URL을 만든다 (PKCE S256 포함)", () => {
    const url = buildSocialAuthorizationUrl({
      provider: "google",
      state: "state-token",
      codeChallenge: "challenge-abc",
    });

    expect(url).toContain("accounts.google.com");
    expect(url).toContain("client_id=google-client-id");
    expect(url).toContain("state=state-token");
    expect(url).toContain("code_challenge=challenge-abc");
    expect(url).toContain("code_challenge_method=S256");
  });

  it("buildSocialAuthorizationUrl은 kakao auth URL에도 PKCE를 포함한다", () => {
    const url = buildSocialAuthorizationUrl({
      provider: "kakao",
      state: "kakao-state",
      codeChallenge: "kakao-challenge",
    });

    expect(url).toContain("kauth.kakao.com");
    expect(url).toContain("client_id=kakao-rest-key");
    expect(url).toContain("code_challenge=kakao-challenge");
    expect(url).toContain("code_challenge_method=S256");
  });

  it("필수 env가 없으면 providerNotConfigured 오류를 던진다", () => {
    delete process.env.GOOGLE_CLIENT_ID;

    expect(() =>
      buildSocialAuthorizationUrl({
        provider: "google",
        state: "state-token",
        codeChallenge: "challenge-abc",
      })
    ).toThrowError(
      expect.objectContaining({ code: authErrorCodes.providerNotConfigured })
    );
  });
});
