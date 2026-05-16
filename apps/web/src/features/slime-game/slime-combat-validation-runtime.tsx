"use client";

import { SLIME_GAME_ASSETS } from "./asset-manifest";
import {
  INITIAL_COMBAT_STATE,
  SLIME_COMBAT_STAGE,
  combatFrame,
  getCombatAttackHitbox,
  getCombatEnemyHurtbox,
  getCombatPlayerBody,
  isCombatAttackActive,
  nextCombatState,
} from "./slime-combat-domain";
import { SLIME_CONTROLS, SLIME_SPRITE_SHEET } from "./slime-game-domain";
import { SpriteSheet } from "./sprite-sheet";
import { useSpriteValidationRuntime } from "./use-sprite-validation-runtime";

export function SlimeCombatValidationRuntime() {
  const { reset, state, triggerControl } = useSpriteValidationRuntime({
    controls: SLIME_CONTROLS,
    initialState: INITIAL_COMBAT_STATE,
    reduce: nextCombatState,
  });
  const playerBody = getCombatPlayerBody(state);
  const enemyHurtbox = getCombatEnemyHurtbox(state.enemy);
  const attackHitbox = getCombatAttackHitbox(state);
  const isAttackActive = isCombatAttackActive(state);
  const frame = combatFrame(state);
  const hpPercent = Math.max(
    0,
    Math.round((state.enemy.hp / state.enemy.maxHp) * 100)
  );

  return (
    <section className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-rose-300">
              Page 3 · Hitbox combat test
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              슬라임 히트박스·피해 판정 검증
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
              attack action의 active frame에서만 주황 hitbox를 켜고, 초록 슬라임
              hurtbox와 겹칠 때 한 공격당 한 번만 HP를 줄입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => triggerControl("attack")}
              data-testid="slime-combat-attack"
              className="h-11 rounded-full border border-rose-300/25 bg-rose-300/10 px-5 text-sm font-bold text-rose-100 transition hover:bg-rose-300/15"
            >
              J 공격 판정 테스트
            </button>
            <button
              type="button"
              onClick={reset}
              data-testid="slime-combat-reset"
              className="h-11 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
            >
              전투 초기화
            </button>
          </div>
        </header>

        <div className="grid gap-3 text-sm text-neutral-300 lg:grid-cols-5">
          <StatusPill label="조작" value="A/D · ←/→ · J" />
          <StatusPill
            label="active"
            value={isAttackActive ? "true" : "false"}
            valueTestId="slime-combat-active"
          />
          <StatusPill
            label="enemy HP"
            value={`${state.enemy.hp}/${state.enemy.maxHp}`}
            valueTestId="slime-combat-enemy-hp"
          />
          <StatusPill
            label="result"
            value={state.lastResult}
            valueTestId="slime-combat-result"
          />
          <StatusPill label="frame" value={`#${frame}`} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/90 p-5 shadow-2xl shadow-black/40">
          <div
            data-testid="slime-combat-stage"
            className="relative mx-auto overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(90deg,rgba(251,113,133,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(251,113,133,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{
              width: SLIME_COMBAT_STAGE.width,
              height: SLIME_COMBAT_STAGE.height,
            }}
          >
            <div
              className="absolute inset-x-0 border-t border-emerald-300/50 bg-emerald-400/15"
              style={{
                top: SLIME_COMBAT_STAGE.groundY,
                height: SLIME_COMBAT_STAGE.height - SLIME_COMBAT_STAGE.groundY,
              }}
            />

            <SpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={frame}
              className="absolute z-20 drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              style={{
                left: state.x + SLIME_COMBAT_STAGE.playerWidth / 2 - 63,
                top: state.y - 18,
                width: 126,
                height: 150,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />

            <div
              data-testid="slime-combat-player-body"
              className="absolute z-30 border-2 border-lime-300/80 bg-lime-300/10"
              style={{
                left: playerBody.x,
                top: playerBody.y,
                width: playerBody.width,
                height: playerBody.height,
              }}
            />

            {attackHitbox ? (
              <div
                data-testid="slime-combat-attack-hitbox"
                className="absolute z-40 border-2 border-orange-300 bg-orange-300/20 shadow-[0_0_26px_rgba(251,146,60,0.35)]"
                style={{
                  left: attackHitbox.x,
                  top: attackHitbox.y,
                  width: attackHitbox.width,
                  height: attackHitbox.height,
                }}
              >
                <span className="absolute -top-6 left-0 text-[10px] font-black uppercase tracking-[0.16em] text-orange-200">
                  active hitbox
                </span>
              </div>
            ) : null}

            <div
              className="absolute z-20"
              style={{
                left: state.enemy.x + SLIME_COMBAT_STAGE.enemyWidth / 2 - 44,
                top: state.enemy.y - 34,
                width: 88,
                height: 88,
                opacity: state.enemy.hp === 0 ? 0.35 : 1,
                filter: state.enemy.hurtTick > 0 ? "brightness(1.7)" : "none",
              }}
            >
              <SpriteSheet
                src={SLIME_GAME_ASSETS.greenSlime}
                cols={4}
                rows={2}
                frame={
                  state.enemy.hp === 0 ? 6 : state.enemy.hurtTick > 0 ? 4 : 0
                }
                className="h-full w-full"
              />
            </div>

            <div
              data-testid="slime-combat-enemy-hurtbox"
              className="absolute z-30 border-2 border-rose-300/80 bg-rose-300/10"
              style={{
                left: enemyHurtbox.x,
                top: enemyHurtbox.y,
                width: enemyHurtbox.width,
                height: enemyHurtbox.height,
              }}
            />

            <div
              className="absolute z-40 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40"
              style={{
                left: state.enemy.x - 6,
                top: state.enemy.y - 18,
                width: state.enemy.maxHp,
              }}
            >
              <div
                className="h-full bg-rose-400 transition-[width]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div
          data-testid="slime-combat-state"
          className="rounded-3xl border border-white/10 bg-neutral-900/80 p-5 text-sm leading-7 text-neutral-300"
        >
          <p className="font-black text-white">검증 기준</p>
          <p>
            주황색 영역은 active frame 동안만 생기는 공격 hitbox이고, 붉은색
            영역은 초록 슬라임 hurtbox입니다.
          </p>
          <p>
            같은 attackSerial 안에서는 한 번만 피해가 들어가므로 hitbox가 여러
            tick 겹쳐도 HP가 중복 감소하지 않습니다.
          </p>
        </div>
      </div>
    </section>
  );
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
      <p
        data-testid={valueTestId}
        className="mt-1 truncate font-black text-white"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
