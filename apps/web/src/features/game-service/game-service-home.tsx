import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import {
  GAME_CATEGORY_LABELS,
  GAME_REGION_LABELS,
  GAME_REGIONS,
  type GameCategory,
  type GameEntry,
  type GameRegion,
} from "./game-catalog";
import { GamePointsBanner } from "./game-points-banner";
import type { HubGamesResult } from "./game-source";

// 허브 링크는 카테고리/페이지/국가를 URL 쿼리로 보존한다(route-state-contract: reload-safe).
function buildHubHref(
  category: GameCategory | null,
  page: number,
  region: GameRegion
): string {
  const params = new URLSearchParams();
  if (region !== GAME_REGIONS.global) params.set("region", region);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/game-service?${query}` : "/game-service";
}

// 한눈에 많은 게임을 보여주기 위해 카드는 썸네일 + 제목만으로 컴팩트하게 구성한다.
function GameCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e5e5e5] bg-white text-left no-underline transition-colors duration-200 hover:border-[#111]"
    >
      <YeonView
        className="relative aspect-video w-full bg-cover bg-center bg-[#f2f2f2]"
        style={
          game.thumbUrl
            ? { backgroundImage: `url("${game.thumbUrl}")` }
            : undefined
        }
      >
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="absolute left-1 top-1 inline-flex items-center rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-medium text-white"
        >
          {GAME_CATEGORY_LABELS[game.category]}
        </YeonText>
      </YeonView>
      <YeonText
        as="h3"
        variant="unstyled"
        tone="inherit"
        className="truncate px-2 py-1.5 text-[12px] font-semibold tracking-[-0.02em] text-[#111]"
      >
        {game.title}
      </YeonText>
    </YeonLink>
  );
}

// 국가 추천 토글. 한국/미국을 전환하면 상단 추천 게임이 달라진다.
function RegionToggle({ region }: { region: GameRegion }) {
  const tabs: { key: GameRegion; label: string }[] = [
    { key: GAME_REGIONS.kr, label: "🇰🇷 한국" },
    { key: GAME_REGIONS.us, label: "🇺🇸 미국" },
  ];

  return (
    <YeonView className="flex gap-1.5">
      {tabs.map((tab) => {
        const isActive = region === tab.key;
        return (
          <YeonLink
            key={tab.key}
            href={buildHubHref(null, 1, tab.key)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold no-underline transition-colors duration-200 ${
              isActive
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] bg-white text-[#444] hover:border-[#111]"
            }`}
          >
            {tab.label}
          </YeonLink>
        );
      })}
    </YeonView>
  );
}

// 국가별 추천 섹션. 무명 대량 게임 대신 검증된 게임을 상단에 큐레이션한다.
function FeaturedSection({
  region,
  games,
}: {
  region: GameRegion;
  games: readonly GameEntry[];
}) {
  if (games.length === 0) return null;

  return (
    <YeonView as="section" className="mt-4">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[15px] font-bold tracking-[-0.02em] text-[#111]"
      >
        {GAME_REGION_LABELS[region]} 추천
      </YeonText>
      <YeonView className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {games.map((game) => (
          <GameCard key={`featured-${game.slug}`} game={game} />
        ))}
      </YeonView>
    </YeonView>
  );
}

function CategoryTabs({
  result,
  region,
}: {
  result: HubGamesResult;
  region: GameRegion;
}) {
  const tabs: { key: string; label: string; category: GameCategory | null }[] =
    [
      { key: "all", label: "전체", category: null },
      ...result.availableCategories.map((category) => ({
        key: category,
        label: GAME_CATEGORY_LABELS[category],
        category,
      })),
    ];

  return (
    <YeonView className="mt-3 flex flex-wrap gap-1.5">
      {tabs.map((tab) => {
        const isActive = result.category === tab.category;
        return (
          <YeonLink
            key={tab.key}
            href={buildHubHref(tab.category, 1, region)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium no-underline transition-colors duration-200 ${
              isActive
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] bg-white text-[#444] hover:border-[#111]"
            }`}
          >
            {tab.label}
          </YeonLink>
        );
      })}
    </YeonView>
  );
}

function Pagination({
  result,
  region,
}: {
  result: HubGamesResult;
  region: GameRegion;
}) {
  if (result.totalPages <= 1) return null;

  const hasPrev = result.page > 1;
  const hasNext = result.page < result.totalPages;

  return (
    <YeonView className="mt-5 flex items-center justify-center gap-4">
      <YeonLink
        href={buildHubHref(result.category, result.page - 1, region)}
        aria-disabled={!hasPrev}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${
          hasPrev
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
            : "pointer-events-none border-[#f0f0f0] bg-[#fafafa] text-[#bbb]"
        }`}
      >
        ← 이전
      </YeonLink>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="text-[13px] font-medium text-[#666]"
      >
        {result.page} / {result.totalPages}
      </YeonText>
      <YeonLink
        href={buildHubHref(result.category, result.page + 1, region)}
        aria-disabled={!hasNext}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${
          hasNext
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
            : "pointer-events-none border-[#f0f0f0] bg-[#fafafa] text-[#bbb]"
        }`}
      >
        다음 →
      </YeonLink>
    </YeonView>
  );
}

export function GameServiceHome({
  result,
  region,
  featuredGames,
}: {
  result: HubGamesResult;
  region: GameRegion;
  featuredGames: readonly GameEntry[];
}) {
  // 추천 섹션은 전체 보기(카테고리 미선택 + 1페이지)에서만 상단에 노출한다.
  const showFeatured = result.category === null && result.page === 1;

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="game" />

      <YeonView
        as="main"
        className="mx-auto w-full max-w-[1680px] px-2 py-3 sm:px-4 sm:py-4"
      >
        <YeonView
          as="section"
          className="flex flex-wrap items-start justify-between gap-2"
        >
          <YeonView className="min-w-0">
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="text-[18px] font-black tracking-[-0.03em] text-[#111] md:text-[22px]"
            >
              바로 즐기는 게임 모음
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-0.5 text-[12px] leading-[1.6] text-[#888] md:text-[13px]"
            >
              설치 없이 브라우저에서 바로 플레이할 수 있는 게임을 모았습니다.
            </YeonText>
          </YeonView>
          <RegionToggle region={region} />
        </YeonView>

        <GamePointsBanner />

        {showFeatured ? (
          <FeaturedSection region={region} games={featuredGames} />
        ) : null}

        <CategoryTabs result={result} region={region} />

        {result.games.length > 0 ? (
          <YeonView
            as="section"
            className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
          >
            {result.games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </YeonView>
        ) : (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-10 text-center text-[14px] text-[#999]"
          >
            표시할 게임이 없습니다.
          </YeonText>
        )}

        <Pagination result={result} region={region} />
      </YeonView>
    </YeonView>
  );
}
