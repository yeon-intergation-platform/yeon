import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceChatRoomsSpringBackendHttpError } from "@/server/chat-service-chat-rooms-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockSendChatServiceMessageInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-chat-rooms-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-chat-rooms-spring-client")>("@/server/chat-service-chat-rooms-spring-client");
  return { ...actual, sendChatServiceMessageInSpring: (...args: unknown[]) => mockSendChatServiceMessageInSpring(...args) };
});

import { POST } from "../route";

describe("chat-service send message route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ body: "" });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333/messages", { method: "POST" }), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(400);
  });

  it("Spring 메시지 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ body: "안녕" });
    mockSendChatServiceMessageInSpring.mockResolvedValue({ message: { id: "44444444-4444-4444-8444-444444444444", roomId: "33333333-3333-4333-8333-333333333333", senderId: "11111111-1111-4111-8111-111111111111", body: "안녕", createdAt: "2026-05-08T10:00:00.000Z" } });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333/messages", { method: "POST" }), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(201);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ body: "안녕" });
    mockSendChatServiceMessageInSpring.mockRejectedValue(new ChatServiceChatRoomsSpringBackendHttpError(403, "차단 관계에서는 메시지를 보낼 수 없습니다."));
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333/messages", { method: "POST" }), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(403);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333/messages", { method: "POST" }), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(401);
  });
});
