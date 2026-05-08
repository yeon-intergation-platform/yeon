import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordListSpringBackendHttpError } from "@/server/counseling-record-list-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCounselingRecordListFromSpring = vi.fn();
const mockEnsureCounselingRecordProcessingScheduledForListItems = vi.fn();

vi.mock("../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/counseling-record-list-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-list-spring-client")
  >("@/server/counseling-record-list-spring-client");
  return {
    ...actual,
    fetchCounselingRecordListFromSpring: (...args: unknown[]) =>
      mockFetchCounselingRecordListFromSpring(...args),
  };
});

vi.mock("@/server/services/counseling-records-service", () => ({
  createCounselingRecordAndQueueTranscription: vi.fn(),
  createTextMemoRecord: vi.fn(),
  ensureCounselingRecordProcessingScheduledForListItems: (...args: unknown[]) =>
    mockEnsureCounselingRecordProcessingScheduledForListItems(...args),
}));

import { GET } from "../route";

describe("counseling-records route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 guard 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json({ message: "로그인이 필요합니다." }, { status: 401 }),
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/counseling-records"),
    );

    expect(response.status).toBe(401);
  });

  it("Spring 목록 응답을 반환하고 scheduling helper를 호출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordListFromSpring.mockResolvedValue({
      records: [
        {
          id: "cr-1",
          spaceId: "space-1",
          memberId: "mem-1",
          studentName: "홍길동",
          sessionTitle: "1회기",
          counselingType: "대면 상담",
          counselorName: "상담사",
          status: "ready",
          recordSource: "audio_upload",
          preview: "미리보기",
          tags: ["대면 상담"],
          audioOriginalName: "a.m4a",
          audioMimeType: "audio/m4a",
          audioByteSize: 10,
          audioDurationMs: 1,
          transcriptSegmentCount: 1,
          transcriptTextLength: 4,
          processingStage: "completed",
          processingProgress: 100,
          processingMessage: "완료",
          processingChunkCount: 1,
          processingChunkCompletedCount: 1,
          transcriptionAttemptCount: 1,
          analysisStatus: "ready",
          analysisProgress: 100,
          analysisErrorMessage: null,
          analysisAttemptCount: 1,
          language: "ko",
          sttModel: "gpt",
          errorMessage: null,
          createdAt: "2026-05-01T00:00:00Z",
          updatedAt: "2026-05-01T00:00:00Z",
          transcriptionCompletedAt: null,
          analysisCompletedAt: null,
        },
      ],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/counseling-records?spaceId=space-1&limit=20&before=2026-05-08T00:00:00.000Z",
      ),
    );

    expect(mockFetchCounselingRecordListFromSpring).toHaveBeenCalledWith({
      userId: "user-1",
      spaceId: "space-1",
      unlinked: false,
      limit: 20,
      before: "2026-05-08T00:00:00.000Z",
    });
    expect(mockEnsureCounselingRecordProcessingScheduledForListItems).toHaveBeenCalledWith(
      "user-1",
      expect.any(Array),
    );
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordListFromSpring.mockRejectedValue(
      new CounselingRecordListSpringBackendHttpError(
        403,
        "권한이 없습니다.",
      ),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/counseling-records?unlinked=true"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "권한이 없습니다.",
    });
  });
});
