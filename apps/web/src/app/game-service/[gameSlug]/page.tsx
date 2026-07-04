import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import { YeonStructuredData } from "@yeon/ui";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { GameDetail, getDetailGame } from "@/features/game-service";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";
import {
  generateMetadata as createGameMetadata,
  generateStaticParams as createGameStaticParams,
  getGameJsonLd,
  type GameDetailRouteParams,
} from "./route-metadata";

// curated 간판 게임만 정적 생성하고, feed 게임은 on-demand로 렌더한다.
export const dynamicParams = true;

export function generateStaticParams() {
  return createGameStaticParams();
}

export async function generateMetadata(
  props: Parameters<typeof createGameMetadata>[0]
) {
  return createGameMetadata(props);
}

type GameDetailSearchParams = {
  lang?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GameDetailPage({
  params,
  searchParams,
}: {
  params: Promise<GameDetailRouteParams>;
  searchParams: Promise<GameDetailSearchParams>;
}) {
  const { gameSlug } = await params;
  const { lang } = await searchParams;
  const activeLanguage = await resolvePlatformLanguageFromRequest(
    firstParam(lang)
  );
  const game = await getDetailGame(gameSlug);

  if (!game) {
    showYeonNotFound();
  }

  const canonical = buildServiceCanonicalUrl("game", `/${game.slug}`);

  return (
    <>
      <YeonStructuredData
        id={`game-${game.slug}-jsonld`}
        data={getGameJsonLd(game, canonical, activeLanguage)}
      />
      <GameDetail game={game} language={activeLanguage} />
    </>
  );
}
