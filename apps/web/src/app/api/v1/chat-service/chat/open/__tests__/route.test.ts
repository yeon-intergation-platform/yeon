import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceChatOpenSpringBackendHttpError } from "@/server/chat-service-chat-open-spring-client";
import { ServiceError } from "@/server/services/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockOpenChatServiceRoomInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-chat-open-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-chat-open-spring-client")>("@/server/chat-service-chat-open-spring-client");
  return {
    ...actual,
    openChatServiceRoomInSpring: (...args: unknown[]) => mockOpenChatServiceRoomInSpring(...args),
  };
});

import { POST } from "../route";

describe("chat-service chat open route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetProfileId: "not-uuid" });

    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/open", { method: "POST" }));
    expect(response.status).toBe(400);
  });

  it("Spring 대화방 오픈 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetProfileId: "22222222-2222-4222-8222-222222222222" });
    mockOpenChatServiceRoomInSpring.mockResolvedValue({
      room: {
        id: "33333333-3333-4333-8333-333333333333",
        peer: {
          id: "22222222-2222-4222-8222-222222222222",
          nickname: "상대",
          ageLabel: "20세",
          regionLabel: "서울",
          avatarUrl: null,
          bio: "소개",
          points: 900,
        },
        lastMessagePreview: null,
        lastMessageAt: null,
        unreadCount: 0,
        unlockedByPayment: true,
      },
    });

    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/open", { method: "POST" }));

    expect(mockOpenChatServiceRoomInSpring).toHaveBeenCalledWith({
      currentProfileId: "11111111-1111-4111-8111-111111111111",
      targetProfileId: "22222222-2222-4222-8222-222222222222",
    });
    expect(response.status).toBe(201);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetProfileId: "22222222-2222-4222-8222-222222222222" });
    mockOpenChatServiceRoomInSpring.mockRejectedValue(
      new ChatServiceChatOpenSpringBackendHttpError(400, "포인트가 부족합니다."),
    );

    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/open", { method: "POST" }));
    expect(response.status).toBe(400);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));

    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/chat/open", { method: "POST" }));
    expect(response.status).toBe(401);
  });
});
