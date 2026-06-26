import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGameComment,
  deleteGameComment,
  GameCommentRequestError,
  listGameComments,
  revealGameComment,
  type CommentViewer,
} from "../game-comments-spring-client";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const COMMENT_ID = "11111111-1111-4111-8111-111111111111";

const VIEWER: CommentViewer = {
  id: USER_ID,
  displayName: "플레이어",
  avatarUrl: "https://cdn.yeon.world/avatar.png",
  isAdmin: true,
};

describe("game-comments-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("댓글 목록 조회는 viewer 정체성과 정렬을 Spring BFF로 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        items: [createComment()],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listGameComments("snake-io", VIEWER, "popular")
    ).resolves.toEqual({ items: [createComment()] });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://spring.test/game-service/comments?gameSlug=snake-io&sort=popular",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("X-Yeon-User-Id")).toBe(USER_ID);
    expect(headers.get("X-Yeon-User-Name")).toBe(
      encodeURIComponent("플레이어")
    );
    expect(headers.get("X-Yeon-User-Avatar")).toBe(
      encodeURIComponent("https://cdn.yeon.world/avatar.png")
    );
    expect(headers.get("X-Yeon-User-Role")).toBe("admin");
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("댓글 작성은 payload를 그대로 JSON 본문으로 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(createComment(), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const payload = {
      gameSlug: "snake-io",
      content: "재밌어요",
      isSecret: true,
      guestNickname: "손님",
      guestPassword: "secret-password",
    };

    await expect(createGameComment(payload, null)).resolves.toEqual(
      createComment()
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://spring.test/game-service/comments",
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("X-Yeon-User-Id")).toBeNull();
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it("비밀댓글 확인은 password 본문을 보내고 content만 반환한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        content: "비밀 내용",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      revealGameComment(COMMENT_ID, "secret-password")
    ).resolves.toBe("비밀 내용");

    expect(fetchMock).toHaveBeenCalledWith(
      `http://spring.test/game-service/comments/${COMMENT_ID}/reveal`,
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({
      password: "secret-password",
    });
  });

  it("댓글 삭제 실패는 Spring message와 status를 보존한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        { message: "삭제 권한이 없습니다." },
        {
          status: 403,
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteGameComment(COMMENT_ID, VIEWER, "secret-password")
    ).rejects.toMatchObject({
      name: "GameCommentRequestError",
      message: "삭제 권한이 없습니다.",
      status: 403,
    } satisfies Partial<GameCommentRequestError>);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://spring.test/game-service/comments/${COMMENT_ID}?password=secret-password`,
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

function createComment() {
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
