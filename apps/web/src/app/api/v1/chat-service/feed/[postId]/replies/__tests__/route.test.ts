import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceFeedSpringBackendHttpError } from "@/server/chat-service-feed-spring-client";
import { ServiceError } from "@/server/services/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockFetchChatServiceFeedRepliesFromSpring = vi.fn();
const mockCreateChatServiceFeedPostInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-feed-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-feed-spring-client")>("@/server/chat-service-feed-spring-client");
  return {
    ...actual,
    fetchChatServiceFeedRepliesFromSpring: (...args: unknown[]) => mockFetchChatServiceFeedRepliesFromSpring(...args),
    createChatServiceFeedPostInSpring: (...args: unknown[]) => mockCreateChatServiceFeedPostInSpring(...args),
  };
});

import { GET, POST } from "../route";

describe("chat-service feed replies route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring replies 목록 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceFeedRepliesFromSpring.mockResolvedValue({ replies: [] });
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies"), { params: Promise.resolve({ postId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(200);
  });

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ body: "" });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies", { method: "POST" }), { params: Promise.resolve({ postId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(400);
  });

  it("Spring replies 생성 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ body: "답글" });
    mockCreateChatServiceFeedPostInSpring.mockResolvedValue({ post: { id: "44444444-4444-4444-8444-444444444444", body: "답글", replyToPostId: "33333333-3333-4333-8333-333333333333", replyCount: 0, author: { id: "11111111-1111-4111-8111-111111111111", nickname: "닉", ageLabel: "20세", regionLabel: "서울", avatarUrl: null, bio: "소개", points: 900 }, createdAt: "2026-05-08T10:00:00.000Z" } });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies", { method: "POST" }), { params: Promise.resolve({ postId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(201);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceFeedRepliesFromSpring.mockRejectedValue(new ChatServiceFeedSpringBackendHttpError(500, "답글 목록을 불러오지 못했습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies"), { params: Promise.resolve({ postId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(500);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies"), { params: Promise.resolve({ postId: "33333333-3333-4333-8333-333333333333" }) });
    expect(response.status).toBe(401);
  });
});
