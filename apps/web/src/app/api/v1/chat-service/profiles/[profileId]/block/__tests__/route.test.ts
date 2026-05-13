import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceBlockSpringBackendHttpError } from "@/server/chat-service-block-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockBlockChatServiceProfileInSpring = vi.fn();
const mockUnblockChatServiceProfileInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-block-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-block-spring-client")>("@/server/chat-service-block-spring-client");
  return {
    ...actual,
    blockChatServiceProfileInSpring: (...args: unknown[]) => mockBlockChatServiceProfileInSpring(...args),
    unblockChatServiceProfileInSpring: (...args: unknown[]) => mockUnblockChatServiceProfileInSpring(...args),
  };
});

import { DELETE, POST } from "../route";

describe("chat-service profile block route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST는 Spring 차단 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockBlockChatServiceProfileInSpring.mockResolvedValue({ blockedProfiles: [] });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222/block", { method: "POST" }),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(mockBlockChatServiceProfileInSpring).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(response.status).toBe(200);
  });

  it("DELETE는 Spring 차단해제 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockUnblockChatServiceProfileInSpring.mockResolvedValue({ blockedProfiles: [] });

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222/block", { method: "DELETE" }),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(mockUnblockChatServiceProfileInSpring).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(response.status).toBe(200);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockBlockChatServiceProfileInSpring.mockRejectedValue(
      new ChatServiceBlockSpringBackendHttpError(404, "차단 대상 프로필을 찾지 못했습니다."),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222/block", { method: "POST" }),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(response.status).toBe(404);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/profiles/22222222-2222-4222-8222-222222222222/block", { method: "POST" }),
      { params: Promise.resolve({ profileId: "22222222-2222-4222-8222-222222222222" }) },
    );

    expect(response.status).toBe(401);
  });
});
