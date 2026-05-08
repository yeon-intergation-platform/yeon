import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockHandleOAuthStartRoute = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/app/api/v1/integrations/_shared", () => ({
  handleOAuthStartRoute: (...args: unknown[]) => mockHandleOAuthStartRoute(...args),
}));
vi.mock("@/server/cloud-oauth-spring-client", () => ({
  fetchGoogleDriveOAuthUrlFromSpring: vi.fn(),
  CloudOAuthSpringBackendHttpError: class CloudOAuthSpringBackendHttpError extends Error { constructor(public status:number, message:string){ super(message); } },
}));

import { GET } from "../route";

describe("googledrive auth route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: null, response: new Response(null, { status: 401 }) });
    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/auth"));
    expect(response.status).toBe(401);
  });

  it("인증되면 shared oauth start handler를 호출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockHandleOAuthStartRoute.mockResolvedValue(new Response(null, { status: 302 }));
    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/auth"));
    expect(response.status).toBe(302);
  });
});
