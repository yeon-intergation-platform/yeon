import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordTrendSpringBackendHttpError } from "@/server/counseling-record-trend-spring-client";
import { ServiceError } from "@/server/services/service-error";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCounselingRecordTrendSourcesFromSpring = vi.fn();
const mockStreamTrendAnalysis = vi.fn();

vi.mock("../../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
  withHandler: async (fn: () => Promise<Response>) => {
    try {
      return await fn();
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return Response.json(
          { message: error.message as string },
          { status: error.status as number },
        );
      }
      throw error;
    }
  },
}));

vi.mock("@/server/counseling-record-trend-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-trend-spring-client")
  >("@/server/counseling-record-trend-spring-client");
  return {
    ...actual,
    fetchCounselingRecordTrendSourcesFromSpring: (...args: unknown[]) =>
      mockFetchCounselingRecordTrendSourcesFromSpring(...args),
  };
});

vi.mock("@/server/services/counseling-ai-service", () => ({
  streamTrendAnalysis: (...args: unknown[]) => mockStreamTrendAnalysis(...args),
}));

import { POST } from "../route";

function createSseStream(text: string) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe("counseling-records/analyze-trend route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 guard 응답을 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json({ message: "로그인이 필요합니다." }, { status: 401 }),
    });
    const response = await POST(
      new NextRequest("http://localhost/api/v1/counseling-records/analyze-trend", {
        method: "POST",
        body: JSON.stringify({ recordIds: ["cr-1"] }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("Spring trend sources로 SSE 응답을 만든다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordTrendSourcesFromSpring.mockResolvedValue({
      records: [
        {
          studentName: "홍길동",
          sessionTitle: "1회기",
          counselingType: "대면 상담",
          createdAt: "2026-05-01T00:00:00Z",
          segments: [{ speakerLabel: "멘토", text: "안녕", startMs: 0 }],
        },
      ],
    });
    mockStreamTrendAnalysis.mockResolvedValue(createSseStream("data: hi\n\n"));

    const response = await POST(
      new NextRequest("http://localhost/api/v1/counseling-records/analyze-trend", {
        method: "POST",
        body: JSON.stringify({ recordIds: ["cr-1"] }),
      }),
    );

    expect(mockFetchCounselingRecordTrendSourcesFromSpring).toHaveBeenCalledWith("user-1", {
      recordIds: ["cr-1"],
    });
    expect(mockStreamTrendAnalysis).toHaveBeenCalledWith("홍길동", [
      {
        studentName: "홍길동",
        sessionTitle: "1회기",
        counselingType: "대면 상담",
        createdAt: "2026-05-01T00:00:00Z",
        segments: [{ speakerLabel: "멘토", text: "안녕", startMs: 0 }],
      },
    ]);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchCounselingRecordTrendSourcesFromSpring.mockRejectedValue(
      new CounselingRecordTrendSpringBackendHttpError(
        400,
        "같은 수강생의 기록만 추이 분석할 수 있습니다.",
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/counseling-records/analyze-trend", {
        method: "POST",
        body: JSON.stringify({ recordIds: ["cr-1", "cr-2"] }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
