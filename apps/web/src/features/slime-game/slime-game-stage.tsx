import { SLIME_GAME_ASSETS } from "./asset-manifest";
import type { GameState } from "./slime-game-state";
import {
  COIN,
  FLOOR_Y,
  LADDER,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PORTAL,
  WORLD_HEIGHT,
  chooseAction,
  overlaps,
  slimeFrame,
} from "./slime-game-state";
import { SpriteSheet, propSprite, tileSprite } from "./sprite-sheet";

export function SlimeGameStage({ state }: { state: GameState }) {
  const playerBox = {
    x: state.x,
    y: state.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  };
  const action = chooseAction(state, overlaps(playerBox, LADDER));
  const enemyFrame =
    state.enemyHp <= 0
      ? state.tick % 24 < 12
        ? 12
        : 13
      : Math.abs(state.enemyX - state.x) < 92
        ? 8 + (Math.floor(state.tick / 8) % 3)
        : 2 + (Math.floor(state.tick / 8) % 4);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div
        className="relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-sky-100"
        style={{ height: WORLD_HEIGHT }}
      >
        <WorldBackground />
        <WorldTiles />
        <Ladder />
        <Portal tick={state.tick} />
        <Coin coins={state.coins} tick={state.tick} />
        <MonsterLayer state={state} enemyFrame={enemyFrame} />
        <Player state={state} frame={slimeFrame(action, state.tick)} />
        <Effects state={state} />
        <Hud state={state} action={action} />
        {state.portalCleared ? <ClearOverlay /> : null}
      </div>
    </div>
  );
}

function WorldBackground() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-70 [image-rendering:pixelated]"
        style={{
          backgroundImage: `url(${SLIME_GAME_ASSETS.forestBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-100 to-transparent" />
    </>
  );
}

function WorldTiles() {
  return (
    <>
      <div className="absolute left-0 flex" style={{ top: FLOOR_Y }}>
        {Array.from({ length: 24 }, (_, index) => (
          <div key={index}>
            {tileSprite(index === 0 ? 0 : index === 23 ? 2 : 1)}
          </div>
        ))}
      </div>
      <div className="absolute left-0 flex" style={{ top: FLOOR_Y + 32 }}>
        {Array.from({ length: 24 }, (_, index) => (
          <div key={index}>
            {tileSprite(index === 0 ? 3 : index === 23 ? 5 : 4)}
          </div>
        ))}
      </div>
      <div className="absolute left-[286px] top-[246px] flex drop-shadow-md">
        {tileSprite(9)}
        {tileSprite(10)}
        {tileSprite(10)}
        {tileSprite(11)}
      </div>
      <div className="absolute left-[128px] top-[190px] flex drop-shadow-md">
        {tileSprite(12)}
        {tileSprite(13)}
        {tileSprite(14)}
      </div>
    </>
  );
}

function Ladder() {
  return (
    <div className="absolute" style={{ left: LADDER.x, top: LADDER.y }}>
      {propSprite(0)}
      {propSprite(1)}
      {propSprite(1)}
      {propSprite(2)}
    </div>
  );
}

function Portal({ tick }: { tick: number }) {
  return (
    <>
      <div
        className="absolute"
        style={{ left: PORTAL.x - 14, top: PORTAL.y + 86 }}
      >
        {propSprite(14, "h-8 w-16")}
      </div>
      <SpriteSheet
        src={SLIME_GAME_ASSETS.portal}
        cols={4}
        rows={1}
        frame={Math.floor(tick / 8) % 4}
        className="absolute h-32 w-24 drop-shadow-[0_0_18px_rgba(99,102,241,0.75)]"
        style={{ left: PORTAL.x - 12, top: PORTAL.y - 16 }}
      />
    </>
  );
}

function Coin({ coins, tick }: { coins: number; tick: number }) {
  if (coins > 0) return null;
  return (
    <SpriteSheet
      src={SLIME_GAME_ASSETS.itemsUi}
      cols={6}
      rows={3}
      frame={Math.floor(tick / 7) % 3}
      className="absolute h-9 w-9 animate-bounce drop-shadow"
      style={{ left: COIN.x, top: COIN.y }}
    />
  );
}

function MonsterLayer({
  state,
  enemyFrame,
}: {
  state: GameState;
  enemyFrame: number;
}) {
  return (
    <>
      <SpriteSheet
        src={SLIME_GAME_ASSETS.greenSlime}
        cols={7}
        rows={2}
        frame={enemyFrame}
        className="absolute h-14 w-14 drop-shadow-lg"
        style={{
          left: state.enemyX,
          top: FLOOR_Y - 46,
          transform: `scaleX(${state.enemyDirection})`,
          opacity: state.enemyHp <= 0 ? 0.75 : 1,
        }}
      />
      <SpriteSheet
        src={SLIME_GAME_ASSETS.bat}
        cols={9}
        rows={2}
        frame={2 + (Math.floor(state.tick / 6) % 4)}
        className="absolute h-14 w-14 drop-shadow-lg"
        style={{
          left: 392 + Math.sin(state.tick / 24) * 34,
          top: 156 + Math.cos(state.tick / 18) * 10,
        }}
      />
      <SpriteSheet
        src={SLIME_GAME_ASSETS.mushroom}
        cols={7}
        rows={2}
        frame={2 + (Math.floor(state.tick / 10) % 4)}
        className="absolute h-16 w-16 drop-shadow-lg"
        style={{ left: 314, top: 202 }}
      />
    </>
  );
}

function Player({ state, frame }: { state: GameState; frame: number }) {
  return (
    <SpriteSheet
      src={SLIME_GAME_ASSETS.slimeHero}
      cols={8}
      rows={3}
      frame={frame}
      className="absolute h-20 w-20 drop-shadow-xl transition-transform"
      style={{
        left: state.x - 14,
        top: state.y - 18,
        transform: `scaleX(${state.facing})`,
      }}
    />
  );
}

function Effects({ state }: { state: GameState }) {
  return state.effects.map((effect, index) => {
    const frame =
      effect.kind === "slash"
        ? 19 + (effect.ttl % 8 < 4 ? 0 : 1)
        : effect.kind === "projectile"
          ? 6 + (effect.ttl % 8 < 4 ? 0 : 1)
          : effect.ttl % 8 < 4
            ? 0
            : 1;
    return (
      <SpriteSheet
        key={`${effect.kind}-${index}-${effect.ttl}`}
        src={SLIME_GAME_ASSETS.effects}
        cols={7}
        rows={4}
        frame={frame}
        className={`absolute ${effect.kind === "slash" ? "h-16 w-16" : "h-10 w-10"}`}
        style={{
          left: effect.x,
          top: effect.y,
          opacity: Math.min(1, effect.ttl / 10),
        }}
      />
    );
  });
}

function Hud({ state, action }: { state: GameState; action: string }) {
  return (
    <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-black">
        {Array.from({ length: 3 }, (_, index) => (
          <SpriteSheet
            key={index}
            src={SLIME_GAME_ASSETS.itemsUi}
            cols={6}
            rows={3}
            frame={7}
            className={`h-7 w-7 ${index >= state.hp ? "grayscale opacity-30" : ""}`}
          />
        ))}
        <span className="ml-2">coin {state.coins}/1</span>
      </div>
      <p className="mt-1 text-xs font-bold text-slate-500">상태: {action}</p>
    </div>
  );
}

function ClearOverlay() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 text-center shadow-2xl">
        <p className="text-4xl">🎉</p>
        <h2 className="mt-2 text-2xl font-black">포탈 도착!</h2>
        <p className="mt-2 text-sm text-slate-600">
          사다리, 코인, 전투, 포탈 상태가 모두 연결되었습니다.
        </p>
      </div>
    </div>
  );
}
