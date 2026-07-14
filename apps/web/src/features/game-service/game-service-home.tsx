import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { ProductPageHeader } from "@/components/product-shell/product-page-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import {
  GAME_REGIONS,
  type GameHubTab,
  type GameEntry,
  type GameRegion,
} from "./game-catalog";
import {
  getGameServiceText,
  getLocalizedGameHubTabs,
  getLocalizedGameRegionLabel,
  getLocalizedGameTags,
  getLocalizedGameText,
  type GameServiceLanguage,
} from "./game-service-i18n";
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
  language: GameServiceLanguage;
};

function buildHubHref({
  category,
  collection,
  view,
  query,
  page,
  region,
  language,
}: HubLinkParams): string {
  const params = new URLSearchParams();
  params.set("lang", language);
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
function hrefForTab(
  tab: GameHubTab,
  region: GameRegion,
  language: GameServiceLanguage
): string {
  if (tab.type === "collection") {
    return buildHubHref({ collection: tab.collection, region, language });
  }
  if (tab.type === "category") {
    return buildHubHref({ category: tab.category, region, language });
  }
  return buildHubHref({ region, language });
}

function buildGameDetailHref(game: GameEntry, language: GameServiceLanguage) {
  return `/game-service/${game.slug}?lang=${language}`;
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
          className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2 py-0.5 text-[10px] font-semibold text-[#666]"
        >
          {tag}
        </YeonText>
      ))}
    </YeonView>
  );
}

function PlayPill({ label }: { label: string }) {
  return (
    <YeonText
      as="span"
      variant="unstyled"
      tone="inherit"
      className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#111] transition-colors duration-200 group-hover:border-[#111]"
    >
      ▶ {label}
    </YeonText>
  );
}

// 운영자 추천 히어로(좌측 큰 카드). 썸네일을 배경으로 깔고 정보를 얹는다.
function HeroCard({
  game,
  language,
}: {
  game: GameEntry;
  language: GameServiceLanguage;
}) {
  const text = getGameServiceText(language);
  const gameText = getLocalizedGameText(game, language);
  return (
    <YeonLink
      href={buildGameDetailHref(game, language)}
      className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#111] bg-cover bg-center p-5 text-left no-underline md:min-h-[300px]"
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
        className="relative inline-flex w-fit items-center rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-[#111]"
      >
        {text.featuredBadge}
      </YeonText>
      <YeonText
        as="h3"
        variant="unstyled"
        tone="inherit"
        className="relative mt-2 text-[24px] font-black tracking-[-0.03em] text-white md:text-[28px]"
      >
        {gameText.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="relative mt-1 max-w-[420px] text-[13px] leading-[1.6] text-white/85"
      >
        {gameText.summary}
      </YeonText>
      <YeonView className="relative mt-3 flex items-center justify-between">
        <YeonView className="flex flex-wrap gap-1">
          {getLocalizedGameTags(game, language)
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
          className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-[#111] transition-transform duration-200 group-hover:scale-105"
        >
          ▶ {text.playLabel}
        </YeonText>
      </YeonView>
    </YeonLink>
  );
}

// 운영자 추천 우측 카드(썸네일 + 제목 + 요약 + 태그 + 플레이).
function FeatureCard({
  game,
  language,
}: {
  game: GameEntry;
  language: GameServiceLanguage;
}) {
  const text = getGameServiceText(language);
  const gameText = getLocalizedGameText(game, language);
  return (
    <YeonLink
      href={buildGameDetailHref(game, language)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-left no-underline transition-colors duration-200 hover:border-[#111]"
    >
      <YeonView
        className="aspect-video w-full bg-[#fafafa] bg-cover bg-center"
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
          {gameText.title}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="line-clamp-2 text-[12px] leading-[1.5] text-[#666]"
        >
          {gameText.summary}
        </YeonText>
        <TagChips tags={getLocalizedGameTags(game, language)} />
        <YeonView className="mt-1">
          <PlayPill label={text.playLabel} />
        </YeonView>
      </YeonView>
    </YeonLink>
  );
}

// 행/그리드 공용 컴팩트 카드(썸네일 + 제목 + 태그).
function CompactCard({
  game,
  language,
}: {
  game: GameEntry;
  language: GameServiceLanguage;
}) {
  const gameText = getLocalizedGameText(game, language);
  return (
    <YeonLink
      href={buildGameDetailHref(game, language)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-left no-underline transition-colors duration-200 hover:border-[#111]"
    >
      <YeonView
        className="aspect-video w-full bg-[#fafafa] bg-cover bg-center"
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
          {gameText.title}
        </YeonText>
        <TagChips tags={getLocalizedGameTags(game, language)} />
      </YeonView>
    </YeonLink>
  );
}

function RegionToggle({
  region,
  language,
}: {
  region: GameRegion;
  language: GameServiceLanguage;
}) {
  const tabs: { key: GameRegion; label: string }[] = [
    {
      key: GAME_REGIONS.kr,
      label: getLocalizedGameRegionLabel(GAME_REGIONS.kr, language),
    },
    {
      key: GAME_REGIONS.us,
      label: getLocalizedGameRegionLabel(GAME_REGIONS.us, language),
    },
  ];
  return (
    <YeonView className="flex gap-1.5">
      {tabs.map((tab) => {
        const isActive = region === tab.key;
        return (
          <YeonLink
            key={tab.key}
            href={buildHubHref({ region: tab.key, language })}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold no-underline transition-colors duration-200 ${
              isActive
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
            }`}
          >
            {tab.label}
          </YeonLink>
        );
      })}
    </YeonView>
  );
}

// 카테고리 탭 바. activeKey와 일치하는 탭만 강조한다.
function HubTabBar({
  region,
  activeKey,
  language,
}: {
  region: GameRegion;
  activeKey: string;
  language: GameServiceLanguage;
}) {
  return (
    <YeonView className="mt-3 flex flex-wrap gap-1.5 border-b border-[#e5e5e5] pb-3">
      {getLocalizedGameHubTabs(language).map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <YeonLink
            key={tab.key}
            href={hrefForTab(tab, region, language)}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold no-underline transition-colors duration-200 ${
              isActive
                ? "bg-[#111] text-white"
                : "text-[#666] hover:bg-[#fafafa] hover:text-[#111]"
            }`}
          >
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
  language,
  text,
}: {
  region: GameRegion;
  defaultValue?: string;
  language: GameServiceLanguage;
  text: ReturnType<typeof getGameServiceText>;
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
      <input type="hidden" name="lang" value={language} />
      <input type="hidden" name="view" value="all" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={text.searchPlaceholder}
        aria-label={text.searchLabel}
        className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 pr-10 text-[13px] text-[#111] outline-none transition-colors focus:border-[#111] focus:bg-white"
      />
      <button
        type="submit"
        aria-label={text.searchSubmitLabel}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] transition-colors hover:text-[#111]"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}

function SectionHeader({
  title,
  moreHref,
  moreLabel,
}: {
  title: string;
  moreHref?: string;
  moreLabel: string;
}) {
  return (
    <YeonView className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="flex items-center gap-2 text-[16px] font-black tracking-[-0.02em] text-[#111]"
      >
        <span
          aria-hidden="true"
          className="inline-block h-[16px] w-[3px] rounded-full bg-[#111]"
        />
        {title}
      </YeonText>
      {moreHref ? (
        <YeonLink
          href={moreHref}
          className="text-[12px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
        >
          {moreLabel} ›
        </YeonLink>
      ) : null}
    </YeonView>
  );
}

function GameRow({
  games,
  language,
}: {
  games: readonly GameEntry[];
  language: GameServiceLanguage;
}) {
  return (
    <YeonView className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {games.map((game) => (
        <CompactCard key={game.slug} game={game} language={language} />
      ))}
    </YeonView>
  );
}

type GameServiceHomeProps =
  | {
      mode: "landing";
      region: GameRegion;
      language: GameServiceLanguage;
      featured: readonly GameEntry[];
      retro: readonly GameEntry[];
      popular: readonly GameEntry[];
      favorites: readonly GameEntry[];
      recent: readonly GameEntry[];
    }
  | {
      mode: "grid";
      region: GameRegion;
      language: GameServiceLanguage;
      activeKey: string;
      heading: string;
      result: HubGamesResult;
    };

function PageShell({
  region,
  searchDefault,
  language,
  children,
}: {
  region: GameRegion;
  searchDefault?: string;
  language: GameServiceLanguage;
  children: ReactNode;
}) {
  const text = getGameServiceText(language);

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader
        activeService="game"
        ariaLabel={text.navAriaLabel}
        brandLabel={text.headerBrand}
        initialLanguage={language}
        profileLabels={text.profileMenu}
      />
      <YeonView
        as="main"
        className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5"
      >
        <YeonView className="flex flex-col gap-3">
          <ProductPageHeader
            title={text.heroTitle}
            description={text.heroDescription}
            trailingClassName="w-full lg:w-[520px]"
            trailing={
              <SearchBar
                region={region}
                language={language}
                defaultValue={searchDefault}
                text={text}
              />
            }
          />
          <GamePointsBanner language={language} />
        </YeonView>
        {children}
      </YeonView>
    </YeonView>
  );
}

export function GameServiceHome(props: GameServiceHomeProps) {
  if (props.mode === "grid") {
    const { region, activeKey, heading, result, language } = props;
    const text = getGameServiceText(language);
    return (
      <PageShell
        region={region}
        language={language}
        searchDefault={result.query ?? undefined}
      >
        <HubTabBar region={region} activeKey={activeKey} language={language} />
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
              className="ml-2 text-[13px] font-semibold text-[#666]"
            >
              {text.count(result.totalCount)}
            </YeonText>
          </YeonText>
          {result.games.length > 0 ? (
            <YeonView className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {result.games.map((game) => (
                <CompactCard key={game.slug} game={game} language={language} />
              ))}
            </YeonView>
          ) : (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-10 text-center text-[14px] text-[#666]"
            >
              {text.empty}
            </YeonText>
          )}
          <Pagination region={region} language={language} result={result} />
        </YeonView>
      </PageShell>
    );
  }

  const { region, featured, retro, popular, favorites, recent, language } =
    props;
  const text = getGameServiceText(language);
  const hero = featured[0];
  const featuredSide = featured.slice(1, 5);

  return (
    <PageShell region={region} language={language}>
      <HubTabBar region={region} activeKey="all" language={language} />

      {recent.length > 0 ? (
        <YeonView as="section" className="mt-4">
          <SectionHeader title={text.recent} moreLabel={text.more} />
          <GameRow games={recent.slice(0, 6)} language={language} />
        </YeonView>
      ) : null}

      {favorites.length > 0 ? (
        <YeonView as="section" className="mt-7">
          <SectionHeader title={text.favorites} moreLabel={text.more} />
          <GameRow games={favorites.slice(0, 6)} language={language} />
        </YeonView>
      ) : null}

      <YeonView as="section" className="mt-4">
        <YeonView className="flex items-center justify-between">
          <SectionHeader
            title={text.featured}
            moreLabel={text.more}
            moreHref={buildHubHref({
              collection: "featured",
              region,
              language,
            })}
          />
          <RegionToggle region={region} language={language} />
        </YeonView>
        {hero ? (
          <YeonView className="mt-2 grid gap-2.5 lg:grid-cols-[1.4fr_2fr]">
            <HeroCard game={hero} language={language} />
            <YeonView className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {featuredSide.map((game) => (
                <FeatureCard key={game.slug} game={game} language={language} />
              ))}
            </YeonView>
          </YeonView>
        ) : null}
      </YeonView>

      {retro.length > 0 ? (
        <YeonView as="section" className="mt-7">
          <SectionHeader
            title={text.retro}
            moreLabel={text.more}
            moreHref={buildHubHref({ collection: "retro", region, language })}
          />
          <GameRow games={retro.slice(0, 6)} language={language} />
        </YeonView>
      ) : null}

      <YeonView as="section" className="mt-7">
        <SectionHeader
          title={text.popular}
          moreLabel={text.more}
          moreHref={buildHubHref({ collection: "popular", region, language })}
        />
        <GameRow games={popular.slice(0, 6)} language={language} />
      </YeonView>

      <YeonView className="mt-8 flex justify-center">
        <YeonLink
          href={buildHubHref({ view: "all", region, language })}
          className="inline-flex items-center gap-2 rounded-full border border-[#111] bg-white px-6 py-3 text-[14px] font-bold text-[#111] no-underline transition-colors duration-200 hover:bg-[#111] hover:text-white"
        >
          {text.viewAll} ›
        </YeonLink>
      </YeonView>
    </PageShell>
  );
}

function Pagination({
  region,
  language,
  result,
}: {
  region: GameRegion;
  language: GameServiceLanguage;
  result: HubGamesResult;
}) {
  if (result.totalPages <= 1) return null;

  const hasPrev = result.page > 1;
  const hasNext = result.page < result.totalPages;
  const baseParams: HubLinkParams = {
    region,
    language,
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
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
            : "pointer-events-none border-[#e5e5e5] bg-[#fafafa] text-[#aaa]"
        }`}
      >
        ← {getGameServiceText(language).previous}
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
            ? "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
            : "pointer-events-none border-[#e5e5e5] bg-[#fafafa] text-[#aaa]"
        }`}
      >
        {getGameServiceText(language).next} →
      </YeonLink>
    </YeonView>
  );
}
