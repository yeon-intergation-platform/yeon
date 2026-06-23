import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { GamePointsBanner } from "./game-points-banner";
import {
  GAME_CATEGORY_LABELS,
  type GameCategory,
  type GameEntry,
} from "./game-catalog";
import type { HubGamesResult } from "./game-source";

// 허브 링크는 카테고리/페이지를 URL 쿼리로 보존한다(route-state-contract: reload-safe).
function buildHubHref(category: GameCategory | null, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/game-service?${query}` : "/game-service";
}

// 한눈에 많은 게임을 보여주기 위해 카드는 썸네일 + 제목만으로 컴팩트하게 구성한다.
// 상세 설명은 게임 상세 페이지에서 제공한다.
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

function CategoryTabs({ result }: { result: HubGamesResult }) {
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
            href={buildHubHref(tab.category, 1)}
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

function Pagination({ result }: { result: HubGamesResult }) {
  if (result.totalPages <= 1) return null;

  const hasPrev = result.page > 1;
  const hasNext = result.page < result.totalPages;

  return (
    <YeonView className="mt-5 flex items-center justify-center gap-4">
      <YeonLink
        href={buildHubHref(result.category, result.page - 1)}
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
        href={buildHubHref(result.category, result.page + 1)}
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

export function GameServiceHome({ result }: { result: HubGamesResult }) {
  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="game" />

      <YeonView
        as="main"
        className="mx-auto w-full max-w-[1680px] px-2 py-3 sm:px-4 sm:py-4"
      >
        <YeonView as="section">
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

        <GamePointsBanner />

        <CategoryTabs result={result} />

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

        <Pagination result={result} />
      </YeonView>
    </YeonView>
  );
}
