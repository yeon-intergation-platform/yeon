import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordAudioSpringBackendHttpError } from "@/server/counseling-record-audio-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCounselingRecordAudioFromSpring = vi.fn();

vi.mock("../../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/server/counseling-record-audio-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-audio-spring-client")
  >("@/server/counseling-record-audio-spring-client");
  return {
    ...actual,
    fetchCounselingRecordAudioFromSpring: (...args: unknown[]) =>
      mockFetchCounselingRecordAudioFromSpring(...args),
  };
});

import { GET } from "../audio/route";

describe("audio route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 guard 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      ),
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/audio",
      ),
      { params: Promise.resolve({ recordId: "record-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("성공 시 audio 스트림과 range 헤더를 반영한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordAudioFromSpring.mockResolvedValue({
      bytes: new Uint8Array(new TextEncoder().encode("audio")),
      status: 206,
      mimeType: "audio/webm",
      contentLength: "5",
      contentDisposition: "inline; filename*=UTF-8''%EC%83%81%EB%8B%B4.webm",
      contentRange: "bytes 0-4/10",
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/audio",
        {
          headers: { range: "bytes=0-4" },
        },
      ),
      { params: Promise.resolve({ recordId: "record-1" }) },
    );

    expect(mockFetchCounselingRecordAudioFromSpring).toHaveBeenCalledWith({
      userId: "user-1",
      recordId: "record-1",
      rangeHeader: "bytes=0-4",
    });
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-4/10");
    expect(response.headers.get("content-type")).toBe("audio/webm");
  });

  it("Spring 오류면 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordAudioFromSpring.mockRejectedValue(
      new CounselingRecordAudioSpringBackendHttpError(
        404,
        "파일이 없습니다.",
      ),
    );

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/audio",
      ),
      { params: Promise.resolve({ recordId: "record-1" }) },
    );

    expect(response.status).toBe(404);
  });
});
