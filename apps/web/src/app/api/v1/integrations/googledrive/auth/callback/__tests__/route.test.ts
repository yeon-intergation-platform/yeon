import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolve = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockExchange = vi.fn();
const mockRequireUser = vi.fn();

vi.mock("@/app/api/v1/integrations/_shared", () => ({
  resolveOAuthCallbackContext: (...args: unknown[]) => mockResolve(...args),
  createOAuthCallbackSuccessResponse: (...args: unknown[]) =>
    mockSuccess(...args),
  createOAuthCallbackErrorResponse: (...args: unknown[]) => mockError(...args),
}));
vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireUser(...args),
}));
vi.mock("@/server/cloud-oauth-spring-client", () => ({
  exchangeGoogleDriveOAuthCodeInSpring: (...args: unknown[]) =>
    mockExchange(...args),
  CloudOAuthSpringBackendHttpError: class CloudOAuthSpringBackendHttpError extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
    }
  },
}));

import { GET } from "../route";

describe("googledrive auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccess.mockReturnValue(new Response(null, { status: 302 }));
    mockError.mockReturnValue(new Response(null, { status: 302 }));
    mockRequireUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
  });

  it("로그인하지 않았으면 invalid_state로 거부한다", async () => {
    mockRequireUser.mockResolvedValue({
      currentUser: null,
      response: new Response(null, { status: 401 }),
    });
    const response = await GET(new NextRequest("http://localhost/callback"));
    expect(mockError).toHaveBeenCalledWith("googledrive", "invalid_state");
    expect(mockResolve).not.toHaveBeenCalled();
    expect(response.status).toBe(302);
  });

  it("현재 사용자 id를 context 검증에 전달한다", async () => {
    mockResolve.mockReturnValue({ userId: "user-1", code: "code-1" });
    await GET(new NextRequest("http://localhost/callback"));
    expect(mockResolve).toHaveBeenCalledWith(
      expect.objectContaining({ currentUserId: "user-1" })
    );
  });

  it("context response가 있으면 그대로 반환한다", async () => {
    const res = new Response(null, { status: 302 });
    mockResolve.mockReturnValue({ response: res });
    const response = await GET(new NextRequest("http://localhost/callback"));
    expect(response).toBe(res);
  });

  it("교환 성공 시 success redirect를 반환한다", async () => {
    mockResolve.mockReturnValue({ userId: "user-1", code: "code-1" });
    const response = await GET(new NextRequest("http://localhost/callback"));
    expect(mockExchange).toHaveBeenCalledWith({
      userId: "user-1",
      code: "code-1",
    });
    expect(response.status).toBe(302);
  });
});
