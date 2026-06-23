import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { getYeonRequestHeaders } from "@yeon/ui/runtime/YeonServerRequest";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  GAME_CATEGORIES,
  GameServiceHome,
  getFeaturedGamesForRegion,
  getHubGames,
  isGameRegion,
  resolveRegionFromCountry,
  type GameCategory,
  type GameRegion,
  type HubGamesResult,
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

function getGameHubJsonLd(result: HubGamesResult) {
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
          itemListElement: result.games.map((game, index) => ({
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

export default async function GameServicePage({
  searchParams,
}: {
  searchParams: Promise<GameHubSearchParams>;
}) {
  const { category, page, region } = await searchParams;
  const headerStore = await getYeonRequestHeaders();
  const activeRegion = resolveActiveRegion(
    firstParam(region),
    headerStore.get("cf-ipcountry")
  );
  const result = await getHubGames({
    category: parseCategory(firstParam(category)),
    page: parsePage(firstParam(page)),
  });
  const featuredGames = getFeaturedGamesForRegion(activeRegion);

  return (
    <>
      <YeonStructuredData
        id="game-service-jsonld"
        data={getGameHubJsonLd(result)}
      />
      <GameServiceHome
        result={result}
        region={activeRegion}
        featuredGames={featuredGames}
      />
    </>
  );
}
