import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthenticatedUser, mockFetchLifeOsWeeklyReportFromSpring } = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  mockFetchLifeOsWeeklyReportFromSpring: vi.fn(),
}));


vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

vi.mock("@/server/life-os-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/life-os-spring-client")>("@/server/life-os-spring-client");
  return {
    ...actual,
    fetchLifeOsWeeklyReportFromSpring: (...args: unknown[]) => mockFetchLifeOsWeeklyReportFromSpring(...args),
  };
});

import { GET } from "../route";

describe("api/v1/life-os/reports/weekly route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET은 Spring 주간리포트 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchLifeOsWeeklyReportFromSpring.mockResolvedValue({ report: { periodType: "weekly", periodStart: "2026-05-05", periodEnd: "2026-05-11", metrics: { periodStart: "2026-05-05", periodEnd: "2026-05-11", days: [], plannedHours: 0, actionHours: 0, matchedHours: 0, overplannedHours: 0, overplanningScore: 0 }, patterns: [], recommendations: [], generatedAt: "2026-05-08T07:00:00.000Z", aiSummary: null } });
    const response = await GET(new NextRequest("http://localhost/api/v1/life-os/reports/weekly?periodStart=2026-05-05&periodEnd=2026-05-11"));
    expect(response.status).toBe(200);
  });
});
