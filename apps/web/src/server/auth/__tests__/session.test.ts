import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCookies = vi.fn();
const mockCreateRootAuthSessionInSpring = vi.fn();
const mockFetchRootAuthSessionFromSpring = vi.fn();
const mockDeleteRootAuthSessionInSpring = vi.fn();

vi.mock("next/headers", () => ({
  cookies: (...args: unknown[]) => mockCookies(...args),
}));

vi.mock("@/server/root-auth-spring-client", () => ({
  createRootAuthSessionInSpring: (...args: unknown[]) =>
    mockCreateRootAuthSessionInSpring(...args),
}));

vi.mock("@/server/auth-session-spring-client", () => ({
  fetchRootAuthSessionFromSpring: (...args: unknown[]) =>
    mockFetchRootAuthSessionFromSpring(...args),
  deleteRootAuthSessionInSpring: (...args: unknown[]) =>
    mockDeleteRootAuthSessionInSpring(...args),
}));
import {
  applyAuthSessionCookie,
  clearAuthSessionCookie,
  createAuthSession,
  deleteCurrentAuthSession,
  getAuthUserBySessionToken,
  getCurrentAuthUser,
} from "../session";

describe("auth session service", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
    mockCookies.mockResolvedValue({
      getAll: vi.fn().mockReturnValue([]),
    });
    mockCreateRootAuthSessionInSpring.mockResolvedValue({
      sessionToken: "session-token",
      expiresAt: new Date("2026-04-13T10:00:00.000Z"),
    });
  });

  it("createAuthSession은 Spring 세션 생성 결과를 반환한다", async () => {
    await expect(createAuthSession("user-1")).resolves.toEqual({
      sessionToken: "session-token",
      expiresAt: new Date("2026-04-13T10:00:00.000Z"),
    });
    expect(mockCreateRootAuthSessionInSpring).toHaveBeenCalledWith("user-1");
  });

  it("getAuthUserBySessionToken은 Spring이 비인증으로 응답하면 null을 반환한다", async () => {
    mockFetchRootAuthSessionFromSpring.mockResolvedValue({
      authenticated: false,
      user: null,
    });

    await expect(
      getAuthUserBySessionToken("expired-token")
    ).resolves.toBeNull();
  });

  it("getAuthUserBySessionToken은 Spring 인증 유저를 반환한다", async () => {
    const user = { id: "user-1", email: "user@yeon.world" };
    mockFetchRootAuthSessionFromSpring.mockResolvedValue({
      authenticated: true,
      user,
    });

    await expect(getAuthUserBySessionToken("valid-token")).resolves.toBe(user);
    expect(mockFetchRootAuthSessionFromSpring).toHaveBeenCalledWith(
      "valid-token"
    );
  });

  it("deleteCurrentAuthSession은 현재 쿠키 토큰이 없으면 아무것도 하지 않는다", async () => {
    await expect(deleteCurrentAuthSession()).resolves.toBeUndefined();
    expect(mockDeleteRootAuthSessionInSpring).not.toHaveBeenCalled();
  });

  it("deleteCurrentAuthSession은 현재 쿠키 토큰을 Spring에 삭제 요청한다", async () => {
    mockCookies.mockResolvedValue({
      getAll: vi.fn().mockReturnValue([{ value: "session-token" }]),
    });

    await expect(deleteCurrentAuthSession()).resolves.toBeUndefined();
    expect(mockDeleteRootAuthSessionInSpring).toHaveBeenCalledWith(
      "session-token"
    );
  });

  it("apply/clearAuthSessionCookie는 쿠키를 설정하고 host-only 쿠키를 만료한다", () => {
    const response = NextResponse.json({ ok: true });
    const expiresAt = new Date(Date.now() + 60_000);

    applyAuthSessionCookie(response, {
      sessionToken: "session-token",
      expiresAt,
    });
    clearAuthSessionCookie(response);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("yeon.session=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("중복 세션 쿠키가 있으면 유효한 후보를 찾아 현재 유저를 반환한다", async () => {
    mockCookies.mockResolvedValue({
      getAll: vi
        .fn()
        .mockReturnValue([{ value: "stale-token" }, { value: "valid-token" }]),
    });
    mockFetchRootAuthSessionFromSpring
      .mockResolvedValueOnce({ authenticated: false, user: null })
      .mockResolvedValueOnce({
        authenticated: true,
        user: { id: "user-1", email: "user@yeon.world" },
      });

    await expect(getCurrentAuthUser()).resolves.toEqual({
      id: "user-1",
      email: "user@yeon.world",
    });
    expect(mockFetchRootAuthSessionFromSpring).toHaveBeenNthCalledWith(
      1,
      "stale-token"
    );
    expect(mockFetchRootAuthSessionFromSpring).toHaveBeenNthCalledWith(
      2,
      "valid-token"
    );
  });

  it("deleteCurrentAuthSession은 중복 토큰을 한 번씩 삭제한다", async () => {
    mockCookies.mockResolvedValue({
      getAll: vi
        .fn()
        .mockReturnValue([
          { value: "token-1" },
          { value: "token-1" },
          { value: "token-2" },
        ]),
    });

    await expect(deleteCurrentAuthSession()).resolves.toBeUndefined();
    expect(mockDeleteRootAuthSessionInSpring).toHaveBeenCalledTimes(2);
    expect(mockDeleteRootAuthSessionInSpring).toHaveBeenCalledWith("token-1");
    expect(mockDeleteRootAuthSessionInSpring).toHaveBeenCalledWith("token-2");
  });

  it("운영 canonical/www 배포에서는 인증 쿠키를 apex와 www가 공유한다", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_APP_URL = "https://yeon.world";
    const response = NextResponse.json({ ok: true });
    const expiresAt = new Date(Date.now() + 60_000);

    applyAuthSessionCookie(response, {
      sessionToken: "session-token",
      expiresAt,
    });

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("Domain=.yeon.world");
    expect(setCookie).toContain("Secure");
  });

  it("운영 canonical/www 배포에서는 clear가 host-only와 apex domain 쿠키를 모두 만료한다", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_APP_URL = "https://yeon.world";
    const response = NextResponse.json({ ok: true });

    clearAuthSessionCookie(response);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Domain=.yeon.world");
  });

  it("개발/스테이징 배포에서는 운영 apex 쿠키 도메인을 공유하지 않는다", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_APP_URL = "https://dev.yeon.world";
    const response = NextResponse.json({ ok: true });
    const expiresAt = new Date(Date.now() + 60_000);

    applyAuthSessionCookie(response, {
      sessionToken: "session-token",
      expiresAt,
    });

    expect(response.headers.get("set-cookie")).not.toContain("Domain=");
  });
});
