import { SLIME_GAME_ASSETS } from "./asset-manifest";
import type { GameState } from "./slime-game-state";
import {
  MAX_X,
  MIN_X,
  SPRITE_COLS,
  SPRITE_ROWS,
  SPRITE_VIEW_HEIGHT,
  SPRITE_VIEW_WIDTH,
  TRACK_WIDTH,
  slimeFrame,
} from "./slime-game-state";
import { SpriteSheet } from "./sprite-sheet";

const PREVIEW_FRAMES = [0, 1, 2, 3, 4, 5, 6] as const;

export function SlimeGameStage({
  state,
  onReset,
}: {
  state: GameState;
  onReset: () => void;
}) {
  const frame = slimeFrame(state);
  const directionText = state.facing === 1 ? "right" : "left";

  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-lime-300">
              Sprite movement only
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              슬라임 스프라이트 이동 검증
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
              배경, 몬스터, 체력, 점프, 공격은 모두 제거했습니다. 지금은 실제
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-lime-100">
                slime_hero_sheet.png
              </code>
              의 좌우 이동, 방향 반전, idle/walk 프레임만 봅니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="h-11 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
          >
            위치 초기화
          </button>
        </header>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/90 p-5 shadow-2xl shadow-black/40">
          <div className="mb-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-4">
            <StatusPill label="입력" value="A / D 또는 ← / →" />
            <StatusPill label="상태" value={state.motion} />
            <StatusPill label="방향" value={directionText} />
            <StatusPill label="프레임" value={`#${frame}`} />
          </div>

          <div
            className="relative mx-auto h-[340px] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{ width: TRACK_WIDTH }}
          >
            <div className="absolute inset-x-6 bottom-16 h-px bg-lime-300/70" />
            <div className="absolute bottom-12 left-6 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-200/80">
              min
            </div>
            <div className="absolute bottom-12 right-6 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-200/80">
              max
            </div>
            <div
              className="absolute bottom-16 rounded-full bg-lime-300/20"
              style={{
                left: MIN_X,
                width: MAX_X - MIN_X + SPRITE_VIEW_WIDTH,
                height: 2,
              }}
            />
            <SpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SPRITE_COLS}
              rows={SPRITE_ROWS}
              frame={frame}
              className="absolute bottom-16 drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              style={{
                left: state.x,
                width: SPRITE_VIEW_WIDTH,
                height: SPRITE_VIEW_HEIGHT,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />
            <div
              className="absolute bottom-8 h-3 rounded-full bg-lime-300/40 blur-sm"
              style={{
                left: state.x + SPRITE_VIEW_WIDTH * 0.24,
                width: SPRITE_VIEW_WIDTH * 0.52,
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/80 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white">프레임 확인</h2>
              <p className="mt-1 text-sm text-neutral-400">
                idle은 0~2, walk는 3~6만 사용합니다. 초록 테두리가 현재
                프레임입니다.
              </p>
            </div>
            <span className="rounded-full bg-lime-300/15 px-3 py-1 text-xs font-bold text-lime-200">
              x {Math.round(state.x)}px
            </span>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {PREVIEW_FRAMES.map((previewFrame) => (
              <div
                key={previewFrame}
                className={`rounded-2xl border p-2 ${
                  previewFrame === frame
                    ? "border-lime-300 bg-lime-300/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <SpriteSheet
                  src={SLIME_GAME_ASSETS.slimeHero}
                  cols={SPRITE_COLS}
                  rows={SPRITE_ROWS}
                  frame={previewFrame}
                  className="mx-auto"
                  style={{ width: 72, height: 86 }}
                />
                <p className="mt-2 text-center text-xs font-bold text-neutral-300">
                  #{previewFrame}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}
