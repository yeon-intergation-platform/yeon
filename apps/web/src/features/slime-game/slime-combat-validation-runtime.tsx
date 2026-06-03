"use client";
import {
  YeonButton,
  YeonPositionedBox,
  YeonProgressBar,
  YeonSpriteSheet,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { SLIME_GAME_ASSETS } from "./asset-manifest";
import {
  GREEN_SLIME_COMBAT_SPRITE,
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
    <YeonView as="section" className="px-6 py-10">
      <YeonView className="mx-auto w-full max-w-5xl space-y-6">
        <YeonView
          as="header"
          className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <YeonView>
            <YeonText
              variant="caption"
              className="font-bold uppercase tracking-[0.42em] text-[#666]"
            >
              Page 3 · Hitbox combat test
            </YeonText>
            <YeonText as="h2" variant="title" className="mt-3 sm:text-5xl">
              슬라임 히트박스·피해 판정 검증
            </YeonText>
            <YeonText className="mt-3 max-w-2xl text-sm leading-6 text-[#666]">
              attack action의 active frame에서만 hitbox를 켜고, 적 슬라임
              hurtbox와 겹칠 때 한 공격당 한 번만 HP를 줄입니다.
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-wrap gap-2">
            <YeonButton
              type="button"
              onClick={() => triggerControl("attack")}
              data-testid="slime-combat-attack"
              className="h-11 rounded-full px-5 text-sm font-bold"
              variant="secondary"
            >
              J/K 공격 판정 테스트
            </YeonButton>
            <YeonButton
              type="button"
              onClick={reset}
              data-testid="slime-combat-reset"
              className="h-11 rounded-full px-5 text-sm font-bold"
              variant="primary"
            >
              전투 초기화
            </YeonButton>
          </YeonView>
        </YeonView>

        <YeonView className="grid gap-3 text-sm text-[#666] lg:grid-cols-5">
          <StatusPill label="조작" value="A/D · ←/→ · J/K" />
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
        </YeonView>

        <YeonSurface className="rounded-[28px] p-5 shadow-[0_18px_45px_rgba(17,17,17,0.08)]">
          <YeonPositionedBox
            data-testid="slime-combat-stage"
            className="relative mx-auto overflow-hidden rounded-3xl border border-[#e5e5e5] bg-[linear-gradient(90deg,rgba(17,17,17,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,0.045)_1px,transparent_1px)] bg-[size:40px_40px]"
            box={{
              width: SLIME_COMBAT_STAGE.width,
              height: SLIME_COMBAT_STAGE.height,
            }}
          >
            <YeonPositionedBox
              className="absolute inset-x-0 border-t border-[#e5e5e5] bg-[#fafafa]"
              box={{
                top: SLIME_COMBAT_STAGE.groundY,
                height: SLIME_COMBAT_STAGE.height - SLIME_COMBAT_STAGE.groundY,
              }}
            />

            <YeonSpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={frame}
              className="absolute z-20 drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              box={{
                left: state.x + SLIME_COMBAT_STAGE.playerWidth / 2 - 63,
                top: SLIME_COMBAT_STAGE.groundY - 132,
                width: 126,
                height: 150,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />

            <YeonPositionedBox
              data-testid="slime-combat-player-body"
              className="absolute z-30 border-2 border-[#111] bg-transparent shadow-[0_0_0_1px_rgba(17,17,17,0.22)]"
              box={{
                left: playerBody.x,
                top: playerBody.y,
                width: playerBody.width,
                height: playerBody.height,
              }}
            />

            {attackHitbox ? (
              <YeonPositionedBox
                data-testid="slime-combat-attack-hitbox"
                className="absolute z-40 border-2 border-[#666] bg-white/10 shadow-[0_0_26px_rgba(17,17,17,0.14)]"
                box={{
                  left: attackHitbox.x,
                  top: attackHitbox.y,
                  width: attackHitbox.width,
                  height: attackHitbox.height,
                }}
              >
                <YeonText
                  as="span"
                  variant="caption"
                  className="absolute -top-6 left-0 font-black uppercase tracking-[0.16em] text-[#666]"
                >
                  active hitbox
                </YeonText>
              </YeonPositionedBox>
            ) : null}

            <YeonPositionedBox
              className="absolute z-20"
              box={{
                left:
                  state.enemy.x +
                  SLIME_COMBAT_STAGE.enemyWidth / 2 -
                  GREEN_SLIME_COMBAT_SPRITE.width / 2,
                top:
                  SLIME_COMBAT_STAGE.groundY - GREEN_SLIME_COMBAT_SPRITE.height,
                width: GREEN_SLIME_COMBAT_SPRITE.width,
                height: GREEN_SLIME_COMBAT_SPRITE.height,
                opacity: state.enemy.hp === 0 ? 0.35 : 1,
                filter: state.enemy.hurtTick > 0 ? "brightness(1.7)" : "none",
              }}
            >
              <YeonSpriteSheet
                src={SLIME_GAME_ASSETS.greenSlime}
                cols={GREEN_SLIME_COMBAT_SPRITE.cols}
                rows={GREEN_SLIME_COMBAT_SPRITE.rows}
                frame={
                  state.enemy.hp === 0
                    ? GREEN_SLIME_COMBAT_SPRITE.deadFrame
                    : state.enemy.hurtTick > 0
                      ? GREEN_SLIME_COMBAT_SPRITE.hurtFrame
                      : GREEN_SLIME_COMBAT_SPRITE.idleFrame
                }
                className="h-full w-full"
              />
            </YeonPositionedBox>

            <YeonPositionedBox
              data-testid="slime-combat-enemy-hurtbox"
              className="absolute z-30 border-2 border-[#aaa] bg-transparent shadow-[0_0_0_1px_rgba(170,170,170,0.24)]"
              box={{
                left: enemyHurtbox.x,
                top: enemyHurtbox.y,
                width: enemyHurtbox.width,
                height: enemyHurtbox.height,
              }}
            />

            <YeonPositionedBox
              className="absolute z-40 overflow-hidden rounded-full border border-[#e5e5e5] bg-white"
              box={{
                left: state.enemy.x - 6,
                top: state.enemy.y - 42,
                width: state.enemy.maxHp,
              }}
            >
              <YeonProgressBar value={hpPercent} className="h-3" />
            </YeonPositionedBox>
          </YeonPositionedBox>
        </YeonSurface>

        <YeonSurface
          data-testid="slime-combat-state"
          className="rounded-3xl p-5 text-sm leading-7"
        >
          <YeonText variant="label" className="font-black">
            검증 기준
          </YeonText>
          <YeonText className="text-[#666]">
            hitbox는 active frame 동안만 생기고, hurtbox와 겹칠 때 한 번만
            피해를 적용합니다.
          </YeonText>
          <YeonText className="text-[#666]">
            같은 attackSerial 안에서는 한 번만 피해가 들어가므로 hitbox가 여러
            tick 겹쳐도 HP가 중복 감소하지 않습니다.
          </YeonText>
        </YeonSurface>
      </YeonView>
    </YeonView>
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
    <YeonSurface variant="panel" className="px-4 py-3">
      <YeonText
        variant="caption"
        className="font-bold uppercase tracking-[0.22em] text-[#666]"
      >
        {label}
      </YeonText>
      <YeonText
        data-testid={valueTestId}
        variant="label"
        className="mt-1 truncate font-black text-[#111]"
        title={value}
      >
        {value}
      </YeonText>
    </YeonSurface>
  );
}
