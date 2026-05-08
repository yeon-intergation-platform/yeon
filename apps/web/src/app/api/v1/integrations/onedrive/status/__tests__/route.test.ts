import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OneDriveBrowserSpringBackendHttpError } from "@/server/onedrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchOneDriveStatusFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/onedrive-browser-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/onedrive-browser-spring-client")>(
    "@/server/onedrive-browser-spring-client",
  );

  return {
    ...actual,
    fetchOneDriveStatusFromSpring: (...args: unknown[]) => mockFetchOneDriveStatusFromSpring(...args),
  };
});

import { GET } from "../route";

describe("onedrive status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json({ message: "로그인이 필요합니다." }, { status: 401 }),
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/onedrive/status"));

    expect(response.status).toBe(401);
  });

  it("인증되면 Spring status를 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchOneDriveStatusFromSpring.mockResolvedValue({ connected: true });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/onedrive/status"));

    expect(mockFetchOneDriveStatusFromSpring).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ connected: true });
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchOneDriveStatusFromSpring.mockRejectedValue(
      new OneDriveBrowserSpringBackendHttpError(401, "OneDrive가 연결되어 있지 않습니다."),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/onedrive/status"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "OneDrive가 연결되어 있지 않습니다." });
  });
});
