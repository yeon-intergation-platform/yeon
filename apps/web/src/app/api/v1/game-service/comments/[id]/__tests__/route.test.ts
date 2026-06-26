import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const COMMENT_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  deleteGameComment: vi.fn(),
  getCurrentAuthUser: vi.fn(),
  isAdminUser: vi.fn(),
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
    deleteGameComment: (...args: unknown[]) => mocks.deleteGameComment(...args),
  };
});

import { GameCommentRequestError } from "@/server/game-comments-spring-client";
import { DELETE } from "../route";

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

describe("api/v1/game-service/comments/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteGameComment.mockResolvedValue(true);
    mocks.isAdminUser.mockResolvedValue(false);
  });

  it("DELETE는 잘못된 comment id를 400으로 거절하고 Spring을 호출하지 않는다", async () => {
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "bad-id" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "잘못된 요청입니다.",
    });
    expect(mocks.deleteGameComment).not.toHaveBeenCalled();
  });

  it("DELETE는 게스트 비밀번호 삭제 요청을 null viewer로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await DELETE(
      new Request("http://localhost?password=secret-password"),
      createContext()
    );

    expect(response.status).toBe(204);
    expect(mocks.deleteGameComment).toHaveBeenCalledWith(
      COMMENT_ID,
      null,
      "secret-password"
    );
  });

  it("DELETE는 로그인 사용자 삭제 요청에서 관리자 판정 실패를 일반 사용자로 낮춘다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.isAdminUser.mockRejectedValue(new Error("admin check failed"));

    const response = await DELETE(
      new Request("http://localhost"),
      createContext()
    );

    expect(response.status).toBe(204);
    expect(mocks.deleteGameComment).toHaveBeenCalledWith(
      COMMENT_ID,
      {
        id: USER_ID,
        displayName: "플레이어",
        avatarUrl: null,
        isAdmin: false,
      },
      null
    );
  });

  it("DELETE는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.deleteGameComment.mockRejectedValue(
      new GameCommentRequestError(403, "삭제 권한이 없습니다.")
    );

    const response = await DELETE(
      new Request("http://localhost"),
      createContext()
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "삭제 권한이 없습니다.",
    });
  });
});
