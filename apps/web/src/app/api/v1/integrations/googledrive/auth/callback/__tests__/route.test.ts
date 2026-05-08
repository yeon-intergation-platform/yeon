import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolve = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockExchange = vi.fn();

vi.mock("@/app/api/v1/integrations/_shared", () => ({
  resolveOAuthCallbackContext: (...args: unknown[]) => mockResolve(...args),
  createOAuthCallbackSuccessResponse: (...args: unknown[]) => mockSuccess(...args),
  createOAuthCallbackErrorResponse: (...args: unknown[]) => mockError(...args),
}));
vi.mock("@/server/cloud-oauth-spring-client", () => ({
  exchangeGoogleDriveOAuthCodeInSpring: (...args: unknown[]) => mockExchange(...args),
  CloudOAuthSpringBackendHttpError: class CloudOAuthSpringBackendHttpError extends Error { constructor(public status:number, message:string){ super(message); } },
}));

import { GET } from "../route";

describe("googledrive auth callback route", () => {
  beforeEach(() => { vi.clearAllMocks(); mockSuccess.mockReturnValue(new Response(null,{status:302})); mockError.mockReturnValue(new Response(null,{status:302})); });

  it("context response가 있으면 그대로 반환한다", async () => {
    const res = new Response(null, { status: 302 });
    mockResolve.mockReturnValue({ response: res });
    const response = await GET(new NextRequest("http://localhost/callback"));
    expect(response).toBe(res);
  });

  it("교환 성공 시 success redirect를 반환한다", async () => {
    mockResolve.mockReturnValue({ userId: "user-1", code: "code-1" });
    const response = await GET(new NextRequest("http://localhost/callback"));
    expect(mockExchange).toHaveBeenCalledWith({ userId: "user-1", code: "code-1" });
    expect(response.status).toBe(302);
  });
});
