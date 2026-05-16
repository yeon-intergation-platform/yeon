import { SLIME_GAME_ASSETS } from "./asset-manifest";
import { SlimeSwordAttackEffect } from "./slime-sword-attack-effect";
import {
  SLIME_ACTIONS,
  SLIME_ACTION_LIST,
  SLIME_MAX_X,
  SLIME_SPRITE_SHEET,
  SLIME_SPRITE_VIEW_HEIGHT,
  SLIME_STAGE,
  SLIME_TEST_CONTROL_IDS,
  SLIME_CONTROLS,
} from "./slime-game-domain";
import type { SlimeControlId } from "./slime-game-domain";
import type { GameState } from "./slime-game-state";
import { slimeFrame } from "./slime-game-state";
import { SpriteSheet } from "./sprite-sheet";

export function SlimeGameStage({
  state,
  onReset,
  onTriggerControl,
}: {
  state: GameState;
  onReset: () => void;
  onTriggerControl: (controlId: SlimeControlId) => void;
}) {
  const frame = slimeFrame(state);
  const action = SLIME_ACTIONS[state.action];
  const directionText = state.facing === 1 ? "right" : "left";
  const isAttacking = state.action === "attack";
  const attackProgress = Math.min(
    1,
    state.actionTick /
      Math.max(1, (SLIME_ACTIONS.attack.durationTicks ?? 1) - 1)
  );

  return (
    <section className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-lime-300">
              Page 1 · Sprite action test
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              슬라임 액션프레임 검증
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
              실제
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-lime-100">
                slime_hero_sheet.png
              </code>
              의 이동, 점프, 공격 프레임만 테스트합니다. 2페이지에서 충돌,
              3페이지에서 히트박스/피해 판정을 따로 검증합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SLIME_TEST_CONTROL_IDS.map((controlId) => (
              <button
                key={controlId}
                type="button"
                onClick={() => onTriggerControl(controlId)}
                data-testid={`slime-control-${controlId}`}
                className="h-11 rounded-full border border-lime-300/20 bg-lime-300/10 px-5 text-sm font-bold text-lime-100 transition hover:bg-lime-300/15"
              >
                {SLIME_CONTROLS[controlId].label}
              </button>
            ))}
            <button
              type="button"
              onClick={onReset}
              className="h-11 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
            >
              위치 초기화
            </button>
          </div>
        </header>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/90 p-5 shadow-2xl shadow-black/40">
          <div className="mb-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-5">
            <StatusPill label="이동" value="A/D 또는 ←/→" />
            <StatusPill label="점프" value="Space" />
            <StatusPill label="공격" value="J" />
            <StatusPill
              label="액션"
              value={`${action.label} (${action.id})`}
              valueTestId="slime-action-status"
            />
            <StatusPill
              label="프레임"
              value={`#${frame}`}
              valueTestId="slime-frame-status"
            />
          </div>

          <div
            className="relative mx-auto h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{ width: SLIME_STAGE.trackWidth }}
          >
            <div
              className="absolute inset-x-6 h-px bg-lime-300/70"
              style={{ bottom: SLIME_STAGE.groundBottom }}
            />
            <div
              className="absolute left-6 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-200/80"
              style={{ bottom: SLIME_STAGE.groundBottom - 16 }}
            >
              min
            </div>
            <div
              className="absolute right-6 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-200/80"
              style={{ bottom: SLIME_STAGE.groundBottom - 16 }}
            >
              max
            </div>
            <div
              className="absolute rounded-full bg-lime-300/20"
              style={{
                bottom: SLIME_STAGE.groundBottom,
                left: SLIME_STAGE.minX,
                width:
                  SLIME_MAX_X - SLIME_STAGE.minX + SLIME_SPRITE_SHEET.viewWidth,
                height: 2,
              }}
            />
            <SpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={frame}
              className="absolute drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              style={{
                left: state.x,
                bottom: SLIME_STAGE.groundBottom + state.groundOffset,
                width: SLIME_SPRITE_SHEET.viewWidth,
                height: SLIME_SPRITE_VIEW_HEIGHT,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />
            {isAttacking ? (
              <SlimeSwordAttackEffect
                x={state.x}
                groundOffset={state.groundOffset}
                facing={state.facing}
                progress={attackProgress}
              />
            ) : null}
            <div
              className="absolute h-3 rounded-full bg-lime-300/40 blur-sm transition-opacity"
              style={{
                bottom: SLIME_STAGE.groundBottom - 56,
                left: state.x + SLIME_SPRITE_SHEET.viewWidth * 0.24,
                width: SLIME_SPRITE_SHEET.viewWidth * 0.52,
                opacity: Math.max(0.25, 1 - state.groundOffset / 120),
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900/80 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white">
                액션 프레임 확인
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                action/입력 처리는 공용 sprite-action tool 위의 슬라임
                도메인에서 가져옵니다. 초록 테두리가 현재 프레임입니다.
              </p>
            </div>
            <span
              data-testid="slime-state-summary"
              className="rounded-full bg-lime-300/15 px-3 py-1 text-xs font-bold text-lime-200"
            >
              x {Math.round(state.x)}px · y +{Math.round(state.groundOffset)}px
              · {directionText}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {SLIME_ACTION_LIST.map((definition) => (
              <ActionFrameGroup
                key={definition.id}
                actionId={definition.id}
                title={`${definition.label} (${definition.id})`}
                description={definition.description}
                frames={definition.frames}
                activeFrame={state.action === definition.id ? frame : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionFrameGroup({
  actionId,
  title,
  description,
  frames,
  activeFrame,
}: {
  actionId: string;
  title: string;
  description: string;
  frames: readonly number[];
  activeFrame?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="mb-3">
        <h3 className="text-sm font-black text-white">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {frames.map((previewFrame) => (
          <div
            key={`${actionId}-${previewFrame}`}
            className={`rounded-xl border p-2 ${
              previewFrame === activeFrame
                ? "border-lime-300 bg-lime-300/10"
                : "border-white/10 bg-neutral-950"
            }`}
          >
            <SpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={previewFrame}
              className="mx-auto"
              style={{ width: 64, height: 76 }}
            />
            <p className="mt-1 text-center text-[11px] font-bold text-neutral-300">
              #{previewFrame}
            </p>
          </div>
        ))}
      </div>
    </div>
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
      <p data-testid={valueTestId} className="mt-1 font-black text-white">
        {value}
      </p>
    </div>
  );
}
