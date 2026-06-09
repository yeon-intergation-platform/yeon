import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MemberCounselingRecordsSpringBackendHttpError } from "@/server/member-counseling-records-spring-client";
import { MembersSpringBackendHttpError } from "@/server/members-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchMemberInSpaceFromSpring = vi.fn();
const mockFetchMemberCounselingRecordsFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/server/members-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/members-spring-client")
  >("@/server/members-spring-client");
  return {
    ...actual,
    fetchMemberInSpaceFromSpring: (...args: unknown[]) =>
      mockFetchMemberInSpaceFromSpring(...args),
  };
});
vi.mock("@/server/member-counseling-records-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/member-counseling-records-spring-client")
  >("@/server/member-counseling-records-spring-client");
  return {
    ...actual,
    fetchMemberCounselingRecordsFromSpring: (...args: unknown[]) =>
      mockFetchMemberCounselingRecordsFromSpring(...args),
  };
});

import { GET } from "../route";

describe("member counseling-records route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증이면 shared response를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    });
    const response = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ spaceId: "space-1", memberId: "mem-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("Spring 운영 메모 목록을 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchMemberInSpaceFromSpring.mockResolvedValue({
      member: { publicId: "mem-1" },
    });
    mockFetchMemberCounselingRecordsFromSpring.mockResolvedValue({
      records: [],
    });
    const response = await GET(new NextRequest("http://localhost?limit=5"), {
      params: Promise.resolve({ spaceId: "space-1", memberId: "mem-1" }),
    });
    expect(mockFetchMemberCounselingRecordsFromSpring).toHaveBeenCalledWith({
      userId: "user-1",
      spaceId: "space-1",
      memberId: "mem-1",
      limit: 5,
      before: undefined,
    });
    expect(response.status).toBe(200);
  });

  it("member lookup 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchMemberInSpaceFromSpring.mockRejectedValue(
      new MembersSpringBackendHttpError(404, "없음")
    );
    const response = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ spaceId: "space-1", memberId: "mem-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("record list 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchMemberInSpaceFromSpring.mockResolvedValue({
      member: { publicId: "mem-1" },
    });
    mockFetchMemberCounselingRecordsFromSpring.mockRejectedValue(
      new MemberCounselingRecordsSpringBackendHttpError(403, "권한이 없습니다.")
    );
    const response = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ spaceId: "space-1", memberId: "mem-1" }),
    });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "권한이 없습니다.",
    });
  });
});
