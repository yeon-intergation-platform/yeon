import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthenticatedUser, mockFetchLifeOsDailyReportFromSpring } = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  mockFetchLifeOsDailyReportFromSpring: vi.fn(),
}));


vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

vi.mock("@/server/life-os-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/life-os-spring-client")>("@/server/life-os-spring-client");
  return {
    ...actual,
    fetchLifeOsDailyReportFromSpring: (...args: unknown[]) => mockFetchLifeOsDailyReportFromSpring(...args),
  };
});

import { GET } from "../route";

describe("api/v1/life-os/reports/daily route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET은 Spring 일간리포트 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchLifeOsDailyReportFromSpring.mockResolvedValue({ report: { periodType: "daily", periodStart: "2026-05-08", periodEnd: "2026-05-08", metrics: { localDate: "2026-05-08", plannedHours: 0, actionHours: 0, matchedHours: 0, overplannedHours: 0, restInsteadOfPlanHours: 0, unrelatedActionHours: 0, spilloverHours: 0, overplanningScore: 0, mismatchByBlock: { "0-7": 0, "8-15": 0, "16-23": 0 }, classifications: [] }, patterns: [], recommendations: [], generatedAt: "2026-05-08T07:00:00.000Z", aiSummary: null } });
    const response = await GET(new NextRequest("http://localhost/api/v1/life-os/reports/daily?localDate=2026-05-08"));
    expect(response.status).toBe(200);
  });
});
