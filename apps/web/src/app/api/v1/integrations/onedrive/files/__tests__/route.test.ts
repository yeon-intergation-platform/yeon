import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OneDriveBrowserSpringBackendHttpError } from "@/server/onedrive-browser-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchOneDriveFilesFromSpring = vi.fn();

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
    fetchOneDriveFilesFromSpring: (...args: unknown[]) => mockFetchOneDriveFilesFromSpring(...args),
  };
});

import { GET } from "../route";

describe("onedrive files route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("folderId를 Spring에 전달한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchOneDriveFilesFromSpring.mockResolvedValue({
      files: [{ id: "file-1", name: "students.xlsx", size: 123, lastModifiedAt: "2026-05-08T00:00:00Z", mimeType: "application/vnd.ms-excel" }],
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/onedrive/files?folderId=folder-1"));

    expect(mockFetchOneDriveFilesFromSpring).toHaveBeenCalledWith({ userId: "user-1", folderId: "folder-1" });
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchOneDriveFilesFromSpring.mockRejectedValue(
      new OneDriveBrowserSpringBackendHttpError(403, "OneDrive 접근 권한이 없습니다. 다시 연결해 주세요."),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/onedrive/files"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "OneDrive 접근 권한이 없습니다. 다시 연결해 주세요." });
  });
});
