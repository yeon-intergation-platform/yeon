import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { getYeonRequestHeaders } from "@yeon/ui/runtime/YeonServerRequest";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  GAME_CATEGORIES,
  GAME_CATEGORY_LABELS,
  GAME_COLLECTION_LABELS,
  GameServiceHome,
  getCollectionGames,
  getHubGames,
  isGameCollection,
  isGameRegion,
  resolveRegionFromCountry,
  type GameCategory,
  type GameCollection,
  type GameEntry,
  type GameRegion,
} from "@/features/game-service";

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
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// 추천 국가는 URL 토글(?region=)이 우선, 없으면 접속 국가(Cloudflare CF-IPCountry)로 정한다.
function resolveActiveRegion(
  regionParam: string | undefined,
  countryHeader: string | null
): GameRegion {
  if (isGameRegion(regionParam)) {
    return regionParam;
  }
  return resolveRegionFromCountry(countryHeader);
}

function parseCategory(value: string | undefined): GameCategory | null {
  if (!value) return null;
  return value in GAME_CATEGORIES ? (value as GameCategory) : null;
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}

function getGameHubJsonLd(games: readonly GameEntry[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${SITE_BRAND_NAME} 게임`,
        url: buildServiceCanonicalUrl("game"),
        description: GAME_HUB_DESCRIPTION,
        inLanguage: "ko-KR",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: games.map((game, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: game.title,
            url: buildServiceCanonicalUrl("game", `/${game.slug}`),
            description: game.summary,
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
}): { heading: string; activeKey: string } {
  if (params.query) {
    return { heading: `'${params.query}' 검색 결과`, activeKey: "" };
  }
  if (params.collection) {
    return {
      heading: GAME_COLLECTION_LABELS[params.collection],
      activeKey: params.collection,
    };
  }
  if (params.category) {
    return {
      heading: `${GAME_CATEGORY_LABELS[params.category]} 게임`,
      activeKey: params.category,
    };
  }
  return { heading: "전체 게임", activeKey: "" };
}

export default async function GameServicePage({
  searchParams,
}: {
  searchParams: Promise<GameHubSearchParams>;
}) {
  const { category, collection, view, q, page, region } = await searchParams;
  const headerStore = await getYeonRequestHeaders();
  const activeRegion = resolveActiveRegion(
    firstParam(region),
    headerStore.get("cf-ipcountry")
  );

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
    const popular = getCollectionGames("popular", activeRegion);
    return (
      <>
        <YeonStructuredData
          id="game-service-jsonld"
          data={getGameHubJsonLd([...featured, ...popular])}
        />
        <GameServiceHome
          mode="landing"
          region={activeRegion}
          featured={featured}
          retro={retro}
          popular={popular}
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
  });

  return (
    <>
      <YeonStructuredData
        id="game-service-jsonld"
        data={getGameHubJsonLd(result.games)}
      />
      <GameServiceHome
        mode="grid"
        region={activeRegion}
        activeKey={activeKey}
        heading={heading}
        result={result}
      />
    </>
  );
}
