import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const COMMENT_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  getCurrentAuthUser: vi.fn(),
  isAdminUser: vi.fn(),
  toggleCommentLike: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: (...args: unknown[]) => mocks.getCurrentAuthUser(...args),
}));

vi.mock("@/server/auth/admin", () => ({
  isAdminUser: (...args: unknown[]) => mocks.isAdminUser(...args),
}));

vi.mock("@/server/game-comments-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/game-comments-spring-client")
  >("@/server/game-comments-spring-client");
  return {
    ...actual,
    toggleCommentLike: (...args: unknown[]) => mocks.toggleCommentLike(...args),
  };
});

import { GameCommentRequestError } from "@/server/game-comments-spring-client";
import { POST } from "../route";

function createAuthUser() {
  return {
    id: USER_ID,
    email: "player@yeon.world",
    displayName: "플레이어",
    avatarUrl: null,
    lastLoginAt: "2026-06-26T00:00:00.000Z",
    providers: ["google"],
  };
}

function createContext(id = COMMENT_ID) {
  return { params: Promise.resolve({ id }) };
}

describe("api/v1/game-service/comments/[id]/like route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAdminUser.mockResolvedValue(false);
    mocks.toggleCommentLike.mockResolvedValue({
      likeCount: 2,
      likedByMe: true,
    });
  });

  it("POST는 잘못된 comment id를 400으로 거절하고 Spring을 호출하지 않는다", async () => {
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: "bad-id" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "잘못된 요청입니다.",
    });
    expect(mocks.toggleCommentLike).not.toHaveBeenCalled();
  });

  it("POST는 비로그인 사용자를 401로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost"),
      createContext()
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "좋아요는 로그인 후 이용할 수 있습니다.",
    });
    expect(mocks.toggleCommentLike).not.toHaveBeenCalled();
  });

  it("POST는 관리자 판정 실패를 일반 사용자 viewer로 낮춰 좋아요를 처리한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.isAdminUser.mockRejectedValue(new Error("admin check failed"));

    const response = await POST(
      new Request("http://localhost"),
      createContext()
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      likeCount: 2,
      likedByMe: true,
    });
    expect(mocks.toggleCommentLike).toHaveBeenCalledWith(COMMENT_ID, {
      id: USER_ID,
      displayName: "플레이어",
      avatarUrl: null,
      isAdmin: false,
    });
  });

  it("POST는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.toggleCommentLike.mockRejectedValue(
      new GameCommentRequestError(404, "댓글을 찾을 수 없습니다.")
    );

    const response = await POST(
      new Request("http://localhost"),
      createContext()
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "댓글을 찾을 수 없습니다.",
    });
  });
});
