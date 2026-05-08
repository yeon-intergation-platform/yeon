import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceProfileSpringBackendHttpError } from "@/server/chat-service-profile-spring-client";

const mockRequireChatServiceAuth = vi.fn();
const mockFetchChatServiceProfileFromSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireChatServiceAuth: (...args: unknown[]) =>
    mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-profile-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/chat-service-profile-spring-client")
  >("@/server/chat-service-profile-spring-client");
  return {
    ...actual,
    fetchChatServiceProfileFromSpring: (...args: unknown[]) =>
      mockFetchChatServiceProfileFromSpring(...args),
  };
});

import { GET } from "../route";

describe("chat-service profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비인증이면 shared 에러를 반환한다", async () => {
    const { ServiceError } = await import("@/server/services/service-error");
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222"),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(response.status).toBe(401);
  });

  it("Spring 프로필 응답을 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({
      profile: { id: "11111111-1111-4111-8111-111111111111" },
    });
    mockFetchChatServiceProfileFromSpring.mockResolvedValue({
      profile: {
        id: "22222222-2222-4222-8222-222222222222",
        nickname: "닉네임",
        ageLabel: "20대",
        regionLabel: "서울",
        avatarUrl: null,
        bio: "소개",
        points: 10,
      },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222"),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(mockFetchChatServiceProfileFromSpring).toHaveBeenCalledWith({
      currentProfileId: "11111111-1111-4111-8111-111111111111",
      targetProfileId: "22222222-2222-4222-8222-222222222222",
    });
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({
      profile: { id: "11111111-1111-4111-8111-111111111111" },
    });
    mockFetchChatServiceProfileFromSpring.mockRejectedValue(
      new ChatServiceProfileSpringBackendHttpError(403, "차단 관계에서는 이 작업을 수행할 수 없습니다."),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222"),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "차단 관계에서는 이 작업을 수행할 수 없습니다." });
  });
});
