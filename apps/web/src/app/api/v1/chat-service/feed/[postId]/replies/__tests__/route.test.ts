import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/server/services/service-error";

const mockGetOptionalChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockFetchChatServiceFeedRepliesFromSpring = vi.fn();
const mockCreateChatServiceFeedPostInSpring = vi.fn();
const mockDeleteChatServiceFeedPostInSpring = vi.fn();
const mockResolveChatServiceGuestProfileInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  getOptionalChatServiceAuth: (...args: unknown[]) =>
    mockGetOptionalChatServiceAuth(...args),
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
}));

vi.mock("@/server/chat-service-feed-spring-client", () => ({
  ChatServiceFeedSpringBackendHttpError: class ChatServiceFeedSpringBackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  createChatServiceFeedPostInSpring: (...args: unknown[]) =>
    mockCreateChatServiceFeedPostInSpring(...args),
  deleteChatServiceFeedPostInSpring: (...args: unknown[]) =>
    mockDeleteChatServiceFeedPostInSpring(...args),
  fetchChatServiceFeedRepliesFromSpring: (...args: unknown[]) =>
    mockFetchChatServiceFeedRepliesFromSpring(...args),
}));

vi.mock("@/server/chat-service-auth-spring-client", () => ({
  ChatServiceAuthSpringBackendHttpError: class ChatServiceAuthSpringBackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  resolveChatServiceGuestProfileInSpring: (...args: unknown[]) =>
    mockResolveChatServiceGuestProfileInSpring(...args),
}));

import { DELETE, GET, POST } from "../route";

const profileId = "11111111-1111-4111-8111-111111111111";
const postId = "33333333-3333-4333-8333-333333333333";
const replyId = "44444444-4444-4444-8444-444444444444";
const params = { params: Promise.resolve({ postId }) };

const replyResponse = {
  post: {
    id: replyId,
    body: "답글",
    replyToPostId: postId,
    replyCount: 0,
    author: {
      id: profileId,
      nickname: "닉",
      ageLabel: "20세",
      regionLabel: "서울",
      avatarUrl: null,
      bio: "소개",
      points: 900,
    },
    createdAt: "2026-05-08T10:00:00.000Z",
  },
};

describe("chat-service feed replies route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비로그인도 replies 목록 응답을 반환한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue(null);
    mockFetchChatServiceFeedRepliesFromSpring.mockResolvedValue({
      replies: [],
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies"),
      params
    );

    expect(response.status).toBe(200);
    expect(mockFetchChatServiceFeedRepliesFromSpring).toHaveBeenCalledWith({
      currentProfileId: undefined,
      postId,
    });
  });

  it("invalid body면 400을 반환한다", async () => {
    mockParseJsonBody.mockResolvedValue({ body: "" });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies", {
        method: "POST",
      }),
      params
    );

    expect(response.status).toBe(400);
  });

  it("로그인 profile로 replies를 생성한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue({
      profile: { id: profileId },
    });
    mockParseJsonBody.mockResolvedValue({ body: "답글" });
    mockCreateChatServiceFeedPostInSpring.mockResolvedValue(replyResponse);

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies", {
        method: "POST",
      }),
      params
    );

    expect(response.status).toBe(201);
    expect(mockCreateChatServiceFeedPostInSpring).toHaveBeenCalledWith({
      currentProfileId: profileId,
      body: "답글",
      replyToPostId: postId,
    });
  });

  it("비로그인 닉네임/비밀번호로 reply를 삭제한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue(null);
    mockParseJsonBody.mockResolvedValue({
      replyId,
      guestNickname: "ㅇㅇ",
      guestPassword: "1234",
    });
    mockResolveChatServiceGuestProfileInSpring.mockResolvedValue({
      id: profileId,
    });
    mockDeleteChatServiceFeedPostInSpring.mockResolvedValue({
      deleted: true,
      postId: replyId,
    });

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(200);
    expect(mockDeleteChatServiceFeedPostInSpring).toHaveBeenCalledWith({
      currentProfileId: profileId,
      postId: replyId,
    });
  });

  it("ServiceError를 그대로 반환한다", async () => {
    mockFetchChatServiceFeedRepliesFromSpring.mockRejectedValue(
      new ServiceError(500, "답글 목록을 불러오지 못했습니다.")
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/feed/333/replies"),
      params
    );

    expect(response.status).toBe(500);
  });
});
