import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/server/services/service-error";

const mockGetOptionalChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockListChatServiceFeed = vi.fn();
const mockCreateChatServiceFeedPost = vi.fn();
const mockGetOrCreateChatServiceGuestProfile = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  getOptionalChatServiceAuth: (...args: unknown[]) =>
    mockGetOptionalChatServiceAuth(...args),
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
}));

vi.mock("@/server/services/chat-service/feed-service", () => ({
  createChatServiceFeedPost: (...args: unknown[]) =>
    mockCreateChatServiceFeedPost(...args),
  listChatServiceFeed: (...args: unknown[]) => mockListChatServiceFeed(...args),
}));

vi.mock("@/server/services/chat-service/common", () => ({
  getOrCreateChatServiceGuestProfile: (...args: unknown[]) =>
    mockGetOrCreateChatServiceGuestProfile(...args),
}));

import { GET, POST } from "../route";

const profileId = "11111111-1111-4111-8111-111111111111";
const postResponse = {
  post: {
    id: "33333333-3333-4333-8333-333333333333",
    body: "본문",
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

describe("chat-service feed route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비로그인도 feed 목록 응답을 반환한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue(null);
    mockListChatServiceFeed.mockResolvedValue({ posts: [] });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/feed")
    );

    expect(response.status).toBe(200);
    expect(mockListChatServiceFeed).toHaveBeenCalledWith(undefined);
  });

  it("invalid body면 400을 반환한다", async () => {
    mockParseJsonBody.mockResolvedValue({ body: "" });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/feed", {
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });

  it("로그인 profile로 feed 글을 생성한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue({
      profile: { id: profileId },
    });
    mockParseJsonBody.mockResolvedValue({ body: "본문" });
    mockCreateChatServiceFeedPost.mockResolvedValue(postResponse);

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/feed", {
        method: "POST",
      })
    );

    expect(response.status).toBe(201);
    expect(mockCreateChatServiceFeedPost).toHaveBeenCalledWith(
      profileId,
      "본문"
    );
  });

  it("비로그인은 닉네임/비밀번호 profile로 feed 글을 생성한다", async () => {
    mockGetOptionalChatServiceAuth.mockResolvedValue(null);
    mockParseJsonBody.mockResolvedValue({
      body: "본문",
      guestNickname: "ㅇㅇ",
      guestPassword: "1234",
    });
    mockGetOrCreateChatServiceGuestProfile.mockResolvedValue({ id: profileId });
    mockCreateChatServiceFeedPost.mockResolvedValue(postResponse);

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/feed", {
        method: "POST",
      })
    );

    expect(response.status).toBe(201);
    expect(mockGetOrCreateChatServiceGuestProfile).toHaveBeenCalledWith({
      guestNickname: "ㅇㅇ",
      guestPassword: "1234",
    });
  });

  it("ServiceError를 그대로 반환한다", async () => {
    mockListChatServiceFeed.mockRejectedValue(
      new ServiceError(500, "피드를 불러오지 못했습니다.")
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/feed")
    );

    expect(response.status).toBe(500);
  });
});
