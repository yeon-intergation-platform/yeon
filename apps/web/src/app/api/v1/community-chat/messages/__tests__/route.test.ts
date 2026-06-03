import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchCommunityChatMessagesFromSpring = vi.fn();
const mockSendCommunityChatMessageToSpring = vi.fn();

vi.mock("@/server/community-chat-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/community-chat-spring-client")
  >("@/server/community-chat-spring-client");

  return {
    ...actual,
    fetchCommunityChatMessagesFromSpring: (...args: unknown[]) =>
      mockFetchCommunityChatMessagesFromSpring(...args),
    sendCommunityChatMessageToSpring: (...args: unknown[]) =>
      mockSendCommunityChatMessageToSpring(...args),
  };
});
import { GET, POST } from "../route";
import { CommunityChatSpringBackendHttpError } from "@/server/community-chat-spring-client";

const MESSAGE_ID = "00000000-0000-4000-8000-000000000901";
const CREATED_AT = "2026-05-12T12:00:00.000Z";

function createMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: MESSAGE_ID,
    senderId: "guest:presence-1234",
    senderNickname: "익명이",
    body: "안녕",
    createdAt: CREATED_AT,
    ...overrides,
  };
}

describe("api/v1/community-chat/messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 비로그인 상태에서도 공개 채팅 목록을 반환한다", async () => {
    mockFetchCommunityChatMessagesFromSpring.mockResolvedValue({
      messages: [createMessage()],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      messages: [createMessage()],
    });
  });

  it("POST는 비로그인 게스트 payload로 메시지를 전송한다", async () => {
    mockSendCommunityChatMessageToSpring.mockResolvedValue({
      message: createMessage(),
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/community-chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: "안녕",
          guestSessionId: "presence-1234",
          guestNickname: "익명이",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(mockSendCommunityChatMessageToSpring).toHaveBeenCalledWith({
      userId: null,
      payload: {
        body: "안녕",
        guestSessionId: "presence-1234",
        guestNickname: "익명이",
        senderNickname: "익명이",
      },
    });
    await expect(response.json()).resolves.toEqual({
      message: createMessage(),
    });
  });

  it("POST는 계정 식별자 없이 게스트 익명 표시명만 전달한다", async () => {
    mockSendCommunityChatMessageToSpring.mockResolvedValue({
      message: createMessage(),
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/community-chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: "안녕",
          guestSessionId: "presence-1234",
          guestNickname: "익명이",
          senderNickname: "계정아이디",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(mockSendCommunityChatMessageToSpring).toHaveBeenCalledWith({
      userId: null,
      payload: {
        body: "안녕",
        guestSessionId: "presence-1234",
        guestNickname: "익명이",
        senderNickname: "익명이",
      },
    });
  });

  it("Spring 오류는 chat-service 로그인 문구 대신 중립 조회 오류로 반환한다", async () => {
    mockFetchCommunityChatMessagesFromSpring.mockRejectedValue(
      new CommunityChatSpringBackendHttpError(
        401,
        "chat-service 로그인이 필요합니다."
      )
    );

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "커뮤니티 채팅을 불러오지 못했습니다.",
    });
  });

  it("Spring 전송 오류도 로그인 유도 문구 대신 중립 전송 오류로 반환한다", async () => {
    mockSendCommunityChatMessageToSpring.mockRejectedValue(
      new CommunityChatSpringBackendHttpError(
        401,
        "로그인 후 사용할 수 있습니다."
      )
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/community-chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: "안녕",
          guestSessionId: "presence-1234",
          guestNickname: "익명이",
        }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "커뮤니티 채팅 메시지를 전송하지 못했습니다.",
    });
  });
});
