import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import { YeonStructuredData } from "@yeon/ui";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { GameDetail, getDetailGame } from "@/features/game-service";
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
        data={getGameJsonLd(game, canonical)}
      />
      <GameDetail game={game} />
    </>
  );
}
