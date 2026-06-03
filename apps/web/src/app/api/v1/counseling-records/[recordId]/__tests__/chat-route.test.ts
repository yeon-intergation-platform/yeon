import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CounselingRecordChatSpringBackendHttpError } from "@/server/counseling-record-chat-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockStreamCounselingRecordChatFromSpring = vi.fn();
const mockClearCounselingRecordChatFromSpring = vi.fn();

vi.mock("../../_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/server/counseling-record-chat-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/counseling-record-chat-spring-client")
  >("@/server/counseling-record-chat-spring-client");
  return {
    ...actual,
    streamCounselingRecordChatFromSpring: (...args: unknown[]) =>
      mockStreamCounselingRecordChatFromSpring(...args),
    clearCounselingRecordChatFromSpring: (...args: unknown[]) =>
      mockClearCounselingRecordChatFromSpring(...args),
  };
});

import { DELETE, POST } from "../chat/route";

function createSseStream(chunks: string[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("chat route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST는 마지막 메시지가 비어 있으면 400을 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/chat",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "   " }],
          }),
        }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.status).toBe(400);
  });

  it("POST는 Spring 오류면 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockStreamCounselingRecordChatFromSpring.mockRejectedValue(
      new CounselingRecordChatSpringBackendHttpError(
        404,
        "레코드를 찾지 못했습니다."
      )
    );

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/chat",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "안녕하세요" }],
          }),
        }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.status).toBe(404);
  });

  it("POST는 Spring 채팅 스트림을 SSE 응답으로 전달한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockStreamCounselingRecordChatFromSpring.mockResolvedValue(
      createSseStream(['data: {"content":"답변입니다."}\n', "data: [DONE]\n"])
    );

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/chat",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "안녕하세요" }],
          }),
        }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(mockStreamCounselingRecordChatFromSpring).toHaveBeenCalledWith(
      "user-1",
      "record-1",
      expect.objectContaining({
        messages: [{ role: "user", content: "안녕하세요" }],
      })
    );
  });

  it("POST는 웹검색 토글을 Spring 요청 본문에 그대로 전달한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockStreamCounselingRecordChatFromSpring.mockResolvedValue(
      createSseStream([
        'data: {"content":"검색 답변입니다."}\n',
        "data: [DONE]\n",
      ])
    );

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/chat",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "최신 소식 알려줘" }],
            useWebSearch: true,
          }),
        }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(mockStreamCounselingRecordChatFromSpring).toHaveBeenCalledWith(
      "user-1",
      "record-1",
      expect.objectContaining({
        messages: [{ role: "user", content: "최신 소식 알려줘" }],
        useWebSearch: true,
      })
    );
  });

  it("DELETE는 clear 실패 Spring 오류를 그대로 반환한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockClearCounselingRecordChatFromSpring.mockRejectedValue(
      new CounselingRecordChatSpringBackendHttpError(403, "권한이 없습니다.")
    );

    const response = await DELETE(
      new NextRequest(
        "http://localhost/api/v1/counseling-records/record-1/chat",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(response.status).toBe(403);
  });
});
