import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImportDraftsSpringBackendHttpError } from "@/server/import-drafts-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchLocalImportDraftsFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/server/import-drafts-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/import-drafts-spring-client")>("@/server/import-drafts-spring-client");
  return {
    ...actual,
    fetchLocalImportDraftsFromSpring: (...args: unknown[]) => mockFetchLocalImportDraftsFromSpring(...args),
  };
});

import { GET } from "../route";

describe("local drafts route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET은 Spring drafts를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchLocalImportDraftsFromSpring.mockResolvedValue({ drafts: [{ id: "draft-1" }] });
    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/local/drafts?limit=5"));
    expect(mockFetchLocalImportDraftsFromSpring).toHaveBeenCalledWith("user-1", 5);
    expect(response.status).toBe(200);
  });

  it("GET은 Spring error를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchLocalImportDraftsFromSpring.mockRejectedValue(new ImportDraftsSpringBackendHttpError(404, "없음"));
    const response = await GET(new NextRequest("http://localhost/api/v1/integrations/local/drafts"));
    expect(response.status).toBe(404);
  });
});
