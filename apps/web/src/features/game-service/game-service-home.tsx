"use client";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import {
  GAME_CATEGORY_LABELS,
  getListedGames,
  type GameEntry,
} from "./game-catalog";

function GameCard({ game }: { game: GameEntry }) {
  return (
    <YeonLink
      href={`/game-service/${game.slug}`}
      className="group flex min-w-0 flex-col rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-left no-underline shadow-sm transition-colors duration-200 hover:border-[#111] hover:bg-white"
    >
      <YeonView className="flex items-start justify-between gap-3">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#666]"
        >
          {GAME_CATEGORY_LABELS[game.category]}
        </YeonText>
      </YeonView>
      <YeonView className="mt-4">
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="text-[20px] font-semibold tracking-[-0.03em] text-[#111]"
        >
          {game.title}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-3 break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8]`}
        >
          {game.summary}
        </YeonText>
      </YeonView>
      <YeonView className="mt-auto flex items-center border-t border-[#e5e5e5] pt-4">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={`inline-flex items-center gap-1.5 ${SHARED_FEATURE_CLASS.text13Emphasis}`}
        >
          플레이
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </YeonText>
        </YeonText>
      </YeonView>
    </YeonLink>
  );
}

export function GameServiceHome() {
  const games = getListedGames();

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

        <YeonView
          as="section"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
