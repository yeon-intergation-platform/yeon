import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
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

function GameCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white text-left no-underline shadow-sm transition-colors duration-200 hover:border-[#111]"
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
          className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white"
        >
          {GAME_CATEGORY_LABELS[game.category]}
        </YeonText>
      </YeonView>
      <YeonView className="flex min-w-0 flex-1 flex-col p-4">
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#111]"
        >
          {game.title}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-1.5 line-clamp-2 break-keep ${SHARED_FEATURE_CLASS.text13Emphasis} font-normal text-[#666]`}
        >
          {game.summary}
        </YeonText>
      </YeonView>
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
    <YeonView className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = result.category === tab.category;
        return (
          <YeonLink
            key={tab.key}
            href={buildHubHref(tab.category, 1)}
            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[13px] font-medium no-underline transition-colors duration-200 ${
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
    <YeonView className="mt-8 flex items-center justify-center gap-4">
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
        className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 md:px-10 md:py-8"
      >
        <YeonView as="section" className="max-w-[680px]">
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]"
          >
            바로 즐기는 게임 모음
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]"
          >
            설치 없이 브라우저에서 바로 플레이할 수 있는 게임을 모았습니다.
          </YeonText>
        </YeonView>

        <CategoryTabs result={result} />

        {result.games.length > 0 ? (
          <YeonView
            as="section"
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
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
