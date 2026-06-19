"use client";
import { useRef } from "react";
import { YeonButton, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { GAME_CATEGORY_LABELS, type GameEntry } from "./game-catalog";

// 외부 임베드 게임은 신뢰 경계가 다르므로 최소 권한만 부여한다.
const GAME_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms";
const GAME_IFRAME_ALLOW = "fullscreen; gamepad; autoplay; clipboard-write";

export function GameDetail({ game }: { game: GameEntry }) {
  const frameWrapperRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    frameWrapperRef.current?.requestFullscreen?.().catch(() => {
      // 전체화면이 거부되어도 인라인 플레이는 유지된다.
    });
  };

  const aspectClass =
    game.orientation === "portrait" ? "aspect-[3/4]" : "aspect-video";

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="game" />

      <YeonView
        as="main"
        className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 md:px-10 md:py-8"
      >
        <YeonLink
          href="/game-service"
          className={`inline-flex items-center gap-1.5 no-underline ${SHARED_FEATURE_CLASS.text13Emphasis}`}
        >
          ← 게임 목록
        </YeonLink>

        <YeonView as="header" className="mt-4">
          <YeonView className="flex flex-wrap items-center gap-2">
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="text-[24px] font-black tracking-[-0.04em] text-[#111] md:text-[30px]"
            >
              {game.title}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[11px] font-medium text-[#666]"
            >
              {GAME_CATEGORY_LABELS[game.category]}
            </YeonText>
          </YeonView>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[14px] leading-[1.75] text-[#666] md:text-[15px]"
          >
            {game.summary}
          </YeonText>
        </YeonView>

        <YeonView
          ref={frameWrapperRef}
          className={`relative mt-5 w-full overflow-hidden rounded-2xl border border-[#e5e5e5] bg-black ${aspectClass}`}
        >
          <iframe
            src={game.embedUrl}
            title={game.title}
            sandbox={GAME_IFRAME_SANDBOX}
            allow={GAME_IFRAME_ALLOW}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full border-0"
          />
        </YeonView>

        <YeonView className="mt-4 flex justify-end">
          <YeonButton
            type="button"
            variant="secondary"
            onClick={handleFullscreen}
          >
            전체화면
          </YeonButton>
        </YeonView>

        <YeonView
          as="section"
          className="mt-8 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5"
        >
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[16px] font-bold text-[#111]"
          >
            게임 소개
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-3 break-keep text-[14px] leading-[1.85] text-[#444]"
          >
            {game.description}
          </YeonText>

          <YeonText
            as="h3"
            variant="unstyled"
            tone="inherit"
            className="mt-6 text-[14px] font-bold text-[#111]"
          >
            조작법
          </YeonText>
          <ul className="mt-2 flex flex-col gap-1.5">
            {game.controls.map((control) => (
              <li
                key={control}
                className="text-[13px] leading-[1.7] text-[#666]"
              >
                · {control}
              </li>
            ))}
          </ul>

          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-6 text-[12px] leading-[1.6] text-[#999]"
          >
            출처: {game.provider}
          </YeonText>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
