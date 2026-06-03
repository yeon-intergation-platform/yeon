import {
  YeonButton,
  YeonPositionedBox,
  YeonSlimeSwordAttackEffect,
  YeonSpriteSheet,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { SLIME_GAME_ASSETS } from "./asset-manifest";
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
  const attackDurationTicks = SLIME_ACTIONS.attack.durationTicks ?? 1;
  const attackCycleTick = isAttacking
    ? state.actionTick % Math.max(1, attackDurationTicks)
    : 0;
  const attackProgress = Math.min(
    1,
    attackCycleTick / Math.max(1, attackDurationTicks - 1)
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
              Page 1 · Sprite action test
            </YeonText>
            <YeonText as="h1" variant="title" className="mt-3 sm:text-5xl">
              슬라임 액션프레임 검증
            </YeonText>
            <YeonText className="mt-3 max-w-2xl text-sm leading-6 text-[#666]">
              실제
              <YeonText
                as="code"
                variant="caption"
                className="mx-1 rounded bg-[#fafafa] px-1.5 py-0.5 text-[#111]"
              >
                slime_hero_sheet.png
              </YeonText>
              의 이동, 점프, 공격 프레임만 테스트합니다. 2페이지에서 충돌,
              3페이지에서 히트박스/피해 판정을 따로 검증합니다.
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-wrap gap-2">
            {SLIME_TEST_CONTROL_IDS.map((controlId) => (
              <YeonButton
                key={controlId}
                type="button"
                onClick={() => onTriggerControl(controlId)}
                data-testid={`slime-control-${controlId}`}
                className="h-11 rounded-full px-5 text-sm font-bold"
                variant="secondary"
              >
                {SLIME_CONTROLS[controlId].label}
              </YeonButton>
            ))}
            <YeonButton
              type="button"
              onClick={onReset}
              className="h-11 rounded-full px-5 text-sm font-bold"
              variant="primary"
            >
              위치 초기화
            </YeonButton>
          </YeonView>
        </YeonView>

        <YeonSurface className="rounded-[28px] p-5 shadow-[0_18px_45px_rgba(17,17,17,0.08)]">
          <YeonView className="mb-4 grid gap-3 text-sm text-[#666] sm:grid-cols-5">
            <StatusPill label="이동" value="A/D 또는 ←/→" />
            <StatusPill label="점프" value="Space" />
            <StatusPill label="공격" value="J/K" />
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
          </YeonView>

          <YeonPositionedBox
            className="relative mx-auto h-[380px] overflow-hidden rounded-3xl border border-[#e5e5e5] bg-[linear-gradient(90deg,rgba(17,17,17,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,0.045)_1px,transparent_1px)] bg-[size:40px_40px]"
            box={{ width: SLIME_STAGE.trackWidth }}
          >
            <YeonPositionedBox
              className="absolute inset-x-6 h-px bg-[#111]"
              box={{ bottom: SLIME_STAGE.groundBottom }}
            />
            <YeonPositionedBox
              as="span"
              className="absolute left-6"
              box={{ bottom: SLIME_STAGE.groundBottom - 16 }}
            >
              <YeonText
                variant="caption"
                tone="secondary"
                className="font-bold uppercase tracking-[0.2em]"
              >
                min
              </YeonText>
            </YeonPositionedBox>
            <YeonPositionedBox
              as="span"
              className="absolute right-6"
              box={{ bottom: SLIME_STAGE.groundBottom - 16 }}
            >
              <YeonText
                variant="caption"
                tone="secondary"
                className="font-bold uppercase tracking-[0.2em]"
              >
                max
              </YeonText>
            </YeonPositionedBox>
            <YeonPositionedBox
              className="absolute rounded-full bg-[#aaa]"
              box={{
                bottom: SLIME_STAGE.groundBottom,
                left: SLIME_STAGE.minX,
                width:
                  SLIME_MAX_X - SLIME_STAGE.minX + SLIME_SPRITE_SHEET.viewWidth,
                height: 2,
              }}
            />
            <YeonSpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={frame}
              className="absolute drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              box={{
                left: state.x,
                bottom: SLIME_STAGE.groundBottom + state.groundOffset,
                width: SLIME_SPRITE_SHEET.viewWidth,
                height: SLIME_SPRITE_VIEW_HEIGHT,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />
            {isAttacking ? (
              <YeonSlimeSwordAttackEffect
                bladeSrc={SLIME_GAME_ASSETS.swordBlade}
                facing={state.facing}
                groundBottom={SLIME_STAGE.groundBottom}
                groundOffset={state.groundOffset}
                progress={attackProgress}
                tipArcSrc={SLIME_GAME_ASSETS.swordTipArc}
                x={state.x}
              />
            ) : null}
            <YeonPositionedBox
              className="absolute h-3 rounded-full bg-[#aaa] blur-sm transition-opacity"
              box={{
                bottom: SLIME_STAGE.groundBottom - 56,
                left: state.x + SLIME_SPRITE_SHEET.viewWidth * 0.24,
                width: SLIME_SPRITE_SHEET.viewWidth * 0.52,
                opacity: Math.max(0.25, 1 - state.groundOffset / 120),
              }}
            />
          </YeonPositionedBox>
        </YeonSurface>

        <YeonSurface className="rounded-[28px] p-5">
          <YeonView className="mb-4 flex items-center justify-between gap-4">
            <YeonView>
              <YeonText as="h2" variant="label" className="text-base">
                액션 프레임 확인
              </YeonText>
              <YeonText variant="caption" className="mt-1 text-[#666]">
                action/입력 처리는 공용 sprite-action tool 위의 슬라임
                도메인에서 가져옵니다. 검정 테두리가 현재 프레임입니다.
              </YeonText>
            </YeonView>
            <YeonText
              as="span"
              data-testid="slime-state-summary"
              variant="caption"
              className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 font-bold text-[#666]"
            >
              x {Math.round(state.x)}px · y +{Math.round(state.groundOffset)}px
              · {directionText}
            </YeonText>
          </YeonView>
          <YeonView className="grid gap-3 md:grid-cols-4">
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
          </YeonView>
        </YeonSurface>
      </YeonView>
    </YeonView>
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
    <YeonSurface variant="panel" className="p-3">
      <YeonView className="mb-3">
        <YeonText as="h3" variant="label" className="text-sm">
          {title}
        </YeonText>
        <YeonText variant="caption" className="mt-1 text-[#666]">
          {description}
        </YeonText>
      </YeonView>
      <YeonView className="grid grid-cols-2 gap-2">
        {frames.map((previewFrame) => (
          <YeonSurface
            key={`${actionId}-${previewFrame}`}
            variant="outlined"
            className={`p-2 ${
              previewFrame === activeFrame
                ? "border-[#111] bg-[#fafafa]"
                : "border-[#e5e5e5] bg-white"
            }`}
          >
            <YeonSpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={previewFrame}
              className="mx-auto"
              box={{ width: 64, height: 76 }}
            />
            <YeonText
              variant="caption"
              className="mt-1 text-center font-bold text-[#666]"
            >
              #{previewFrame}
            </YeonText>
          </YeonSurface>
        ))}
      </YeonView>
    </YeonSurface>
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
        className="mt-1 font-black text-[#111]"
      >
        {value}
      </YeonText>
    </YeonSurface>
  );
}
