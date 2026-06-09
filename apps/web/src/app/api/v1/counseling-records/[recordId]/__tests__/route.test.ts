import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordDetailsSpringBackendHttpError } from "@/server/counseling-record-details-spring-client";
import { CounselingRecordMutationSpringBackendHttpError } from "@/server/counseling-record-mutation-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCounselingRecordDetailFromSpring = vi.fn();
const mockLinkCounselingRecordMemberInSpring = vi.fn();
const mockDeleteCounselingRecordInSpring = vi.fn();

vi.mock("../../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/counseling-record-details-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-details-spring-client")
  >("@/server/counseling-record-details-spring-client");
  return {
    ...actual,
    fetchCounselingRecordDetailFromSpring: (...args: unknown[]) =>
      mockFetchCounselingRecordDetailFromSpring(...args),
  };
});

vi.mock("@/server/counseling-record-mutation-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-mutation-spring-client")
  >("@/server/counseling-record-mutation-spring-client");
  return {
    ...actual,
    linkCounselingRecordMemberInSpring: (...args: unknown[]) =>
      mockLinkCounselingRecordMemberInSpring(...args),
    deleteCounselingRecordInSpring: (...args: unknown[]) =>
      mockDeleteCounselingRecordInSpring(...args),
  };
});

import { DELETE, GET, PATCH } from "../route";

describe("counseling-records/[recordId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET 비인증이면 guard 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1"),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("GET은 Spring 상세 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordDetailFromSpring.mockResolvedValue({
      record: {
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
        transcriptTextLength: 2,
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
        transcriptText: "원문",
        transcriptSegments: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            segmentIndex: 0,
            startMs: 0,
            endMs: 100,
            speakerLabel: "멘토",
            speakerTone: "teacher",
            text: "안녕",
          },
        ],
        audioUrl: "/api/v1/counseling-records/cr-1/audio",
        analysisResult: {
          summary: "요약",
          member: { name: null, traits: [], emotion: "" },
          issues: [],
          actions: { mentor: [], member: [], nextSession: [] },
          keywords: [],
        },
        assistantMessages: [],
      },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1"),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(mockFetchCounselingRecordDetailFromSpring).toHaveBeenCalledWith(
      "user-1",
      "cr-1"
    );
    expect(response.status).toBe(200);
  });

  it("GET은 Spring 오류를 그대로 노출한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordDetailFromSpring.mockRejectedValue(
      new CounselingRecordDetailsSpringBackendHttpError(
        404,
        "운영 메모를 찾지 못했습니다."
      )
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1"),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "운영 메모를 찾지 못했습니다.",
    });
  });

  it("PATCH는 기존 service를 유지한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockLinkCounselingRecordMemberInSpring.mockResolvedValue({ ok: true });

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1", {
        method: "PATCH",
        body: JSON.stringify({ memberId: null }),
      }),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(mockLinkCounselingRecordMemberInSpring).toHaveBeenCalledWith(
      "user-1",
      "cr-1",
      null
    );
    expect(response.status).toBe(200);
  });

  it("DELETE는 기존 service를 유지한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockDeleteCounselingRecordInSpring.mockResolvedValue({ ok: true });

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(mockDeleteCounselingRecordInSpring).toHaveBeenCalledWith(
      "user-1",
      "cr-1"
    );
    expect(response.status).toBe(200);
  });

  it("PATCH ServiceError는 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockLinkCounselingRecordMemberInSpring.mockRejectedValue(
      new CounselingRecordMutationSpringBackendHttpError(
        403,
        "권한이 없습니다."
      )
    );

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/counseling-records/cr-1", {
        method: "PATCH",
        body: JSON.stringify({ memberId: null }),
      }),
      { params: Promise.resolve({ recordId: "cr-1" }) }
    );

    expect(response.status).toBe(403);
  });
});
