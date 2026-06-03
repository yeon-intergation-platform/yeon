"use client";
import {
  YeonButton,
  YeonPositionedBox,
  YeonSpriteSheet,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
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
              Page 2 · AABB collision test
            </YeonText>
            <YeonText as="h2" variant="title" className="mt-3 sm:text-5xl">
              슬라임 지형 충돌 검증
            </YeonText>
            <YeonText className="mt-3 max-w-2xl text-sm leading-6 text-[#666]">
              같은 입력 런타임 위에서 바닥, 벽, 발판, 천장 충돌을 순수 AABB
              모듈로 계산합니다. 디버그 박스가 실제 판정 source of truth입니다.
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-wrap gap-2">
            <YeonButton
              type="button"
              onClick={() => triggerControl("jump")}
              data-testid="slime-collision-jump"
              className="h-11 rounded-full px-5 text-sm font-bold"
              variant="secondary"
            >
              점프 충돌 테스트
            </YeonButton>
            <YeonButton
              type="button"
              onClick={reset}
              data-testid="slime-collision-reset"
              className="h-11 rounded-full px-5 text-sm font-bold"
              variant="primary"
            >
              위치 초기화
            </YeonButton>
          </YeonView>
        </YeonView>

        <YeonView className="grid gap-3 text-sm text-[#666] lg:grid-cols-5">
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
        </YeonView>

        <YeonSurface className="rounded-[28px] p-5 shadow-[0_18px_45px_rgba(17,17,17,0.08)]">
          <YeonPositionedBox
            data-testid="slime-collision-stage"
            className="relative mx-auto overflow-hidden rounded-3xl border border-[#e5e5e5] bg-[linear-gradient(90deg,rgba(17,17,17,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,0.045)_1px,transparent_1px)] bg-[size:40px_40px]"
            box={{
              width: SLIME_COLLISION_STAGE.width,
              height: SLIME_COLLISION_STAGE.height,
            }}
          >
            {SLIME_COLLISION_SOLIDS.map((solid) => (
              <YeonPositionedBox
                key={solid.id}
                className={solidClassName(solid.kind)}
                box={{
                  left: solid.x,
                  top: solid.y,
                  width: solid.width,
                  height: solid.height,
                }}
              >
                <YeonText
                  as="span"
                  variant="caption"
                  className="absolute left-2 top-1 font-black uppercase tracking-[0.16em] text-[#666]"
                >
                  {solid.label}
                </YeonText>
              </YeonPositionedBox>
            ))}

            <YeonSpriteSheet
              src={SLIME_GAME_ASSETS.slimeHero}
              cols={SLIME_SPRITE_SHEET.cols}
              rows={SLIME_SPRITE_SHEET.rows}
              frame={state.grounded ? 0 : state.velocityY < 0 ? 7 : 8}
              className="absolute z-20 drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
              box={{
                left: spriteStyle.left,
                top: spriteStyle.top,
                width: spriteStyle.width,
                height: spriteStyle.height,
                transform: `scaleX(${state.facing})`,
                transformOrigin: "center bottom",
              }}
            />

            <YeonPositionedBox
              data-testid="slime-collision-player-body"
              className="absolute z-30 border-2 border-[#111] bg-white/10"
              box={{
                left: playerRect.x,
                top: playerRect.y,
                width: playerRect.width,
                height: playerRect.height,
              }}
            />
          </YeonPositionedBox>
        </YeonSurface>

        <YeonSurface
          data-testid="slime-collision-state"
          className="rounded-3xl p-5 text-sm leading-7"
        >
          <YeonText variant="label" className="font-black">
            검증 기준
          </YeonText>
          <YeonText className="text-[#666]">
            플레이어 body가 검정 디버그 박스이며, 모든 지형 충돌은
            `slime-collision-domain.ts`의 AABB 계산 결과만 표시합니다.
          </YeonText>
          <YeonText className="text-[#666]">
            현재 좌표 x {Math.round(state.x)} · y {Math.round(state.y)} · tick{" "}
            {state.tick}
          </YeonText>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}
function solidClassName(kind: string) {
  if (kind === "wall") {
    return "absolute border border-[#111] bg-[#fafafa]";
  }
  if (kind === "ceiling") {
    return "absolute border border-[#666] bg-[#fafafa]";
  }
  if (kind === "platform") {
    return "absolute border border-[#e5e5e5] bg-white";
  }
  return "absolute border border-[#aaa] bg-[#fafafa]";
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
