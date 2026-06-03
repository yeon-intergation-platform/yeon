import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatServiceFriendRequestSpringBackendHttpError } from "@/server/chat-service-friend-request-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockSendChatServiceFriendRequestInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) =>
    mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-friend-request-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/chat-service-friend-request-spring-client")
  >("@/server/chat-service-friend-request-spring-client");
  return {
    ...actual,
    sendChatServiceFriendRequestInSpring: (...args: unknown[]) =>
      mockSendChatServiceFriendRequestInSpring(...args),
  };
});
import { POST } from "../route";

describe("chat-service friend request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({
      profile: { id: "11111111-1111-4111-8111-111111111111" },
    });
    mockParseJsonBody.mockResolvedValue({ targetProfileId: "not-uuid" });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/friends/requests", {
        method: "POST",
      })
    );
    expect(response.status).toBe(400);
  });

  it("Spring 친구요청 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({
      profile: { id: "11111111-1111-4111-8111-111111111111" },
    });
    mockParseJsonBody.mockResolvedValue({
      targetProfileId: "22222222-2222-4222-8222-222222222222",
    });
    mockSendChatServiceFriendRequestInSpring.mockResolvedValue({ ok: true });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/friends/requests", {
        method: "POST",
      })
    );

    expect(mockSendChatServiceFriendRequestInSpring).toHaveBeenCalledWith({
      currentProfileId: "11111111-1111-4111-8111-111111111111",
      targetProfileId: "22222222-2222-4222-8222-222222222222",
    });
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({
      profile: { id: "11111111-1111-4111-8111-111111111111" },
    });
    mockParseJsonBody.mockResolvedValue({
      targetProfileId: "22222222-2222-4222-8222-222222222222",
    });
    mockSendChatServiceFriendRequestInSpring.mockRejectedValue(
      new ChatServiceFriendRequestSpringBackendHttpError(
        404,
        "친구 요청 대상 프로필을 찾지 못했습니다."
      )
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/friends/requests", {
        method: "POST",
      })
    );
    expect(response.status).toBe(404);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(
      new ServiceError(401, "chat-service 로그인이 필요합니다.")
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/friends/requests", {
        method: "POST",
      })
    );
    expect(response.status).toBe(401);
  });
});
