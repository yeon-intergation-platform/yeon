import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";

const mocks = vi.hoisted(() => ({
  getCurrentAuthUser: vi.fn(),
  getLikeStatus: vi.fn(),
  toggleLike: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: (...args: unknown[]) => mocks.getCurrentAuthUser(...args),
}));

vi.mock("@/server/game-likes-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/game-likes-spring-client")
  >("@/server/game-likes-spring-client");
  return {
    ...actual,
    getLikeStatus: (...args: unknown[]) => mocks.getLikeStatus(...args),
    toggleLike: (...args: unknown[]) => mocks.toggleLike(...args),
  };
});

import { GameLikeRequestError } from "@/server/game-likes-spring-client";
import { GET, POST } from "../route";

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

function createPostRequest(body: string) {
  return new Request("http://localhost/api/v1/game-service/likes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("api/v1/game-service/likes route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLikeStatus.mockResolvedValue({ likeCount: 3, likedByMe: false });
    mocks.toggleLike.mockResolvedValue({ likeCount: 4, likedByMe: true });
  });

  it("GET은 잘못된 gameSlug를 400으로 거절하고 Spring을 호출하지 않는다", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/game-service/likes?gameSlug=../x")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "gameSlug가 필요합니다.",
    });
    expect(mocks.getLikeStatus).not.toHaveBeenCalled();
  });

  it("GET은 비로그인 사용자를 null userId로 조회한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "http://localhost/api/v1/game-service/likes?gameSlug=snake-io"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      likeCount: 3,
      likedByMe: false,
    });
    expect(mocks.getLikeStatus).toHaveBeenCalledWith("snake-io", null);
  });

  it("POST는 비로그인 사용자를 401로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "좋아요는 로그인 후 이용할 수 있습니다.",
    });
    expect(mocks.toggleLike).not.toHaveBeenCalled();
  });

  it("POST는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.toggleLike.mockRejectedValue(
      new GameLikeRequestError(409, "이미 처리된 좋아요입니다.")
    );

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "이미 처리된 좋아요입니다.",
    });
  });

  it("POST는 알 수 없는 실패를 502로 감싼다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.toggleLike.mockRejectedValue(new Error("network failed"));

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "좋아요를 처리하지 못했습니다.",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "좋아요 토글 실패",
      expect.any(Error)
    );
    consoleError.mockRestore();
  });
});
