import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/server/services/service-error";

const mockGetOptionalChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockFetchChatServiceFeedPostFromSpring = vi.fn();
const mockUpdateChatServiceFeedPostInSpring = vi.fn();
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
  deleteChatServiceFeedPostInSpring: (...args: unknown[]) =>
    mockDeleteChatServiceFeedPostInSpring(...args),
  fetchChatServiceFeedPostFromSpring: (...args: unknown[]) =>
    mockFetchChatServiceFeedPostFromSpring(...args),
  updateChatServiceFeedPostInSpring: (...args: unknown[]) =>
    mockUpdateChatServiceFeedPostInSpring(...args),
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

import { DELETE, GET, PATCH } from "../route";

const profileId = "11111111-1111-4111-8111-111111111111";
const postId = "33333333-3333-4333-8333-333333333333";
const params = { params: Promise.resolve({ postId }) };

const postResponse = {
  post: {
    id: postId,
    body: "수정 본문",
    replyToPostId: null,
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

describe("chat-service feed post route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("feed 글 상세를 Spring에서 조회한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue({
      profile: { id: profileId },
    });
    mockFetchChatServiceFeedPostFromSpring.mockResolvedValue(postResponse);

    const response = await GET(
      new NextRequest(`http://localhost/api/v1/chat-service/feed/${postId}`, {
        method: "GET",
      }),
      params
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(postResponse);
    expect(mockFetchChatServiceFeedPostFromSpring).toHaveBeenCalledWith({
      currentProfileId: profileId,
      postId,
    });
  });

  it("로그인 profile로 feed 글을 수정한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue({
      profile: { id: profileId },
    });
    mockParseJsonBody.mockResolvedValue({ body: "수정 본문" });
    mockUpdateChatServiceFeedPostInSpring.mockResolvedValue(postResponse);

    const response = await PATCH(
      new NextRequest(`http://localhost/api/v1/chat-service/feed/${postId}`, {
        method: "PATCH",
      }),
      params
    );

    expect(response.status).toBe(200);
    expect(mockUpdateChatServiceFeedPostInSpring).toHaveBeenCalledWith({
      currentProfileId: profileId,
      postId,
      body: "수정 본문",
    });
  });

  it("비로그인 닉네임/비밀번호로 feed 글을 삭제한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue(null);
    mockParseJsonBody.mockResolvedValue({
      guestNickname: "ㅇㅇ",
      guestPassword: "1234",
    });
    mockResolveChatServiceGuestProfileInSpring.mockResolvedValue({
      id: profileId,
    });
    mockDeleteChatServiceFeedPostInSpring.mockResolvedValue({
      deleted: true,
      postId,
    });

    const response = await DELETE(
      new NextRequest(`http://localhost/api/v1/chat-service/feed/${postId}`, {
        method: "DELETE",
      }),
      params
    );

    expect(response.status).toBe(200);
    expect(mockDeleteChatServiceFeedPostInSpring).toHaveBeenCalledWith({
      currentProfileId: profileId,
      postId,
    });
  });

  it("ServiceError를 그대로 반환한다", async () => {
    mockParseJsonBody.mockResolvedValue({ body: "수정 본문" });
    mockGetOptionalChatServiceAuth.mockResolvedValue({
      profile: { id: profileId },
    });
    mockUpdateChatServiceFeedPostInSpring.mockRejectedValue(
      new ServiceError(403, "수정 권한이 없습니다.")
    );

    const response = await PATCH(
      new NextRequest(`http://localhost/api/v1/chat-service/feed/${postId}`, {
        method: "PATCH",
      }),
      params
    );

    expect(response.status).toBe(403);
  });
});
