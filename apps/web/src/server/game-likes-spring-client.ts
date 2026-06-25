import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  gameLikeRankingResponseSchema,
  gameLikeStatusSchema,
  type GameLikeRankingResponse,
  type GameLikeStatus,
} from "@yeon/api-contract/game-like";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";
import { resolveSpringBackendBaseUrl } from "@/server/user-experience-spring-client";

const LIKES_PATH = "/game-service/likes";

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // 무시
  }
  return "요청을 처리하지 못했습니다.";
}

export class GameLikeRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GameLikeRequestError";
    this.status = status;
  }
}

export async function getLikeStatus(
  gameSlug: string,
  userId: string | null
): Promise<GameLikeStatus> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${LIKES_PATH}?gameSlug=${encodeURIComponent(gameSlug)}`,
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId: userId ?? null }),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new GameLikeRequestError(response.status, await readError(response));
  }
  return gameLikeStatusSchema.parse(await response.json());
}

export async function toggleLike(
  gameSlug: string,
  userId: string
): Promise<GameLikeStatus> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${LIKES_PATH}`,
    {
      method: "POST",
      headers: buildSpringBffHeaders(
        { "content-type": "application/json" },
        { userId }
      ),
      body: JSON.stringify({ gameSlug }),
    }
  );
  if (!response.ok) {
    throw new GameLikeRequestError(response.status, await readError(response));
  }
  return gameLikeStatusSchema.parse(await response.json());
}

// 인기 랭킹(좋아요 수 내림차순). 인기 섹션 정렬에 쓴다. 실패 시 빈 목록으로 degrade.
export async function getLikeRanking(
  limit = 100
): Promise<GameLikeRankingResponse> {
  try {
    const response = await fetchYeon(
      `${resolveSpringBackendBaseUrl()}${LIKES_PATH}/ranking?limit=${limit}`,
      {
        method: "GET",
        headers: buildSpringBffHeaders(undefined, {}),
        next: { revalidate: 60 },
      }
    );
    if (!response.ok) return { items: [] };
    return gameLikeRankingResponseSchema.parse(await response.json());
  } catch {
    return { items: [] };
  }
}
