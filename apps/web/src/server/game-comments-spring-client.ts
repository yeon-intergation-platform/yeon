import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  commentLikeResponseSchema,
  gameCommentListResponseSchema,
  gameCommentSchema,
  revealGameCommentResponseSchema,
  type CommentLikeResponse,
  type CommentSort,
  type CreateGameCommentRequest,
  type GameComment,
  type GameCommentListResponse,
} from "@yeon/api-contract/game-comment";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";
import { resolveSpringBackendBaseUrl } from "@/server/user-experience-spring-client";

const COMMENTS_PATH = "/game-service/comments";

// 로그인 사용자 정체성. 웹 세션에서만 채워 Spring에 헤더로 위임한다(위조 차단).
export type CommentViewer = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
};

const USER_NAME_HEADER = "X-Yeon-User-Name";
const USER_AVATAR_HEADER = "X-Yeon-User-Avatar";
const USER_ROLE_HEADER = "X-Yeon-User-Role";

function buildHeaders(viewer: CommentViewer | null, withBody: boolean) {
  const headers = buildSpringBffHeaders(
    withBody ? { "content-type": "application/json" } : undefined,
    { userId: viewer?.id ?? null }
  );
  if (viewer) {
    if (viewer.displayName) headers.set(USER_NAME_HEADER, viewer.displayName);
    if (viewer.avatarUrl) headers.set(USER_AVATAR_HEADER, viewer.avatarUrl);
    headers.set(USER_ROLE_HEADER, viewer.isAdmin ? "admin" : "user");
  }
  return headers;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // 무시: 기본 메시지 사용
  }
  return "요청을 처리하지 못했습니다.";
}

export async function listGameComments(
  gameSlug: string,
  viewer: CommentViewer | null,
  sort: CommentSort = "latest"
): Promise<GameCommentListResponse> {
  const url = `${resolveSpringBackendBaseUrl()}${COMMENTS_PATH}?gameSlug=${encodeURIComponent(gameSlug)}&sort=${sort}`;
  const response = await fetchYeon(url, {
    method: "GET",
    headers: buildHeaders(viewer, false),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response));
  return gameCommentListResponseSchema.parse(await response.json());
}

export async function toggleCommentLike(
  commentId: string,
  viewer: CommentViewer | null
): Promise<CommentLikeResponse> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${COMMENTS_PATH}/${encodeURIComponent(commentId)}/like`,
    {
      method: "POST",
      headers: buildHeaders(viewer, true),
      body: "{}",
    }
  );
  if (!response.ok) {
    throw new GameCommentRequestError(
      response.status,
      await readError(response)
    );
  }
  return commentLikeResponseSchema.parse(await response.json());
}

export async function createGameComment(
  payload: CreateGameCommentRequest,
  viewer: CommentViewer | null
): Promise<GameComment> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${COMMENTS_PATH}`,
    {
      method: "POST",
      headers: buildHeaders(viewer, true),
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const message = await readError(response);
    throw new GameCommentRequestError(response.status, message);
  }
  return gameCommentSchema.parse(await response.json());
}

export async function revealGameComment(
  id: string,
  password: string
): Promise<string> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${COMMENTS_PATH}/${encodeURIComponent(id)}/reveal`,
    {
      method: "POST",
      headers: buildHeaders(null, true),
      body: JSON.stringify({ password }),
    }
  );
  if (!response.ok) {
    const message = await readError(response);
    throw new GameCommentRequestError(response.status, message);
  }
  return revealGameCommentResponseSchema.parse(await response.json()).content;
}

export async function deleteGameComment(
  id: string,
  viewer: CommentViewer | null,
  password: string | null
): Promise<boolean> {
  const query = password ? `?password=${encodeURIComponent(password)}` : "";
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${COMMENTS_PATH}/${encodeURIComponent(id)}${query}`,
    {
      method: "DELETE",
      headers: buildHeaders(viewer, false),
    }
  );
  if (!response.ok) {
    const message = await readError(response);
    throw new GameCommentRequestError(response.status, message);
  }
  return true;
}

export class GameCommentRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GameCommentRequestError";
    this.status = status;
  }
}
