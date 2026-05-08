import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockHandleCloudAnalyzeRoute = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/app/api/v1/integrations/_shared", () => ({
  handleCloudAnalyzeRoute: (...args: unknown[]) => mockHandleCloudAnalyzeRoute(...args),
}));
vi.mock("@/server/googledrive-browser-spring-client", () => ({
  downloadGoogleDriveFileFromSpring: vi.fn(),
  GoogleDriveBrowserSpringBackendHttpError: class GoogleDriveBrowserSpringBackendHttpError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
}));

import { POST } from "../route";

describe("googledrive analyze route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: null, response: new Response(null, { status: 401 }) });

    const response = await POST(new NextRequest("http://localhost/api/v1/integrations/googledrive/analyze", { method: "POST" }));

    expect(response.status).toBe(401);
  });

  it("인증되면 shared analyze handler를 호출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockHandleCloudAnalyzeRoute.mockResolvedValue(new Response(null, { status: 200 }));

    const request = new NextRequest("http://localhost/api/v1/integrations/googledrive/analyze", { method: "POST" });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockHandleCloudAnalyzeRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        request,
        userId: "user-1",
        provider: "googledrive",
        providerLabel: "Google Drive",
        requireMimeType: true,
      }),
    );
  });
});
