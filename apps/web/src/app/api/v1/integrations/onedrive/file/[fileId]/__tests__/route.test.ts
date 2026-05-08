import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OneDriveBrowserSpringBackendHttpError } from "@/server/onedrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockDownloadOneDriveFileFromSpring = vi.fn();

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
    downloadOneDriveFileFromSpring: (...args: unknown[]) => mockDownloadOneDriveFileFromSpring(...args),
  };
});

import { GET } from "../route";

describe("onedrive file route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Spring binary 응답을 그대로 프록시한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockDownloadOneDriveFileFromSpring.mockResolvedValue({ bytes: new Uint8Array([97, 98, 99]), contentType: "application/vnd.ms-excel" });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/integrations/onedrive/file/file-1?mimeType=application/vnd.ms-excel"),
      { params: Promise.resolve({ fileId: "file-1" }) },
    );

    expect(mockDownloadOneDriveFileFromSpring).toHaveBeenCalledWith({ userId: "user-1", fileId: "file-1", mimeType: "application/vnd.ms-excel" });
    expect(response.status).toBe(200);
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([97, 98, 99]);
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockDownloadOneDriveFileFromSpring.mockRejectedValue(
      new OneDriveBrowserSpringBackendHttpError(401, "OneDrive가 연결되어 있지 않습니다."),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/integrations/onedrive/file/file-1"),
      { params: Promise.resolve({ fileId: "file-1" }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "OneDrive가 연결되어 있지 않습니다." });
  });
});
