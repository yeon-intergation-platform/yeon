import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleDriveBrowserSpringBackendHttpError } from "@/server/googledrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockDownloadGoogleDriveFileFromSpring = vi.fn();

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
    downloadGoogleDriveFileFromSpring: (...args: unknown[]) =>
      mockDownloadGoogleDriveFileFromSpring(...args),
  };
});

import { GET } from "../route";

describe("googledrive file route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Spring binary 응답을 그대로 프록시한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockDownloadGoogleDriveFileFromSpring.mockResolvedValue({
      bytes: new Uint8Array([97, 98, 99]),
      contentType: "application/vnd.ms-excel",
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/integrations/googledrive/file/file-1?mimeType=application/vnd.ms-excel"),
      { params: Promise.resolve({ fileId: "file-1" }) },
    );

    expect(mockDownloadGoogleDriveFileFromSpring).toHaveBeenCalledWith({
      userId: "user-1",
      fileId: "file-1",
      mimeType: "application/vnd.ms-excel",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/vnd.ms-excel");
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([97, 98, 99]);
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockDownloadGoogleDriveFileFromSpring.mockRejectedValue(
      new GoogleDriveBrowserSpringBackendHttpError(401, "Google Drive가 연결되어 있지 않습니다."),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/integrations/googledrive/file/file-1"),
      { params: Promise.resolve({ fileId: "file-1" }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Google Drive가 연결되어 있지 않습니다." });
  });
});
