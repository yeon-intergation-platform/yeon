import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceChatRoomsSpringBackendHttpError } from "@/server/chat-service-chat-rooms-spring-client";
import { ServiceError } from "@/server/services/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockFetchChatServiceRoomsFromSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-chat-rooms-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-chat-rooms-spring-client")>("@/server/chat-service-chat-rooms-spring-client");
  return { ...actual, fetchChatServiceRoomsFromSpring: (...args: unknown[]) => mockFetchChatServiceRoomsFromSpring(...args) };
});

import { GET } from "../route";

describe("chat-service chat rooms route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring 목록 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceRoomsFromSpring.mockResolvedValue({ rooms: [] });
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms"));
    expect(mockFetchChatServiceRoomsFromSpring).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceRoomsFromSpring.mockRejectedValue(new ChatServiceChatRoomsSpringBackendHttpError(500, "대화방 목록을 불러오지 못했습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms"));
    expect(response.status).toBe(500);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/chat/rooms"));
    expect(response.status).toBe(401);
  });
});
