"use client";

import { SLIME_GAME_ASSETS } from "./asset-manifest";
import {
  INITIAL_COLLISION_STATE,
  SLIME_COLLISION_SOLIDS,
  SLIME_COLLISION_STAGE,
  getCollisionPlayerRect,
  getCollisionSpriteStyle,
  nextCollisionState,
} from "./slime-collision-domain";
import { SLIME_CONTROLS, SLIME_SPRITE_SHEET } from "./slime-game-domain";
import { SpriteSheet } from "./sprite-sheet";
import { useSpriteValidationRuntime } from "./use-sprite-validation-runtime";

export function SlimeCollisionValidationRuntime() {
  const { reset, state, triggerControl } = useSpriteValidationRuntime({
    controls: SLIME_CONTROLS,
    initialState: INITIAL_COLLISION_STATE,
    reduce: nextCollisionState,
  });
  const playerRect = getCollisionPlayerRect(state);
  const spriteStyle = getCollisionSpriteStyle(state);
  const collisionSummary = [
    state.contacts.left ? "left" : null,
    state.contacts.right ? "right" : null,
    state.contacts.ground ? "ground" : null,
    state.contacts.ceiling ? "ceiling" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-sky-300">
              Page 2 · AABB collision test
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              슬라임 지형 충돌 검증
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
              같은 입력 런타임 위에서 바닥, 벽, 발판, 천장 충돌을 순수 AABB
              모듈로 계산합니다. 디버그 박스가 실제 판정 source of truth입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => triggerControl("jump")}
              data-testid="slime-collision-jump"
              className="h-11 rounded-full border border-sky-300/25 bg-sky-300/10 px-5 text-sm font-bold text-sky-100 transition hover:bg-sky-300/15"
            >
              점프 충돌 테스트
            </button>
            <button
              type="button"
              onClick={reset}
              data-testid="slime-collision-reset"
              className="h-11 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
            >
              위치 초기화
            </button>
          </div>
        </header>

        <div className="grid gap-3 text-sm text-neutral-300 lg:grid-cols-5">
          <StatusPill label="조작" value="A/D · ←/→ · Space" />
          <StatusPill
            label="grounded"
            value={state.grounded ? "true" : "false"}
            valueTestId="slime-collision-grounded"
          />
          <StatusPill
            label="contacts"
            value={collisionSummary || "none"}
            valueTestId="slime-collision-contacts"
          />
          <StatusPill label="surface" value={state.lastSurfaceId ?? "air"} />
          <StatusPill
            label="velocity"
            value={`${state.velocityX.toFixed(1)}, ${state.velocityY.toFixed(1)}`}
          />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/90 p-5 shadow-2xl shadow-black/40">
          <div
            data-testid="slime-collision-stage"
            className="relative mx-auto overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(125,211,252,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{
              width: SLIME_COLLISION_STAGE.width,
              height: SLIME_COLLISION_STAGE.height,
            }}
          >
            {SLIME_COLLISION_SOLIDS.map((solid) => (
              <div
                key={solid.id}
                className={solidClassName(solid.kind)}
                style={{
                  left: solid.x,
                  top: solid.y,
                  width: solid.width,
                  height: solid.height,
                }}
              >
                <span className="absolute left-2 top-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
                  {solid.label}
                </span>
              </div>
            ))}

            <SpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={state.grounded ? 0 : state.velocityY < 0 ? 7 : 8}
              className="absolute z-20 drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              style={{
                left: spriteStyle.left,
                top: spriteStyle.top,
                width: spriteStyle.width,
                height: spriteStyle.height,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />

            <div
              data-testid="slime-collision-player-body"
              className="absolute z-30 border-2 border-lime-300/90 bg-lime-300/10"
              style={{
                left: playerRect.x,
                top: playerRect.y,
                width: playerRect.width,
                height: playerRect.height,
              }}
            />
          </div>
        </div>

        <div
          data-testid="slime-collision-state"
          className="rounded-3xl border border-white/10 bg-neutral-900/80 p-5 text-sm leading-7 text-neutral-300"
        >
          <p className="font-black text-white">검증 기준</p>
          <p>
            플레이어 body가 초록 디버그 박스이며, 모든 지형 충돌은
            `slime-collision-domain.ts`의 AABB 계산 결과만 표시합니다.
          </p>
          <p>
            현재 좌표 x {Math.round(state.x)} · y {Math.round(state.y)} · tick{" "}
            {state.tick}
          </p>
        </div>
      </div>
    </section>
  );
}

function solidClassName(kind: string) {
  if (kind === "wall") {
    return "absolute border border-sky-300/35 bg-sky-400/20";
  }
  if (kind === "ceiling") {
    return "absolute border border-fuchsia-300/35 bg-fuchsia-400/20";
  }
  if (kind === "platform") {
    return "absolute border border-amber-300/40 bg-amber-400/20";
  }
  return "absolute border border-emerald-300/40 bg-emerald-400/20";
}

function StatusPill({
  label,
  value,
  valueTestId,
}: {
  label: string;
  value: string;
  valueTestId?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
      <p data-testid={valueTestId} className="mt-1 font-black text-white">
        {value}
      </p>
    </div>
  );
}
