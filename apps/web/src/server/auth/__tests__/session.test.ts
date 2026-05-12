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
} from "../session";

describe("auth session service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
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
      get: vi.fn().mockReturnValue({ value: "session-token" }),
    });

    await expect(deleteCurrentAuthSession()).resolves.toBeUndefined();
    expect(mockDeleteRootAuthSessionInSpring).toHaveBeenCalledWith(
      "session-token"
    );
  });

  it("apply/clearAuthSessionCookie는 쿠키를 설정한다", () => {
    const response = NextResponse.json({ ok: true });
    const expiresAt = new Date(Date.now() + 60_000);

    applyAuthSessionCookie(response, {
      sessionToken: "session-token",
      expiresAt,
    });
    clearAuthSessionCookie(response);

    expect(response.cookies.get("yeon.session")?.value).toBe("");
  });
});
