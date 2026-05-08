import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleDriveBrowserSpringBackendHttpError } from "@/server/googledrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchGoogleDriveStatusFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/googledrive-browser-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/googledrive-browser-spring-client")>(
    "@/server/googledrive-browser-spring-client",
  );

  return {
    ...actual,
    fetchGoogleDriveStatusFromSpring: (...args: unknown[]) =>
      mockFetchGoogleDriveStatusFromSpring(...args),
  };
});

import { GET } from "../route";

describe("googledrive status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json({ message: "로그인이 필요합니다." }, { status: 401 }),
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/status"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "로그인이 필요합니다." });
  });

  it("인증되면 Spring status를 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchGoogleDriveStatusFromSpring.mockResolvedValue({
      connected: true,
      sheetSyncReady: false,
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/status"));

    expect(mockFetchGoogleDriveStatusFromSpring).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ connected: true, sheetSyncReady: false });
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchGoogleDriveStatusFromSpring.mockRejectedValue(
      new GoogleDriveBrowserSpringBackendHttpError(401, "Google Drive가 연결되어 있지 않습니다."),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/status"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Google Drive가 연결되어 있지 않습니다." });
  });
});
