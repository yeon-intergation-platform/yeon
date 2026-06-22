import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  GameDetail,
  getDetailGame,
  getGameSlugs,
} from "@/features/game-service";

type GameDetailRouteParams = {
  gameSlug: string;
};

// curated 간판 게임만 정적 생성하고, feed 게임은 on-demand로 렌더한다.
export const dynamicParams = true;

export function generateStaticParams() {
  return getGameSlugs().map((gameSlug) => ({ gameSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<GameDetailRouteParams>;
}): Promise<YeonPageMetadata> {
  const { gameSlug } = await params;
  const game = await getDetailGame(gameSlug);

  if (!game) {
    return { title: "게임을 찾을 수 없습니다 | YEON" };
  }

  const canonical = buildServiceCanonicalUrl("game", `/${game.slug}`);
  const title = `${game.title} - YEON 게임`;

  return {
    title,
    description: game.summary,
    alternates: { canonical },
    openGraph: {
      title,
      description: game.summary,
      url: canonical,
      siteName: SITE_BRAND_NAME,
      type: "website",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: game.summary,
    },
    robots: { index: true, follow: true },
  };
}

function getGameJsonLd(canonical: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description,
    url: canonical,
    inLanguage: "ko-KR",
    applicationCategory: "Game",
    operatingSystem: "Web",
    gamePlatform: "Web browser",
    isAccessibleForFree: true,
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<GameDetailRouteParams>;
}) {
  const { gameSlug } = await params;
  const game = await getDetailGame(gameSlug);

  if (!game) {
    showYeonNotFound();
  }

  const canonical = buildServiceCanonicalUrl("game", `/${game.slug}`);

  return (
    <>
      <YeonStructuredData
        id={`game-${game.slug}-jsonld`}
        data={getGameJsonLd(canonical, game.title, game.description)}
      />
      <GameDetail game={game} />
    </>
  );
}
