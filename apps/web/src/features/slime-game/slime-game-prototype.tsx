"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SHEET_ASSET_MANIFEST } from "./asset-manifest";
import { AssetUseCard } from "./asset-use-card";
import type { Keys } from "./slime-game-state";
import { INITIAL_STATE, nextState } from "./slime-game-state";
import { SlimeGameStage } from "./slime-game-stage";

export function SlimeGamePrototype() {
  const [state, setState] = useState(INITIAL_STATE);
  const keysRef = useRef<Keys>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(
          event.code
        )
      )
        event.preventDefault();
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => nextState(prev, keysRef.current));
    }, 1000 / 30);
    return () => window.clearInterval(timer);
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-600">
              Slime Asset Game
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              슬라임 에셋 실사용 프로토타입
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              manifest에 근거가 있는 시트만 사용합니다. 캐릭터, 맵, props, 포탈,
              이펙트, UI를 분리하고 각 이미지를 실제 게임 상태에 연결했습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5"
          >
            다시 시작
          </button>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <SlimeGameStage state={state} />
          <ControlsPanel />
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-black">에셋 사용 근거</h2>
            <p className="mt-1 text-sm text-slate-600">
              모든 이미지는 아래 사용처가 있는 경우에만 포함했습니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SHEET_ASSET_MANIFEST.map((asset) => (
              <AssetUseCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ControlsPanel() {
  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <h2 className="text-lg font-black">조작</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <ControlKeys keys="← → / A D" desc="이동: walk 프레임" />
        <ControlKeys keys="Space" desc="점프: jump/fall 프레임" />
        <ControlKeys keys="↑ ↓ / W S" desc="사다리: climb_back 프레임" />
        <ControlKeys keys="J" desc="근접공격 + slash/hit 이펙트" />
        <ControlKeys keys="K" desc="원거리 cast + projectile 이펙트" />
      </dl>
      <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-800">
        목표: 코인을 먹고, 초록 슬라임과 전투한 뒤 박쥐/버섯 몬스터가 배치된
        맵을 지나 오른쪽 포탈에 들어가세요.
      </div>
    </aside>
  );
}

function ControlKeys({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div>
      <dt className="font-black">{keys}</dt>
      <dd className="text-slate-600">{desc}</dd>
    </div>
  );
}
