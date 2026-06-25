import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  favoriteToggleResponseSchema,
  gameSlugListResponseSchema,
} from "@yeon/api-contract/game-library";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";
import { resolveSpringBackendBaseUrl } from "@/server/user-experience-spring-client";

const FAVORITES_PATH = "/game-service/library/favorites";
const RECENT_PATH = "/game-service/library/recent";

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // 무시
  }
  return "요청을 처리하지 못했습니다.";
}

export class GameLibraryRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GameLibraryRequestError";
    this.status = status;
  }
}

export async function listFavorites(userId: string): Promise<string[]> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${FAVORITES_PATH}`,
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new GameLibraryRequestError(
      response.status,
      await readError(response)
    );
  }
  return gameSlugListResponseSchema.parse(await response.json()).slugs;
}

export async function toggleFavorite(
  userId: string,
  gameSlug: string
): Promise<boolean> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${FAVORITES_PATH}`,
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
    throw new GameLibraryRequestError(
      response.status,
      await readError(response)
    );
  }
  return favoriteToggleResponseSchema.parse(await response.json()).favorited;
}

export async function listRecent(userId: string): Promise<string[]> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${RECENT_PATH}`,
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new GameLibraryRequestError(
      response.status,
      await readError(response)
    );
  }
  return gameSlugListResponseSchema.parse(await response.json()).slugs;
}

// 플레이 기록(최근 플레이). 실패해도 플레이를 막지 않으므로 호출 측에서 fire-and-forget.
export async function recordPlay(
  userId: string,
  gameSlug: string
): Promise<void> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${RECENT_PATH}`,
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
    throw new GameLibraryRequestError(
      response.status,
      await readError(response)
    );
  }
}
