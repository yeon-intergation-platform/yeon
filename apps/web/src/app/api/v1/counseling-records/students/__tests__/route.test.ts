import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordStudentsSpringBackendHttpError } from "@/server/counseling-record-students-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCounselingRecordStudentsFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/counseling-record-students-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/counseling-record-students-spring-client")>("@/server/counseling-record-students-spring-client");
  return {
    ...actual,
    fetchCounselingRecordStudentsFromSpring: (...args: unknown[]) => mockFetchCounselingRecordStudentsFromSpring(...args),
  };
});

import { GET } from "../route";

describe("counseling-records/students route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: null, response: Response.json({ message: "로그인이 필요합니다." }, { status: 401 }) });
    const response = await GET(new NextRequest("http://localhost/api/v1/counseling-records/students"));
    expect(response.status).toBe(401);
  });

  it("Spring 학생 요약을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchCounselingRecordStudentsFromSpring.mockResolvedValue({ students: [{ studentName: "홍길동", recordCount: 2, firstCounselingAt: "2026-05-01T00:00:00Z", lastCounselingAt: "2026-05-08T00:00:00Z" }] });
    const response = await GET(new NextRequest("http://localhost/api/v1/counseling-records/students"));
    expect(mockFetchCounselingRecordStudentsFromSpring).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchCounselingRecordStudentsFromSpring.mockRejectedValue(new CounselingRecordStudentsSpringBackendHttpError(403, "권한이 없습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/counseling-records/students"));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "권한이 없습니다." });
  });
});
