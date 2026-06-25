import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import {
  GAME_HUB_TABS,
  GAME_REGION_LABELS,
  GAME_REGIONS,
  getGameTags,
  type GameHubTab,
  type GameEntry,
  type GameRegion,
} from "./game-catalog";
import { GamePointsBanner } from "./game-points-banner";
import type { HubGamesResult } from "./game-source";

// 허브 링크는 탭(전체/컬렉션/장르)·페이지·국가·검색어를 URL 쿼리로 보존한다(reload-safe).
type HubLinkParams = {
  category?: string;
  collection?: string;
  view?: string;
  query?: string;
  page?: number;
  region: GameRegion;
};

function buildHubHref({
  category,
  collection,
  view,
  query,
  page,
  region,
}: HubLinkParams): string {
  const params = new URLSearchParams();
  if (region !== GAME_REGIONS.global) params.set("region", region);
  if (collection) params.set("collection", collection);
  if (category) params.set("category", category);
  if (view) params.set("view", view);
  if (query) params.set("q", query);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/game-service?${qs}` : "/game-service";
}

// 탭 → 링크. 전체는 랜딩, 컬렉션/장르는 각 그리드로 보낸다.
function hrefForTab(tab: GameHubTab, region: GameRegion): string {
  if (tab.type === "collection") {
    return buildHubHref({ collection: tab.collection, region });
  }
  if (tab.type === "category") {
    return buildHubHref({ category: tab.category, region });
  }
  return buildHubHref({ region });
}

function TagChips({ tags }: { tags: readonly string[] }) {
  return (
    <YeonView className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <YeonText
          key={tag}
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex items-center rounded-full bg-[#f1f0fb] px-2 py-0.5 text-[10px] font-semibold text-[#6b5bd2]"
        >
          {tag}
        </YeonText>
      ))}
    </YeonView>
  );
}

function PlayPill() {
  return (
    <YeonText
      as="span"
      variant="unstyled"
      tone="inherit"
      className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#111] transition-colors duration-200 group-hover:border-[#6b5bd2] group-hover:text-[#6b5bd2]"
    >
      ▶ 플레이하기
    </YeonText>
  );
}

// 운영자 추천 히어로(좌측 큰 카드). 썸네일을 배경으로 깔고 정보를 얹는다.
function HeroCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#1b1530] bg-cover bg-center p-5 text-left no-underline md:min-h-[300px]"
      style={
        game.thumbUrl
          ? { backgroundImage: `url("${game.thumbUrl}")` }
          : undefined
      }
    >
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="relative inline-flex w-fit items-center rounded-md bg-[#6b5bd2] px-2 py-0.5 text-[11px] font-bold text-white"
      >
        추천
      </YeonText>
      <YeonText
        as="h3"
        variant="unstyled"
        tone="inherit"
        className="relative mt-2 text-[24px] font-black tracking-[-0.03em] text-white md:text-[28px]"
      >
        {game.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="relative mt-1 max-w-[420px] text-[13px] leading-[1.6] text-white/85"
      >
        {game.summary}
      </YeonText>
      <YeonView className="relative mt-3 flex items-center justify-between">
        <YeonView className="flex flex-wrap gap-1">
          {getGameTags(game)
            .slice(0, 4)
            .map((tag) => (
              <YeonText
                key={tag}
                as="span"
                variant="unstyled"
                tone="inherit"
                className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                {tag}
              </YeonText>
            ))}
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex items-center gap-1 rounded-full bg-[#6b5bd2] px-4 py-1.5 text-[13px] font-bold text-white transition-transform duration-200 group-hover:scale-105"
        >
          ▶ 플레이하기
        </YeonText>
      </YeonView>
    </YeonLink>
  );
}

// 운영자 추천 우측 카드(썸네일 + 제목 + 요약 + 태그 + 플레이).
function FeatureCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-left no-underline transition-colors duration-200 hover:border-[#6b5bd2]"
    >
      <YeonView
        className="aspect-video w-full bg-cover bg-center bg-[#f2f2f2]"
        style={
          game.thumbUrl
            ? { backgroundImage: `url("${game.thumbUrl}")` }
            : undefined
        }
      />
      <YeonView className="flex flex-1 flex-col gap-1.5 p-3">
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="truncate text-[14px] font-bold tracking-[-0.02em] text-[#111]"
        >
          {game.title}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="line-clamp-2 text-[12px] leading-[1.5] text-[#777]"
        >
          {game.summary}
        </YeonText>
        <TagChips tags={getGameTags(game)} />
        <YeonView className="mt-1">
          <PlayPill />
        </YeonView>
      </YeonView>
    </YeonLink>
  );
}

// 행/그리드 공용 컴팩트 카드(썸네일 + 제목 + 태그).
function CompactCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-left no-underline transition-colors duration-200 hover:border-[#6b5bd2]"
    >
      <YeonView
        className="aspect-video w-full bg-cover bg-center bg-[#f2f2f2]"
        style={
          game.thumbUrl
            ? { backgroundImage: `url("${game.thumbUrl}")` }
            : undefined
        }
      />
      <YeonView className="flex flex-col gap-1 p-2.5">
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="truncate text-[13px] font-bold tracking-[-0.02em] text-[#111]"
        >
          {game.title}
        </YeonText>
        <TagChips tags={getGameTags(game)} />
      </YeonView>
    </YeonLink>
  );
}

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
            href={buildHubHref({ region: tab.key })}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold no-underline transition-colors duration-200 ${
              isActive
                ? "border-[#6b5bd2] bg-[#6b5bd2] text-white"
                : "border-[#e5e5e5] bg-white text-[#444] hover:border-[#6b5bd2]"
            }`}
          >
            {tab.label}
          </YeonLink>
        );
      })}
    </YeonView>
  );
}

// 아이콘 카테고리 탭 바. activeKey와 일치하는 탭만 강조한다.
function HubTabBar({
  region,
  activeKey,
}: {
  region: GameRegion;
  activeKey: string;
}) {
  return (
    <YeonView className="mt-3 flex flex-wrap gap-1.5 border-b border-[#eee] pb-3">
      {GAME_HUB_TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <YeonLink
            key={tab.key}
            href={hrefForTab(tab, region)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold no-underline transition-colors duration-200 ${
              isActive
                ? "bg-[#6b5bd2] text-white"
                : "text-[#555] hover:bg-[#f2f0fb] hover:text-[#6b5bd2]"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </YeonLink>
        );
      })}
    </YeonView>
  );
}

// no-JS 검색 폼(GET). 제출 시 ?view=all&q= 로 이동해 그리드에서 제목 부분일치 필터.
function SearchBar({
  region,
  defaultValue,
}: {
  region: GameRegion;
  defaultValue?: string;
}) {
  return (
    <form
      action="/game-service"
      method="get"
      className="relative w-full max-w-[520px]"
    >
      {region !== GAME_REGIONS.global ? (
        <input type="hidden" name="region" value={region} />
      ) : null}
      <input type="hidden" name="view" value="all" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="게임을 검색해보세요"
        aria-label="게임 검색"
        className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 pr-10 text-[13px] text-[#111] outline-none transition-colors focus:border-[#6b5bd2] focus:bg-white"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[14px] text-[#888] transition-colors hover:text-[#6b5bd2]"
      >
        🔍
      </button>
    </form>
  );
}

function SectionHeader({
  icon,
  title,
  moreHref,
}: {
  icon: string;
  title: string;
  moreHref?: string;
}) {
  return (
    <YeonView className="flex items-center justify-between">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="flex items-center gap-1.5 text-[16px] font-black tracking-[-0.02em] text-[#111]"
      >
        <span aria-hidden="true">{icon}</span>
        {title}
      </YeonText>
      {moreHref ? (
        <YeonLink
          href={moreHref}
          className="text-[12px] font-semibold text-[#888] no-underline transition-colors hover:text-[#6b5bd2]"
        >
          더보기 ›
        </YeonLink>
      ) : null}
    </YeonView>
  );
}

function GameRow({ games }: { games: readonly GameEntry[] }) {
  return (
    <YeonView className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {games.map((game) => (
        <CompactCard key={game.slug} game={game} />
      ))}
    </YeonView>
  );
}

type GameServiceHomeProps =
  | {
      mode: "landing";
      region: GameRegion;
      featured: readonly GameEntry[];
      retro: readonly GameEntry[];
      popular: readonly GameEntry[];
    }
  | {
      mode: "grid";
      region: GameRegion;
      activeKey: string;
      heading: string;
      result: HubGamesResult;
    };

function PageShell({
  region,
  searchDefault,
  children,
}: {
  region: GameRegion;
  searchDefault?: string;
  children: ReactNode;
}) {
  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="game" />
      <YeonView
        as="main"
        className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5"
      >
        <YeonView className="flex flex-col gap-3">
          <YeonView className="flex flex-wrap items-center justify-between gap-2">
            <YeonView className="min-w-0">
              <YeonText
                as="h1"
                variant="unstyled"
                tone="inherit"
                className="text-[20px] font-black tracking-[-0.03em] text-[#111]"
              >
                바로 즐기는 게임 모음
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-0.5 text-[12px] leading-[1.5] text-[#888]"
              >
                설치 없이 브라우저에서 바로 플레이할 수 있어요!
              </YeonText>
            </YeonView>
            <SearchBar region={region} defaultValue={searchDefault} />
          </YeonView>
          <GamePointsBanner />
        </YeonView>
        {children}
      </YeonView>
    </YeonView>
  );
}

export function GameServiceHome(props: GameServiceHomeProps) {
  if (props.mode === "grid") {
    const { region, activeKey, heading, result } = props;
    return (
      <PageShell region={region} searchDefault={result.query ?? undefined}>
        <HubTabBar region={region} activeKey={activeKey} />
        <YeonView as="section" className="mt-4">
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[16px] font-black tracking-[-0.02em] text-[#111]"
          >
            {heading}
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="ml-2 text-[13px] font-semibold text-[#999]"
            >
              {result.totalCount}개
            </YeonText>
          </YeonText>
          {result.games.length > 0 ? (
            <YeonView className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {result.games.map((game) => (
                <CompactCard key={game.slug} game={game} />
              ))}
            </YeonView>
          ) : (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-10 text-center text-[14px] text-[#999]"
            >
              표시할 게임이 없습니다. 곧 추가될 예정이에요.
            </YeonText>
          )}
          <Pagination region={region} result={result} />
        </YeonView>
      </PageShell>
    );
  }

  const { region, featured, retro, popular } = props;
  const hero = featured[0];
  const featuredSide = featured.slice(1, 5);

  return (
    <PageShell region={region}>
      <HubTabBar region={region} activeKey="all" />

      <YeonView as="section" className="mt-4">
        <YeonView className="flex items-center justify-between">
          <SectionHeader
            icon="👍"
            title={GAME_REGION_LABELS[region]}
            moreHref={buildHubHref({ collection: "featured", region })}
          />
          <RegionToggle region={region} />
        </YeonView>
        {hero ? (
          <YeonView className="mt-2 grid gap-2.5 lg:grid-cols-[1.4fr_2fr]">
            <HeroCard game={hero} />
            <YeonView className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {featuredSide.map((game) => (
                <FeatureCard key={game.slug} game={game} />
              ))}
            </YeonView>
          </YeonView>
        ) : null}
      </YeonView>

      {retro.length > 0 ? (
        <YeonView as="section" className="mt-7">
          <SectionHeader
            icon="🎮"
            title="추억의 플래시 게임"
            moreHref={buildHubHref({ collection: "retro", region })}
          />
          <GameRow games={retro.slice(0, 6)} />
        </YeonView>
      ) : null}

      <YeonView as="section" className="mt-7">
        <SectionHeader
          icon="🔥"
          title="인기 게임"
          moreHref={buildHubHref({ collection: "popular", region })}
        />
        <GameRow games={popular.slice(0, 6)} />
      </YeonView>

      <YeonView className="mt-8 flex justify-center">
        <YeonLink
          href={buildHubHref({ view: "all", region })}
          className="inline-flex items-center gap-2 rounded-full border border-[#6b5bd2] bg-white px-6 py-3 text-[14px] font-bold text-[#6b5bd2] no-underline transition-colors duration-200 hover:bg-[#6b5bd2] hover:text-white"
        >
          🎮 전체 게임 보러가기 ›
        </YeonLink>
      </YeonView>
    </PageShell>
  );
}

function Pagination({
  region,
  result,
}: {
  region: GameRegion;
  result: HubGamesResult;
}) {
  if (result.totalPages <= 1) return null;

  const hasPrev = result.page > 1;
  const hasNext = result.page < result.totalPages;
  const baseParams: HubLinkParams = {
    region,
    category: result.category ?? undefined,
    collection: result.collection ?? undefined,
    query: result.query ?? undefined,
    view: result.category || result.collection ? undefined : "all",
  };

  return (
    <YeonView className="mt-6 flex items-center justify-center gap-4">
      <YeonLink
        href={buildHubHref({ ...baseParams, page: result.page - 1 })}
        aria-disabled={!hasPrev}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${
          hasPrev
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#6b5bd2]"
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
        href={buildHubHref({ ...baseParams, page: result.page + 1 })}
        aria-disabled={!hasNext}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${
          hasNext
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#6b5bd2]"
            : "pointer-events-none border-[#f0f0f0] bg-[#fafafa] text-[#bbb]"
        }`}
      >
        다음 →
      </YeonLink>
    </YeonView>
  );
}
