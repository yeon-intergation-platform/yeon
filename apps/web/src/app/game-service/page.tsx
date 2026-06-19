import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { GameServiceHome, getListedGames } from "@/features/game-service";

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

function getGameHubJsonLd() {
  const games = getListedGames();

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

export default function GameServicePage() {
  return (
    <>
      <YeonStructuredData id="game-service-jsonld" data={getGameHubJsonLd()} />
      <GameServiceHome />
    </>
  );
}
