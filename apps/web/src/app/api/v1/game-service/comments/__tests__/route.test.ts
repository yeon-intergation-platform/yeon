import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const COMMENT_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  createGameComment: vi.fn(),
  getCurrentAuthUser: vi.fn(),
  isAdminUser: vi.fn(),
  listGameComments: vi.fn(),
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
    createGameComment: (...args: unknown[]) => mocks.createGameComment(...args),
    listGameComments: (...args: unknown[]) => mocks.listGameComments(...args),
  };
});

import { GameCommentRequestError } from "@/server/game-comments-spring-client";
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

function createComment(
  overrides: Partial<ReturnType<typeof baseComment>> = {}
) {
  return { ...baseComment(), ...overrides };
}

function baseComment() {
  return {
    id: COMMENT_ID,
    displayName: "플레이어",
    avatarUrl: null,
    content: "재밌어요",
    isSecret: false,
    isMine: true,
    isGuest: false,
    canRevealWithPassword: false,
    canDelete: true,
    likeCount: 0,
    likedByMe: false,
    createdAt: "2026-06-26T00:00:00.000Z",
  };
}

function createPostRequest(body: string) {
  return new Request("http://localhost/api/v1/game-service/comments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("api/v1/game-service/comments route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAdminUser.mockResolvedValue(false);
    mocks.listGameComments.mockResolvedValue({ items: [createComment()] });
    mocks.createGameComment.mockResolvedValue(createComment());
  });

  it("GET은 잘못된 gameSlug를 400으로 거절하고 Spring을 호출하지 않는다", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/game-service/comments?gameSlug=../x")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "gameSlug가 필요합니다.",
    });
    expect(mocks.listGameComments).not.toHaveBeenCalled();
  });

  it("GET은 비로그인 사용자를 null viewer와 latest 정렬로 조회한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "http://localhost/api/v1/game-service/comments?gameSlug=snake-io"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [createComment()],
    });
    expect(mocks.listGameComments).toHaveBeenCalledWith(
      "snake-io",
      null,
      "latest"
    );
  });

  it("GET은 관리자 판정 실패를 일반 사용자 viewer로 낮춰 조회한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.isAdminUser.mockRejectedValue(new Error("admin check failed"));

    const response = await GET(
      new Request(
        "http://localhost/api/v1/game-service/comments?gameSlug=snake-io&sort=popular"
      )
    );

    expect(response.status).toBe(200);
    expect(mocks.listGameComments).toHaveBeenCalledWith(
      "snake-io",
      {
        id: USER_ID,
        displayName: "플레이어",
        avatarUrl: null,
        isAdmin: false,
      },
      "popular"
    );
  });

  it("POST는 게스트 작성에서 닉네임과 비밀번호가 없으면 400으로 거절한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(
      createPostRequest(
        JSON.stringify({
          gameSlug: "snake-io",
          content: "재밌어요",
          isSecret: false,
        })
      )
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "닉네임과 비밀번호를 입력해 주세요.",
    });
    expect(mocks.createGameComment).not.toHaveBeenCalled();
  });

  it("POST는 게스트 작성 요청을 Spring에 전달하고 201을 반환한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(null);
    const payload = {
      gameSlug: "snake-io",
      content: "재밌어요",
      isSecret: true,
      guestNickname: "손님",
      guestPassword: "secret-password",
    };
    mocks.createGameComment.mockResolvedValue(
      createComment({ isGuest: true, isSecret: true, isMine: true })
    );

    const response = await POST(createPostRequest(JSON.stringify(payload)));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(
      createComment({ isGuest: true, isSecret: true, isMine: true })
    );
    expect(mocks.createGameComment).toHaveBeenCalledWith(payload, null);
  });

  it("POST는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.getCurrentAuthUser.mockResolvedValue(createAuthUser());
    mocks.createGameComment.mockRejectedValue(
      new GameCommentRequestError(429, "댓글 작성이 너무 잦습니다.")
    );

    const response = await POST(
      createPostRequest(
        JSON.stringify({
          gameSlug: "snake-io",
          content: "재밌어요",
          isSecret: false,
        })
      )
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      message: "댓글 작성이 너무 잦습니다.",
    });
  });
});
