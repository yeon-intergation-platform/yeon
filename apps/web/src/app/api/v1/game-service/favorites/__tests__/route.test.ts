import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";

const mocks = vi.hoisted(() => ({
  getCurrentAuthUser: vi.fn(),
  listFavorites: vi.fn(),
  toggleFavorite: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: (...args: unknown[]) => mocks.getCurrentAuthUser(...args),
}));

vi.mock("@/server/game-library-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/game-library-spring-client")
  >("@/server/game-library-spring-client");
  return {
    ...actual,
    listFavorites: (...args: unknown[]) => mocks.listFavorites(...args),
    toggleFavorite: (...args: unknown[]) => mocks.toggleFavorite(...args),
  };
});

import { GameLibraryRequestError } from "@/server/game-library-spring-client";
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
  return new Request("http://localhost/api/v1/game-service/favorites", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("api/v1/game-service/favorites route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listFavorites.mockResolvedValue(["snake-io"]);
    mocks.toggleFavorite.mockResolvedValue(true);
  });

  it("GET은 비로그인 사용자를 빈 목록으로 처리하고 Spring을 호출하지 않는다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ slugs: [] });
    expect(mocks.listFavorites).not.toHaveBeenCalled();
  });

  it("GET은 Spring 조회 실패를 빈 목록으로 degrade한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.listFavorites.mockRejectedValue(new Error("spring down"));

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ slugs: [] });
    expect(consoleError).toHaveBeenCalledWith(
      "찜 목록 조회 실패",
      expect.any(Error)
    );
    consoleError.mockRestore();
  });

  it("POST는 비로그인 사용자를 401로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "찜은 로그인 후 이용할 수 있습니다.",
    });
    expect(mocks.toggleFavorite).not.toHaveBeenCalled();
  });

  it("POST는 인증 사용자의 찜 토글 결과를 반환한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ favorited: true });
    expect(mocks.toggleFavorite).toHaveBeenCalledWith(USER_ID, "snake-io");
  });

  it("POST는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.toggleFavorite.mockRejectedValue(
      new GameLibraryRequestError(409, "이미 처리된 찜입니다.")
    );

    const response = await POST(
      createPostRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "이미 처리된 찜입니다.",
    });
  });
});
