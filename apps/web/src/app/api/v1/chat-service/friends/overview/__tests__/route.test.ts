import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceFriendsOverviewSpringBackendHttpError } from "@/server/chat-service-friends-overview-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockFetchChatServiceFriendsOverviewFromSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-friends-overview-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-friends-overview-spring-client")>("@/server/chat-service-friends-overview-spring-client");
  return {
    ...actual,
    fetchChatServiceFriendsOverviewFromSpring: (...args: unknown[]) => mockFetchChatServiceFriendsOverviewFromSpring(...args),
  };
});

import { GET } from "../route";

describe("chat-service friends overview route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Spring overview 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceFriendsOverviewFromSpring.mockResolvedValue({
      friends: [],
      pendingSent: [],
      pendingReceived: [],
      suggested: [
        { id: "22222222-2222-4222-8222-222222222222", nickname: "닉네임", ageLabel: "20대", regionLabel: "서울", avatarUrl: null, bio: "소개", points: 10 },
      ],
      blocked: [],
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/friends/overview"));

    expect(mockFetchChatServiceFriendsOverviewFromSpring).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceFriendsOverviewFromSpring.mockRejectedValue(new ChatServiceFriendsOverviewSpringBackendHttpError(403, "권한이 없습니다."));

    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/friends/overview"));
    expect(response.status).toBe(403);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));

    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/friends/overview"));
    expect(response.status).toBe(401);
  });
});
