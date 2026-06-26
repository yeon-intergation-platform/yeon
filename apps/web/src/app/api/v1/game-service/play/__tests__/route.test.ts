import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";

const mocks = vi.hoisted(() => ({
  awardGamePlayExperience: vi.fn(),
  getCurrentAuthUser: vi.fn(),
  recordPlay: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: (...args: unknown[]) => mocks.getCurrentAuthUser(...args),
}));

vi.mock("@/server/game-experience-spring-client", () => ({
  awardGamePlayExperience: (...args: unknown[]) =>
    mocks.awardGamePlayExperience(...args),
}));

vi.mock("@/server/game-library-spring-client", () => ({
  recordPlay: (...args: unknown[]) => mocks.recordPlay(...args),
}));

import { POST } from "../route";

function createRequest(body: string) {
  return new Request("http://localhost/api/v1/game-service/play", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

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

describe("api/v1/game-service/play route", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.awardGamePlayExperience.mockResolvedValue(true);
    mocks.recordPlay.mockResolvedValue(undefined);
  });

  it("POST는 비로그인 사용자를 204로 무시하고 Spring을 호출하지 않는다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(createRequest("{"));

    expect(response.status).toBe(204);
    expect(mocks.awardGamePlayExperience).not.toHaveBeenCalled();
    expect(mocks.recordPlay).not.toHaveBeenCalled();
  });

  it("POST는 인증 사용자의 잘못된 JSON을 400으로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());

    const response = await POST(createRequest("{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "잘못된 요청입니다.",
    });
    expect(mocks.awardGamePlayExperience).not.toHaveBeenCalled();
    expect(mocks.recordPlay).not.toHaveBeenCalled();
  });

  it("POST는 잘못된 gameSlug를 400으로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());

    const response = await POST(
      createRequest(JSON.stringify({ gameSlug: "../snake" }))
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "gameSlug가 필요합니다.",
    });
    expect(mocks.awardGamePlayExperience).not.toHaveBeenCalled();
    expect(mocks.recordPlay).not.toHaveBeenCalled();
  });

  it("POST는 인증 사용자 플레이 경험치와 최근 플레이를 기록한다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-26T12:34:56.000Z"));
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());

    const response = await POST(
      createRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(204);
    expect(mocks.awardGamePlayExperience).toHaveBeenCalledWith(
      USER_ID,
      "snake-io",
      "2026-06-26"
    );
    expect(mocks.recordPlay).toHaveBeenCalledWith(USER_ID, "snake-io");
  });

  it("POST는 Spring 기록 실패가 있어도 플레이 응답을 막지 않는다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.awardGamePlayExperience.mockRejectedValue(new Error("xp failed"));
    mocks.recordPlay.mockRejectedValue(new Error("recent failed"));

    const response = await POST(
      createRequest(JSON.stringify({ gameSlug: "snake-io" }))
    );

    expect(response.status).toBe(204);
    expect(consoleError).toHaveBeenCalledWith(
      "게임 경험치 적립 실패",
      expect.any(Error)
    );
    expect(consoleError).toHaveBeenCalledWith(
      "최근 플레이 기록 실패",
      expect.any(Error)
    );
    consoleError.mockRestore();
  });
});
