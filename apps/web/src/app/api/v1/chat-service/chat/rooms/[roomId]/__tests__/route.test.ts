import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceChatRoomsSpringBackendHttpError } from "@/server/chat-service-chat-rooms-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockFetchChatServiceRoomFromSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-chat-rooms-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-chat-rooms-spring-client")>("@/server/chat-service-chat-rooms-spring-client");
  return { ...actual, fetchChatServiceRoomFromSpring: (...args: unknown[]) => mockFetchChatServiceRoomFromSpring(...args) };
});

import { GET } from "../route";

describe("chat-service chat room detail route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring 상세 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceRoomFromSpring.mockResolvedValue({
      room: {
        id: "33333333-3333-4333-8333-333333333333",
        peer: { id: "22222222-2222-4222-8222-222222222222", nickname: "상대", ageLabel: "20세", regionLabel: "서울", avatarUrl: null, bio: "소개", points: 900 },
        lastMessagePreview: "안녕",
        lastMessageAt: "2026-05-08T10:00:00.000Z",
        unreadCount: 0,
        unlockedByPayment: true,
      },
      messages: [],
    });
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333"), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceRoomFromSpring.mockRejectedValue(new ChatServiceChatRoomsSpringBackendHttpError(403, "차단 관계에서는 이 작업을 수행할 수 없습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333"), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(403);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms/333"), { params: Promise.resolve({ roomId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(401);
  });
});
