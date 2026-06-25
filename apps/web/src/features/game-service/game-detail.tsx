"use client";
import { useRef, useState } from "react";
import { YeonButton, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { GAME_CATEGORY_LABELS, type GameEntry } from "./game-catalog";
import { RuffleGamePlayer } from "./ruffle-game-player";

// 외부 임베드 게임은 신뢰 경계가 다르므로 최소 권한만 부여한다.
// GameMonetize html5 게임은 광고 팝업·저장소·포인터락이 필요할 수 있어 아래로 정합화한다.
const GAME_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-forms allow-orientation-lock";
// allow에는 임베드 게임을 깨뜨리는 토큰을 넣지 않는다(실측 기반):
// - cross-origin-isolated: iframe에 COEP(require-corp)를 강제해, 외부 도메인 에셋을
//   CORP 헤더 없이 불러오는 게임(snake.io 등)을 흰 화면으로 만든다.
// - gamepad: sandbox iframe과 함께 주면 snake.io처럼 중첩 외부 iframe으로 구성된
//   CrazyGames 게임이 로드되지 않고 흰 화면이 된다.
const GAME_IFRAME_ALLOW = "fullscreen; autoplay; clipboard-write";

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
    // 게임 플레이 경험치 적립(인증 사용자, 게임당 하루 1회 멱등은 서버가 보장).
    // 실패해도 플레이엔 영향이 없도록 fire-and-forget로 호출한다.
    void fetch("/api/v1/game-service/play", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gameSlug: game.slug }),
    }).catch(() => {
      // 적립 실패는 무시한다.
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
          ref={playAreaRef}
          className={`relative mt-5 w-full overflow-hidden rounded-2xl border border-[#e5e5e5] bg-black ${aspectClass}`}
        >
          {started ? (
            game.kind === "swf" ? (
              <RuffleGamePlayer swfUrl={game.embedUrl} title={game.title} />
            ) : (
              <iframe
                src={game.embedUrl}
                title={game.title}
                sandbox={GAME_IFRAME_SANDBOX}
                allow={GAME_IFRAME_ALLOW}
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            )
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center"
              style={
                game.thumbUrl
                  ? { backgroundImage: `url("${game.thumbUrl}")` }
                  : undefined
              }
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
            {game.kind === "swf" ? (
              // 호스팅 SWF는 Ruffle로만 재생한다. 원본 파일 링크를 노출하지 않아
              // 무심코 다운로드되는 일을 막는다. 용량이 커 로딩이 걸릴 수 있음을 안내한다.
              "용량이 큰 추억의 플래시 게임입니다. 처음 불러올 때 잠시 기다려 주세요."
            ) : (
              <>
                게임이 보이지 않으면{" "}
                <YeonLink
                  href={game.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SHARED_FEATURE_CLASS.text13Emphasis}
                >
                  새 탭에서 열기
                </YeonLink>
              </>
            )}
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
            className="mt-3 whitespace-pre-line break-keep text-[14px] leading-[1.85] text-[#444]"
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
