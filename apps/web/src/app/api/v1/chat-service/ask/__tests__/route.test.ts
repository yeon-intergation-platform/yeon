import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceAskSpringBackendHttpError } from "@/server/chat-service-ask-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockFetchChatServiceAskPostsFromSpring = vi.fn();
const mockCreateChatServiceAskPostInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));
vi.mock("@/server/chat-service-ask-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-ask-spring-client")>("@/server/chat-service-ask-spring-client");
  return {
    ...actual,
    fetchChatServiceAskPostsFromSpring: (...args: unknown[]) => mockFetchChatServiceAskPostsFromSpring(...args),
    createChatServiceAskPostInSpring: (...args: unknown[]) => mockCreateChatServiceAskPostInSpring(...args),
  };
});

import { GET, POST } from "../route";

describe("chat-service ask route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring ask 목록 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceAskPostsFromSpring.mockResolvedValue({ posts: [] });
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/ask"));
    expect(response.status).toBe(200);
  });

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ question: "", kind: "question" });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/ask", { method: "POST" }));
    expect(response.status).toBe(400);
  });

  it("Spring ask 생성 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ question: "질문", kind: "question" });
    mockCreateChatServiceAskPostInSpring.mockResolvedValue({ post: { id: "33333333-3333-4333-8333-333333333333", question: "질문", kind: "question", options: [], totalVotes: 0, userVoteIndex: null, author: { id: "11111111-1111-4111-8111-111111111111", nickname: "닉", ageLabel: "20세", regionLabel: "서울", avatarUrl: null, bio: "소개", points: 900 }, createdAt: "2026-05-08T10:00:00.000Z" } });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/ask", { method: "POST" }));
    expect(response.status).toBe(201);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockFetchChatServiceAskPostsFromSpring.mockRejectedValue(new ChatServiceAskSpringBackendHttpError(500, "에스크 목록을 불러오지 못했습니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/ask"));
    expect(response.status).toBe(500);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await GET(new NextRequest("http://localhost/api/v1/chat-service/ask"));
    expect(response.status).toBe(401);
  });
});
