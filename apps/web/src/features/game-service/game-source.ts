// 허브/상세의 동적 데이터 소스. curated 간판 게임과 GameMonetize Feed(캐싱)를 병합해
// 허브 목록·카테고리 필터·페이지네이션·상세 조회를 제공한다.
//
// 서버 컴포넌트/route 에서만 호출한다(Feed fetch 포함). 클라이언트 컴포넌트는
// 여기서 만든 GameEntry를 props로만 받는다.

import {
  CURATED_GAMES,
  GAME_REGIONS,
  getCollectionGames,
  getGameBySlug as getCuratedGameBySlug,
  getGameEmbedKey,
  type GameCategory,
  type GameCollection,
  type GameEntry,
  type GameRegion,
} from "./game-catalog";
import { fetchGameFeed } from "./game-feed";

export const GAME_HUB_PAGE_SIZE = 48;

export type HubGamesQuery = {
  category?: GameCategory | null;
  collection?: GameCollection | null;
  region?: GameRegion;
  /** 제목 부분일치 검색어 */
  query?: string | null;
  page?: number;
};

export type HubGamesResult = {
  games: GameEntry[];
  category: GameCategory | null;
  collection: GameCollection | null;
  query: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
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

// 컬렉션 우선(curated 큐레이션) → 장르 카테고리 → 전체 순으로 기준 목록을 정한다.
// 컬렉션은 손으로 고른 curated 묶음이라 feed를 섞지 않는다.
async function resolveBaseGames(query: HubGamesQuery): Promise<GameEntry[]> {
  if (query.collection) {
    return getCollectionGames(
      query.collection,
      query.region ?? GAME_REGIONS.global
    );
  }
  const allGames = await getMergedGames();
  return query.category
    ? allGames.filter((game) => game.category === query.category)
    : allGames;
}

function filterByQuery(
  games: GameEntry[],
  rawQuery: string | null
): GameEntry[] {
  const needle = rawQuery?.trim().toLowerCase();
  if (!needle) return games;
  return games.filter((game) => game.title.toLowerCase().includes(needle));
}

export async function getHubGames(
  query: HubGamesQuery = {}
): Promise<HubGamesResult> {
  const activeCollection = query.collection ?? null;
  const activeCategory = activeCollection ? null : (query.category ?? null);
  const activeQuery = query.query?.trim() ? query.query.trim() : null;

  const base = await resolveBaseGames({
    ...query,
    category: activeCategory,
    collection: activeCollection,
  });
  const filtered = filterByQuery(base, activeQuery);

  const totalCount = filtered.length;
  const totalPages = Math.max(Math.ceil(totalCount / GAME_HUB_PAGE_SIZE), 1);
  const page = clampPage(query.page, totalPages);
  const start = (page - 1) * GAME_HUB_PAGE_SIZE;

  return {
    games: filtered.slice(start, start + GAME_HUB_PAGE_SIZE),
    category: activeCategory,
    collection: activeCollection,
    query: activeQuery,
    page,
    pageSize: GAME_HUB_PAGE_SIZE,
    totalPages,
    totalCount,
  };
}

// slug 목록 → GameEntry(입력 순서 보존). 찜/최근 플레이 같은 "내 게임" 해석에 쓴다.
// merged 카탈로그를 한 번만 조회해 맵으로 매칭한다(없는 slug는 건너뛴다).
export async function getGamesBySlugs(
  slugs: readonly string[]
): Promise<GameEntry[]> {
  if (slugs.length === 0) return [];
  const all = await getMergedGames();
  const bySlug = new Map(all.map((game) => [game.slug, game]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((game): game is GameEntry => game !== undefined);
}

// 상세: curated 우선(정적·SEO), 없으면 feed에서 on-demand 조회.
export async function getDetailGame(slug: string): Promise<GameEntry | null> {
  const curated = getCuratedGameBySlug(slug);
  if (curated) return curated;

  const feedGames = await fetchGameFeed();
  return feedGames.find((game) => game.slug === slug) ?? null;
}
