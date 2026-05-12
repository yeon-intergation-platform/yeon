import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();
const fetchSheetExportIntegrationFromSpring = vi.fn();
const exportSpaceToSheet = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

vi.mock("@/server/sheet-export-spring-client", () => ({
  fetchSheetExportIntegrationFromSpring,
  SheetExportSpringBackendHttpError: class SheetExportSpringBackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

vi.mock("@/server/sheet-export-bff", () => ({
  exportSpaceToSheet,
}));

describe("POST /api/v1/spaces/[spaceId]/sheet-export/sync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("Spring integration lookup 뒤 export service를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    fetchSheetExportIntegrationFromSpring.mockResolvedValue({
      integration: { sheetId: "sheet123" },
    });
    exportSpaceToSheet.mockResolvedValue({
      exported: 12,
      lastSyncedAt: new Date("2026-05-08T02:03:04.000Z"),
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/sheet-export/sync",
        {
          method: "POST",
        }
      ) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchSheetExportIntegrationFromSpring).toHaveBeenCalledWith(
      "space_alpha",
      "user-1"
    );
    expect(exportSpaceToSheet).toHaveBeenCalledWith(
      "space_alpha",
      "sheet123",
      "user-1"
    );
    expect(body).toEqual({
      exported: 12,
      lastSyncedAt: "2026-05-08T02:03:04.000Z",
    });
  });

  test("integration이 없으면 404를 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    fetchSheetExportIntegrationFromSpring.mockResolvedValue({
      integration: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/sheet-export/sync",
        {
          method: "POST",
        }
      ) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "연동된 익스포트 시트가 없습니다." });
    expect(exportSpaceToSheet).not.toHaveBeenCalled();
  });
});
