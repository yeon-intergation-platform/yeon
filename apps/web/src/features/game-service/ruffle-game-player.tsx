"use client";
import { useEffect, useRef, useState } from "react";

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
  // SWF는 용량이 커(수 MB~수십 MB) 로딩 동안 검은 화면만 보이면 고장처럼 느껴진다.
  // 로드가 끝날 때까지 "불러오는 중" 오버레이를 덮어 진행 상태를 알린다.
  const [loading, setLoading] = useState(true);

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
      player
        .load({ url: swfUrl })
        .then(() => {
          if (!cancelled) setLoading(false);
        })
        .catch(() => {
          // 로드 실패 시에도 오버레이는 걷어 게임 화면(또는 Ruffle 자체 안내)을 보여준다.
          if (!cancelled) setLoading(false);
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
    <div className="absolute inset-0 h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        aria-label={title}
      />
      {loading ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span className="text-[13px] font-medium text-white/85">
            게임을 불러오는 중...
          </span>
          <span className="text-[11px] text-white/55">
            용량이 커서 잠시 걸릴 수 있어요
          </span>
        </div>
      ) : null}
    </div>
  );
}
