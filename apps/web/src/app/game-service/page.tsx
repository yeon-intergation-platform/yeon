import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  GAME_CATEGORIES,
  GameServiceHome,
  getCollectionGames,
  getGamesBySlugs,
  getHubGames,
  getGameServiceText,
  getLanguageDefaultGameRegion,
  getLocalizedGameCategoryLabel,
  getLocalizedGameCollectionLabel,
  getLocalizedGameText,
  isGameCollection,
  isGameRegion,
  type GameCategory,
  type GameCollection,
  type GameEntry,
  type GameRegion,
  type GameServiceLanguage,
} from "@/features/game-service";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { getLikeRanking } from "@/server/game-likes-spring-client";
import { listFavorites, listRecent } from "@/server/game-library-spring-client";
import type { GameLikeRankingItem } from "@yeon/api-contract/game-like";

// 로그인 사용자의 찜·최근 플레이를 GameEntry로 해석한다(비로그인/실패 시 빈 배열).
async function resolveMyGames(): Promise<{
  favorites: GameEntry[];
  recent: GameEntry[];
}> {
  const user = await getCurrentAuthUser().catch((error) => {
    console.warn("[game-service] 로그인 세션 조회 실패", error);
    return null;
  });
  if (!user) return { favorites: [], recent: [] };
  const [favSlugs, recentSlugs] = await Promise.all([
    listFavorites(user.id).catch(() => []),
    listRecent(user.id).catch(() => []),
  ]);
  const [favorites, recent] = await Promise.all([
    getGamesBySlugs(favSlugs),
    getGamesBySlugs(recentSlugs),
  ]);
  return { favorites, recent };
}

// 인기 게임을 좋아요 수 내림차순으로 정렬한다. ranking에 없는(좋아요 0) 게임은
// 원래 큐레이션 순서를 유지하며 뒤로 보낸다(안정 정렬).
function orderByLikeCount(
  games: readonly GameEntry[],
  ranking: readonly GameLikeRankingItem[]
): GameEntry[] {
  const countBySlug = new Map(
    ranking.map((item) => [item.gameSlug, item.count])
  );
  return games
    .map((game, index) => ({
      game,
      index,
      count: countBySlug.get(game.slug) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map((entry) => entry.game);
}

const GAME_HUB_TITLE = "게임 - 브라우저에서 바로 즐기는 게임 모음";
const GAME_HUB_DESCRIPTION =
  "설치 없이 브라우저에서 바로 플레이할 수 있는 게임을 한곳에 모은 YEON 게임 허브입니다.";

export const metadata: YeonPageMetadata = {
  title: GAME_HUB_TITLE,
  description: GAME_HUB_DESCRIPTION,
  alternates: {
    canonical: buildServiceCanonicalUrl("game"),
  },
  openGraph: {
    title: GAME_HUB_TITLE,
    description: GAME_HUB_DESCRIPTION,
    url: buildServiceCanonicalUrl("game"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: GAME_HUB_TITLE,
    description: GAME_HUB_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

type GameHubSearchParams = {
  category?: string | string[];
  collection?: string | string[];
  view?: string | string[];
  q?: string | string[];
  page?: string | string[];
  region?: string | string[];
  lang?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// 추천 국가는 URL 토글(?region=)이 우선, 없으면 선택 언어의 기본 지역으로 정한다.
function resolveActiveRegion(
  regionParam: string | undefined,
  language: GameServiceLanguage
): GameRegion {
  if (isGameRegion(regionParam)) {
    return regionParam;
  }
  return getLanguageDefaultGameRegion(language);
}

function parseCategory(value: string | undefined): GameCategory | null {
  if (!value) return null;
  return value in GAME_CATEGORIES ? (value as GameCategory) : null;
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}

function getGameHubJsonLd(
  games: readonly GameEntry[],
  language: GameServiceLanguage
) {
  const text = getGameServiceText(language);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name:
          language === "en"
            ? `${SITE_BRAND_NAME} Games`
            : `${SITE_BRAND_NAME} 게임`,
        url: buildServiceCanonicalUrl("game"),
        description:
          language === "en" ? text.heroDescription : GAME_HUB_DESCRIPTION,
        inLanguage: language === "en" ? "en-US" : "ko-KR",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: games.map((game, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: game.title,
            url: buildServiceCanonicalUrl("game", `/${game.slug}`),
            description: getLocalizedGameText(game, language).summary,
          })),
        },
      },
    ],
  };
}

// 그리드 헤딩 + 활성 탭 키 결정. 검색 > 컬렉션 > 장르 > 전체보기 순.
function resolveGridHeading(params: {
  query: string | null;
  collection: GameCollection | null;
  category: GameCategory | null;
  language: GameServiceLanguage;
}): { heading: string; activeKey: string } {
  const text = getGameServiceText(params.language);
  if (params.query) {
    return { heading: text.searchHeading(params.query), activeKey: "" };
  }
  if (params.collection) {
    return {
      heading: getLocalizedGameCollectionLabel(
        params.collection,
        params.language
      ),
      activeKey: params.collection,
    };
  }
  if (params.category) {
    return {
      heading: text.categoryHeading(
        getLocalizedGameCategoryLabel(params.category, params.language)
      ),
      activeKey: params.category,
    };
  }
  return { heading: text.allGames, activeKey: "" };
}

export default async function GameServicePage({
  searchParams,
}: {
  searchParams: Promise<GameHubSearchParams>;
}) {
  const { category, collection, view, q, page, region, lang } =
    await searchParams;
  const activeLanguage = await resolvePlatformLanguageFromRequest(
    firstParam(lang)
  );
  const activeRegion = resolveActiveRegion(firstParam(region), activeLanguage);

  const categoryParam = firstParam(category);
  const collectionParam = firstParam(collection);
  const viewParam = firstParam(view);
  const queryParam = firstParam(q)?.trim() || undefined;

  // 랜딩(섹션형)은 어떤 필터/검색/전체보기도 없을 때만. 그 외엔 그리드.
  const isLanding =
    !categoryParam && !collectionParam && !viewParam && !queryParam;

  if (isLanding) {
    const featured = getCollectionGames("featured", activeRegion);
    const retro = getCollectionGames("retro", activeRegion);
    // 인기 게임은 좋아요 수로 실제 정렬한다(같은 수/0이면 큐레이션 순서 유지).
    const popularBase = getCollectionGames("popular", activeRegion);
    const [ranking, myGames] = await Promise.all([
      getLikeRanking(100),
      resolveMyGames(),
    ]);
    const popular = orderByLikeCount(popularBase, ranking.items);
    return (
      <>
        <YeonStructuredData
          id="game-service-jsonld"
          data={getGameHubJsonLd([...featured, ...popular], activeLanguage)}
        />
        <GameServiceHome
          mode="landing"
          region={activeRegion}
          language={activeLanguage}
          featured={featured}
          retro={retro}
          popular={popular}
          favorites={myGames.favorites}
          recent={myGames.recent}
        />
      </>
    );
  }

  const activeCollection: GameCollection | null = isGameCollection(
    collectionParam
  )
    ? collectionParam
    : null;
  const activeCategory = activeCollection ? null : parseCategory(categoryParam);

  const result = await getHubGames({
    category: activeCategory,
    collection: activeCollection,
    region: activeRegion,
    query: queryParam ?? null,
    page: parsePage(firstParam(page)),
  });
  const { heading, activeKey } = resolveGridHeading({
    query: result.query,
    collection: result.collection,
    category: result.category,
    language: activeLanguage,
  });

  return (
    <>
      <YeonStructuredData
        id="game-service-jsonld"
        data={getGameHubJsonLd(result.games, activeLanguage)}
      />
      <GameServiceHome
        mode="grid"
        region={activeRegion}
        language={activeLanguage}
        activeKey={activeKey}
        heading={heading}
        result={result}
      />
    </>
  );
}
