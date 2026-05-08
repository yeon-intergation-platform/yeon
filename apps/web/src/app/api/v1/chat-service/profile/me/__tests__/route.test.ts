import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceMyProfileSpringBackendHttpError } from "@/server/chat-service-my-profile-spring-client";
import { ServiceError } from "@/server/services/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockClearChatServiceSessionCookie = vi.fn();
const mockFetchMyChatServiceProfileFromSpring = vi.fn();
const mockUpdateMyChatServiceProfileInSpring = vi.fn();
const mockDeleteMyChatServiceProfileInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  clearChatServiceSessionCookie: (...args: unknown[]) => mockClearChatServiceSessionCookie(...args),
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-my-profile-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-my-profile-spring-client")>("@/server/chat-service-my-profile-spring-client");
  return {
    ...actual,
    fetchMyChatServiceProfileFromSpring: (...args: unknown[]) => mockFetchMyChatServiceProfileFromSpring(...args),
    updateMyChatServiceProfileInSpring: (...args: unknown[]) => mockUpdateMyChatServiceProfileInSpring(...args),
    deleteMyChatServiceProfileInSpring: (...args: unknown[]) => mockDeleteMyChatServiceProfileInSpring(...args),
  };
});

import { DELETE, GET, PATCH } from "../route";

describe("chat-service my profile route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring 프로필 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchMyChatServiceProfileFromSpring.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111", phoneNumberMasked: "010-12**-7890", nickname: "닉", ageLabel: "20세", regionLabel: "서울", avatarUrl: null, bio: "소개", points: 900, notificationsEnabled: true }, blockedProfiles: [], reports: [] });
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/profile/me"));
    expect(response.status).toBe(200);
  });

  it("PATCH invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ nickname: "", ageLabel: "20세", regionLabel: "서울", bio: "", notificationsEnabled: true });
    const response = await PATCH(new NextRequest("http://localhost/api/v1/chat-service/profile/me", { method: "PATCH" }));
    expect(response.status).toBe(400);
  });

  it("Spring 프로필 수정 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ nickname: "닉2", ageLabel: "21세", regionLabel: "부산", bio: "소개2", notificationsEnabled: true });
    mockUpdateMyChatServiceProfileInSpring.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111", phoneNumberMasked: "010-12**-7890", nickname: "닉2", ageLabel: "21세", regionLabel: "부산", avatarUrl: null, bio: "소개2", points: 900, notificationsEnabled: true } });
    const response = await PATCH(new NextRequest("http://localhost/api/v1/chat-service/profile/me", { method: "PATCH" }));
    expect(response.status).toBe(200);
  });

  it("DELETE에서 cookie clear를 수행한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockDeleteMyChatServiceProfileInSpring.mockResolvedValue({ deleted: true });
    const response = await DELETE(new NextRequest("http://localhost/api/v1/chat-service/profile/me", { method: "DELETE" }));
    expect(response.status).toBe(200);
    expect(mockClearChatServiceSessionCookie).toHaveBeenCalled();
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchMyChatServiceProfileFromSpring.mockRejectedValue(new ChatServiceMyProfileSpringBackendHttpError(404, "프로필을 찾지 못했습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/profile/me"));
    expect(response.status).toBe(404);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/profile/me"));
    expect(response.status).toBe(401);
  });
});
