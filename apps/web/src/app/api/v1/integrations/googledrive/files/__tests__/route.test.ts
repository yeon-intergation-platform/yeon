import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleDriveBrowserSpringBackendHttpError } from "@/server/googledrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchGoogleDriveFilesFromSpring = vi.fn();

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
    fetchGoogleDriveFilesFromSpring: (...args: unknown[]) =>
      mockFetchGoogleDriveFilesFromSpring(...args),
  };
});

import { GET } from "../route";

describe("googledrive files route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("folderId를 Spring에 전달한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchGoogleDriveFilesFromSpring.mockResolvedValue({
      files: [
        {
          id: "file-1",
          name: "students.xlsx",
          size: 123,
          lastModifiedAt: "2026-05-08T00:00:00Z",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/files?folderId=root-folder"));

    expect(mockFetchGoogleDriveFilesFromSpring).toHaveBeenCalledWith({
      userId: "user-1",
      folderId: "root-folder",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      files: [
        {
          id: "file-1",
          name: "students.xlsx",
          size: 123,
          lastModifiedAt: "2026-05-08T00:00:00Z",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchGoogleDriveFilesFromSpring.mockRejectedValue(
      new GoogleDriveBrowserSpringBackendHttpError(401, "Google Drive가 연결되어 있지 않습니다."),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/googledrive/files"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Google Drive가 연결되어 있지 않습니다." });
  });
});
