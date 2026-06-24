"use client";
import { useEffect, useRef } from "react";

// Ruffle(오픈소스 Flash 에뮬레이터)로 SWF를 브라우저에서 실행한다. 허락받은 추억의
// 플래시 게임(kind: "swf")만 이 경로로 렌더한다. 외부 임베드(iframe)와 달리 우리가
// 직접 호스팅한 SWF를 Ruffle로 구동하므로 sitelock/흰화면 이슈가 없다.
//
// Ruffle은 공식 CDN(unpkg)에서 로드한다. self-host 전환은 백로그(게임 허브 큐레이션 3차).

// Ruffle 공식 배포는 nightly 빌드만 제공하므로 latest 태그를 사용한다.
const RUFFLE_CDN_URL = "https://unpkg.com/@ruffle-rs/ruffle";
const RUFFLE_SCRIPT_SELECTOR = "script[data-ruffle-loader]";

type RufflePlayerElement = HTMLElement & {
  load: (options: { url: string }) => Promise<void>;
};

type RuffleApi = {
  newest: () => { createPlayer: () => RufflePlayerElement } | null;
};

declare global {
  interface Window {
    RufflePlayer?: RuffleApi;
  }
}

function ensureRuffleScript(): HTMLScriptElement {
  const existing = document.querySelector<HTMLScriptElement>(
    RUFFLE_SCRIPT_SELECTOR
  );
  if (existing) return existing;

  const script = document.createElement("script");
  script.src = RUFFLE_CDN_URL;
  script.async = true;
  script.dataset.ruffleLoader = "true";
  document.body.appendChild(script);
  return script;
}

export function RuffleGamePlayer({
  swfUrl,
  title,
}: {
  swfUrl: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let player: RufflePlayerElement | null = null;

    function startPlayer() {
      if (cancelled || !containerRef.current || !window.RufflePlayer) return;
      const ruffle = window.RufflePlayer.newest();
      if (!ruffle) return;
      player = ruffle.createPlayer();
      player.style.width = "100%";
      player.style.height = "100%";
      containerRef.current.appendChild(player);
      player.load({ url: swfUrl }).catch(() => {
        // 로드 실패 시 fallback 안내(상세 페이지의 "새 탭에서 열기")로 유도한다.
      });
    }

    if (window.RufflePlayer) {
      startPlayer();
    } else {
      const script = ensureRuffleScript();
      script.addEventListener("load", startPlayer, { once: true });
    }

    return () => {
      cancelled = true;
      player?.remove();
    };
  }, [swfUrl]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      aria-label={title}
    />
  );
}
