"use client";
import { useRef, useState } from "react";
import { YeonButton, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { GAME_CATEGORY_LABELS, type GameEntry } from "./game-catalog";

// 외부 임베드 게임은 신뢰 경계가 다르므로 최소 권한만 부여한다.
// GameMonetize html5 게임은 광고 팝업·저장소·포인터락이 필요할 수 있어 아래로 정합화한다.
const GAME_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-forms allow-orientation-lock";
const GAME_IFRAME_ALLOW =
  "fullscreen; gamepad; autoplay; clipboard-write; cross-origin-isolated";

export function GameDetail({ game }: { game: GameEntry }) {
  // 처음엔 iframe을 로드하지 않고 썸네일 포스터만 띄운다. 사용자가 "게임 시작"을
  // 눌러야(=user gesture) 로드 + 전체화면 진입 → FPS류의 pointer-lock 흔들림을 막는다.
  const [started, setStarted] = useState(false);
  const playAreaRef = useRef<HTMLDivElement>(null);

  // 전체화면은 iframe을 담은 컨테이너에 건다. 풀 뷰포트에서 pointer lock이 안정적으로
  // 잡혀야 마우스가 경계를 벗어나며 카메라가 튀는 현상이 사라진다.
  const requestFullscreen = () => {
    playAreaRef.current?.requestFullscreen?.().catch(() => {
      // 전체화면이 거부돼도 인라인 플레이는 유지된다.
    });
  };

  const handleStart = () => {
    setStarted(true);
    requestFullscreen();
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
          ref={playAreaRef}
          className={`relative mt-5 w-full overflow-hidden rounded-2xl border border-[#e5e5e5] bg-black ${aspectClass}`}
        >
          {started ? (
            <iframe
              src={game.embedUrl}
              title={game.title}
              sandbox={GAME_IFRAME_SANDBOX}
              allow={GAME_IFRAME_ALLOW}
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center"
              style={{ backgroundImage: `url("${game.thumbUrl}")` }}
              aria-label={`${game.title} 게임 시작`}
            >
              <span className="absolute inset-0 bg-black/45 transition-colors duration-200 group-hover:bg-black/30" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[26px] text-[#111] shadow-lg transition-transform duration-200 group-hover:scale-105">
                ▶
              </span>
              <span className="relative rounded-full bg-white/90 px-4 py-1.5 text-[13px] font-bold text-[#111]">
                게임 시작
              </span>
            </button>
          )}
        </YeonView>

        <YeonView className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] leading-[1.6] text-[#999]"
          >
            게임이 보이지 않으면{" "}
            <YeonLink
              href={game.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={SHARED_FEATURE_CLASS.text13Emphasis}
            >
              새 탭에서 열기
            </YeonLink>
          </YeonText>
          {started ? (
            <YeonButton
              type="button"
              variant="secondary"
              onClick={requestFullscreen}
            >
              전체화면
            </YeonButton>
          ) : null}
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
