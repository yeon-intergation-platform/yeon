// 허브/상세의 동적 데이터 소스. curated 간판 게임과 GameMonetize Feed(캐싱)를 병합해
// 허브 목록·카테고리 필터·페이지네이션·상세 조회를 제공한다.
//
// 서버 컴포넌트/route 에서만 호출한다(Feed fetch 포함). 클라이언트 컴포넌트는
// 여기서 만든 GameEntry를 props로만 받는다.

import {
  CURATED_GAMES,
  GAME_CATEGORY_ORDER,
  getGameBySlug as getCuratedGameBySlug,
  getGameEmbedKey,
  type GameCategory,
  type GameEntry,
} from "./game-catalog";
import { fetchGameFeed } from "./game-feed";

export const GAME_HUB_PAGE_SIZE = 24;

export type HubGamesQuery = {
  category?: GameCategory | null;
  page?: number;
};

export type HubGamesResult = {
  games: GameEntry[];
  category: GameCategory | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  availableCategories: GameCategory[];
};

// curated를 앞에 두고 feed를 덧붙이되, 같은 게임(임베드 해시 동일)은 한 번만 남긴다.
function mergeGames(feedGames: readonly GameEntry[]): GameEntry[] {
  const merged: GameEntry[] = [];
  const seenEmbed = new Set<string>();
  const seenSlug = new Set<string>();

  for (const game of [...CURATED_GAMES, ...feedGames]) {
    const embedKey = getGameEmbedKey(game.embedUrl);
    if (seenEmbed.has(embedKey) || seenSlug.has(game.slug)) continue;
    seenEmbed.add(embedKey);
    seenSlug.add(game.slug);
    merged.push(game);
  }

  return merged;
}

// 전체 병합 카탈로그(curated + feed). 실패 시 curated만 반환된다.
async function getMergedGames(): Promise<GameEntry[]> {
  const feedGames = await fetchGameFeed();
  return mergeGames(feedGames);
}

function clampPage(page: number | undefined, totalPages: number): number {
  if (!page || !Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.trunc(page), Math.max(totalPages, 1));
}

export async function getHubGames(
  query: HubGamesQuery = {}
): Promise<HubGamesResult> {
  const allGames = await getMergedGames();

  const availableCategories = GAME_CATEGORY_ORDER.filter((category) =>
    allGames.some((game) => game.category === category)
  );

  const activeCategory =
    query.category && availableCategories.includes(query.category)
      ? query.category
      : null;

  const filtered = activeCategory
    ? allGames.filter((game) => game.category === activeCategory)
    : allGames;

  const totalCount = filtered.length;
  const totalPages = Math.max(Math.ceil(totalCount / GAME_HUB_PAGE_SIZE), 1);
  const page = clampPage(query.page, totalPages);
  const start = (page - 1) * GAME_HUB_PAGE_SIZE;

  return {
    games: filtered.slice(start, start + GAME_HUB_PAGE_SIZE),
    category: activeCategory,
    page,
    pageSize: GAME_HUB_PAGE_SIZE,
    totalPages,
    totalCount,
    availableCategories,
  };
}

// 상세: curated 우선(정적·SEO), 없으면 feed에서 on-demand 조회.
export async function getDetailGame(slug: string): Promise<GameEntry | null> {
  const curated = getCuratedGameBySlug(slug);
  if (curated) return curated;

  const feedGames = await fetchGameFeed();
  return feedGames.find((game) => game.slug === slug) ?? null;
}
