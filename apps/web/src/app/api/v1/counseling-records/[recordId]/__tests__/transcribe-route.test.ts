import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockRetryCounselingRecordTranscriptionInSpring = vi.fn();

vi.mock("../../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));
vi.mock("@yeon/api-contract/counseling-records", () => ({
  counselingRecordDetailResponseSchema: {
    parse: (value: unknown) => value,
  },
}));
vi.mock("@/server/counseling-record-transcription-spring-client", () => ({
  CounselingRecordTranscriptionSpringBackendHttpError: class CounselingRecordTranscriptionSpringBackendHttpError extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
    }
  },
  retryCounselingRecordTranscriptionInSpring: (...args: unknown[]) =>
    mockRetryCounselingRecordTranscriptionInSpring(...args),
}));

import { CounselingRecordTranscriptionSpringBackendHttpError } from "@/server/counseling-record-transcription-spring-client";

import { POST } from "../transcribe/route";

describe("transcribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 guard 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    });

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/transcribe",
        { method: "POST" }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("성공 시 Spring record detail payload를 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockRetryCounselingRecordTranscriptionInSpring.mockResolvedValue({
      record: { id: "record-1" },
    });

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/transcribe",
        {
          method: "POST",
          headers: { "x-client-request-id": "req-1" },
        }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(mockRetryCounselingRecordTranscriptionInSpring).toHaveBeenCalledWith(
      {
        userId: "user-1",
        recordId: "record-1",
        clientRequestId: "req-1",
      }
    );
    expect(response.status).toBe(200);
  });

  it("Spring 오류면 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockRetryCounselingRecordTranscriptionInSpring.mockRejectedValue(
      new CounselingRecordTranscriptionSpringBackendHttpError(
        409,
        "이미 처리 중입니다."
      )
    );

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/transcribe",
        { method: "POST" }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.status).toBe(409);
  });
});
