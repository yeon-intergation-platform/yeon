import { useEffect, useState } from "react";

import type { Action, EffectBurst, GameState } from "./slime-game-state";
import {
  COIN,
  FLOOR_Y,
  LADDER,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PORTAL,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  chooseAction,
  overlaps,
} from "./slime-game-state";

const SKILLS = [
  {
    key: "Q",
    name: "Gust Cut",
    color: "from-lime-300 to-emerald-600",
    icon: "✦",
  },
  {
    key: "W",
    name: "Leaf Spin",
    color: "from-green-200 to-lime-700",
    icon: "◔",
  },
  {
    key: "E",
    name: "Slime Guard",
    color: "from-emerald-200 to-teal-500",
    icon: "●",
  },
  {
    key: "R",
    name: "Acorn Burst",
    color: "from-amber-200 to-orange-600",
    icon: "✹",
  },
] as const;

const STAGE_PADDING = 24;
const MAX_STAGE_SCALE = 1.08;

function getStageScale() {
  if (typeof window === "undefined") return 1;
  const widthScale = (window.innerWidth - STAGE_PADDING) / WORLD_WIDTH;
  const heightScale = (window.innerHeight - STAGE_PADDING) / WORLD_HEIGHT;
  return Math.max(0.5, Math.min(MAX_STAGE_SCALE, widthScale, heightScale));
}

export function SlimeGameStage({
  state,
  onReset,
}: {
  state: GameState;
  onReset: () => void;
}) {
  const [stageScale, setStageScale] = useState(getStageScale);
  const playerBox = {
    x: state.x,
    y: state.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  };
  const action = chooseAction(state, overlaps(playerBox, LADDER));
  const leafDrops = Math.min(12, 8 + state.coins * 2 + (2 - state.enemyHp) * 2);

  useEffect(() => {
    const handleResize = () => setStageScale(getStageScale());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#1f9fff_0%,#0b63b6_34%,#08213f_88%)] p-3">
      <div
        className="relative"
        style={{
          width: WORLD_WIDTH * stageScale,
          height: WORLD_HEIGHT * stageScale,
        }}
      >
        <div
          className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.25] bg-sky-300 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `scale(${stageScale})`,
            transformOrigin: "top left",
          }}
        >
          <SkyWorld tick={state.tick} />
          <Platforms />
          <Decorations tick={state.tick} />
          <PortalGate tick={state.tick} />
          <Coin coins={state.coins} tick={state.tick} />
          <Monsters state={state} />
          <Player state={state} action={action} />
          <Effects effects={state.effects} facing={state.facing} />
          {state.attackCooldown > 14 ? <DamageNumber state={state} /> : null}
          <TopLeftHud state={state} />
          <LeftRail />
          <RightMissionPanel leafDrops={leafDrops} onReset={onReset} />
          <BattleLog leafDrops={leafDrops} />
          <BottomDock />
          <ExpBar />
          {state.portalCleared ? <ClearOverlay onReset={onReset} /> : null}
        </div>
      </div>
    </section>
  );
}

function SkyWorld({ tick }: { tick: number }) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(255,255,255,0.95)_0_5%,transparent_13%),linear-gradient(180deg,#18a7ff_0%,#7dd8ff_42%,#bdf3ce_100%)]" />
      <div className="absolute inset-0 opacity-[0.65] [background-image:radial-gradient(circle_at_20%_18%,white_0_7%,transparent_15%),radial-gradient(circle_at_29%_12%,white_0_9%,transparent_17%),radial-gradient(circle_at_63%_16%,white_0_8%,transparent_18%),radial-gradient(circle_at_68%_20%,white_0_7%,transparent_16%)]" />
      <div className="absolute left-[520px] top-[56px] h-40 w-52 rounded-[50%] bg-white/[0.45] blur-sm" />
      <div className="absolute left-[900px] top-[84px] h-32 w-72 rounded-[50%] bg-white/[0.55] blur-sm" />
      <FloatingIsland left={420} top={150} scale={0.82} />
      <FloatingIsland left={620} top={84} scale={0.52} />
      <FloatingIsland left={910} top={174} scale={0.58} />
      <FloatingIsland left={1160} top={112} scale={0.74} />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(180deg,transparent_0%,rgba(62,184,111,0.22)_30%,rgba(31,98,60,0.62)_100%)]" />
      <div className="absolute left-[580px] top-[610px] h-48 w-96 rounded-[50%] bg-cyan-200/[0.4] blur-2xl" />
      <Leaf left={480} top={174} rotate={tick / 3} />
      <Leaf left={1000} top={316} rotate={-tick / 4} />
      <Leaf left={1190} top={268} rotate={tick / 5} />
    </>
  );
}

function FloatingIsland({
  left,
  top,
  scale,
}: {
  left: number;
  top: number;
  scale: number;
}) {
  return (
    <div
      className="absolute opacity-70 blur-[0.2px]"
      style={{ left, top, transform: `scale(${scale})` }}
    >
      <div className="h-12 w-44 rounded-[50%] bg-emerald-300 shadow-[0_10px_24px_rgba(30,112,73,0.22)]" />
      <div className="mx-auto h-16 w-28 rounded-b-[80px] bg-gradient-to-b from-amber-500 to-stone-700" />
    </div>
  );
}

function Leaf({
  left,
  top,
  rotate,
}: {
  left: number;
  top: number;
  rotate: number;
}) {
  return (
    <span
      className="absolute h-5 w-3 rounded-[100%_0_100%_0] bg-lime-400/[0.8] shadow-sm"
      style={{ left, top, transform: `rotate(${rotate}deg)` }}
    />
  );
}

function Platforms() {
  return (
    <>
      <Platform left={-34} top={646} width={550} height={132} />
      <Platform left={585} top={FLOOR_Y} width={780} height={134} />
      <Platform left={1056} top={744} width={590} height={130} />
      <Platform left={52} top={424} width={168} height={82} small />
      <Platform left={1260} top={426} width={190} height={86} small />
      <Platform left={1476} top={592} width={180} height={86} small />
      <WoodSign />
      <Ladder />
    </>
  );
}

function Platform({
  left,
  top,
  width,
  height,
  small = false,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  small?: boolean;
}) {
  const flowerCount = small ? 3 : 8;
  return (
    <div className="absolute" style={{ left, top, width, height }}>
      <div className="absolute inset-x-0 top-0 h-12 rounded-[40px] bg-[linear-gradient(180deg,#c9ff55_0%,#66c934_45%,#2d8f35_100%)] shadow-[0_8px_18px_rgba(27,102,38,0.35)]" />
      <div className="absolute left-4 right-4 top-9 h-[calc(100%-22px)] rounded-b-[54px] bg-[radial-gradient(circle_at_20%_20%,#8b6a3c_0_10%,transparent_11%),radial-gradient(circle_at_62%_42%,#6b4a28_0_12%,transparent_13%),linear-gradient(180deg,#7b5a32,#3a271b)] shadow-[inset_0_12px_18px_rgba(255,255,255,0.12),0_20px_28px_rgba(28,29,18,0.3)]" />
      <div className="absolute inset-x-5 top-1 flex justify-around">
        {Array.from({ length: flowerCount }, (_, index) => (
          <span
            key={index}
            className="mt-1 h-3 w-3 rounded-full bg-pink-200 shadow-[0_0_0_3px_rgba(255,247,178,0.72)]"
          />
        ))}
      </div>
    </div>
  );
}

function Ladder() {
  return (
    <div
      className="absolute z-10 flex w-16 flex-col items-center gap-2"
      style={{ left: LADDER.x, top: LADDER.y }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="relative h-5 w-16">
          <span className="absolute left-2 top-0 h-7 w-2 rounded bg-amber-700" />
          <span className="absolute right-2 top-0 h-7 w-2 rounded bg-amber-700" />
          <span className="absolute left-0 right-0 top-2 h-2 rounded bg-amber-400 shadow" />
        </div>
      ))}
    </div>
  );
}

function WoodSign() {
  return (
    <div className="absolute left-[1362px] top-[520px] z-10">
      <div className="h-36 w-5 rounded bg-amber-800 shadow" />
      <div className="absolute -left-20 top-2 h-12 w-44 rotate-[-2deg] rounded-xl border-4 border-amber-900 bg-amber-500 text-center text-sm font-black leading-10 text-amber-950 shadow-lg">
        Greenbloom
      </div>
      <span className="absolute -left-8 top-60 h-20 w-4 rounded bg-amber-900" />
    </div>
  );
}

function Decorations({ tick }: { tick: number }) {
  return (
    <>
      <Tree left={1334} top={208} scale={1.45} />
      <Tree left={-60} top={254} scale={1.1} />
      <Bee left={360} top={210} tick={tick} delay={0} />
      <Bee left={466} top={314} tick={tick} delay={10} />
      <Mushroom left={92} top={590} tone="green" />
      <Mushroom left={190} top={594} tone="cream" />
      <PurplePuff left={1160} top={682} tick={tick} />
      <Snail left={1370} top={706} />
      <Lantern left={1420} top={452} />
    </>
  );
}

function Tree({
  left,
  top,
  scale,
}: {
  left: number;
  top: number;
  scale: number;
}) {
  return (
    <div
      className="absolute"
      style={{ left, top, transform: `scale(${scale})` }}
    >
      <div className="absolute left-20 top-40 h-52 w-16 rounded bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950" />
      <div className="absolute h-40 w-72 rounded-[50%] bg-lime-300 shadow-[0_18px_30px_rgba(27,108,52,0.32)]" />
      <div className="absolute left-48 top-28 h-32 w-48 rounded-[50%] bg-green-400" />
      <div className="absolute left-[30px] top-[18px] h-36 w-52 rounded-[50%] bg-emerald-400" />
    </div>
  );
}

function Bee({
  left,
  top,
  tick,
  delay,
}: {
  left: number;
  top: number;
  tick: number;
  delay: number;
}) {
  const bob = Math.sin((tick + delay) / 12) * 12;
  return (
    <div className="absolute z-20" style={{ left, top: top + bob }}>
      <span className="absolute -left-6 -top-10 h-12 w-9 rotate-[-22deg] rounded-full bg-white/[0.8]" />
      <span className="absolute left-2 -top-10 h-12 w-9 rotate-[22deg] rounded-full bg-white/[0.8]" />
      <span className="block h-16 w-20 rounded-[55%] border-4 border-amber-900 bg-[linear-gradient(90deg,#f8c42e_0_28%,#3a2417_29%_41%,#f8c42e_42%_64%,#3a2417_65%_78%,#f8c42e_79%)] shadow-xl" />
      <span className="absolute left-12 top-5 h-3 w-3 rounded-full bg-black" />
    </div>
  );
}

function Mushroom({
  left,
  top,
  tone,
}: {
  left: number;
  top: number;
  tone: "green" | "cream";
}) {
  const cap = tone === "green" ? "bg-lime-500" : "bg-stone-100";
  return (
    <div className="absolute z-30" style={{ left, top }}>
      <div
        className={`h-[58px] w-[86px] rounded-t-[70px] rounded-b-[28px] ${cap} shadow-xl`}
      />
      <div className="absolute left-8 top-40 h-[50px] w-[70px] rounded-[45%] bg-stone-100" />
      <span className="absolute left-24 top-[58px] h-3 w-3 rounded-full bg-amber-950" />
      <span className="absolute left-48 top-[58px] h-3 w-3 rounded-full bg-amber-950" />
      <span className="absolute left-[30px] top-72 h-3 w-20 rounded-b-full border-b-4 border-amber-950" />
    </div>
  );
}

function PurplePuff({
  left,
  top,
  tick,
}: {
  left: number;
  top: number;
  tick: number;
}) {
  return (
    <div
      className="absolute z-30 h-72 w-[82px] rounded-[50%] bg-violet-300 shadow-xl"
      style={{ left, top: top + Math.sin(tick / 16) * 4 }}
    >
      <span className="absolute left-20 top-24 h-8 w-7 rounded-full bg-white" />
      <span className="absolute left-[50px] top-24 h-8 w-7 rounded-full bg-white" />
      <span className="absolute left-[23px] top-[27px] h-3 w-3 rounded-full bg-black" />
      <span className="absolute left-[53px] top-[27px] h-3 w-3 rounded-full bg-black" />
      <span className="absolute left-[34px] top-[45px] h-4 w-16 rounded-b-full border-b-4 border-purple-950" />
    </div>
  );
}

function Snail({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute z-30" style={{ left, top }}>
      <div className="absolute left-[26px] top-16 h-28 w-[62px] rounded-full bg-lime-500" />
      <div className="h-[58px] w-[58px] rounded-full border-[10px] border-orange-900 bg-red-500 shadow-xl" />
      <span className="absolute left-72 top-6 h-20 w-2 rounded bg-lime-700" />
      <span className="absolute left-[94px] top-4 h-[22px] w-2 rounded bg-lime-700" />
      <span className="absolute left-[68px] top-2 h-10 w-10 rounded-full bg-white" />
      <span className="absolute left-[90px] top-0 h-10 w-10 rounded-full bg-white" />
    </div>
  );
}

function Lantern({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute z-20" style={{ left, top }}>
      <span className="absolute h-[76px] w-7 rounded bg-amber-900" />
      <span className="absolute left-0 top-0 h-8 w-[120px] rounded bg-amber-700" />
      <span className="absolute left-72 top-[30px] h-[54px] w-[34px] rounded-2xl border-4 border-amber-900 bg-yellow-200 shadow-[0_0_24px_rgba(255,212,88,0.8)]" />
    </div>
  );
}

function PortalGate({ tick }: { tick: number }) {
  return (
    <div className="absolute z-20" style={{ left: PORTAL.x, top: PORTAL.y }}>
      <div className="absolute left-2 top-[118px] h-28 w-[114px] rounded-[50%] bg-indigo-950/[0.5] blur" />
      <div
        className="h-[176px] w-[112px] rounded-[50%] border-[9px] border-violet-200 bg-[radial-gradient(circle,#f6f0ff_0_8%,#995dff_9%_18%,#1a0866_24%_48%,#7e41ff_55%,#100439_78%)] shadow-[0_0_38px_rgba(129,91,255,0.85)]"
        style={{ transform: `rotate(${Math.sin(tick / 14) * 3}deg)` }}
      />
    </div>
  );
}

function Coin({ coins, tick }: { coins: number; tick: number }) {
  if (coins > 0) return null;
  return (
    <div
      className="absolute z-40 grid h-[42px] w-[42px] place-items-center rounded-full border-4 border-amber-700 bg-yellow-300 text-xl font-black text-amber-900 shadow-[0_0_18px_rgba(255,229,88,0.9)]"
      style={{ left: COIN.x, top: COIN.y + Math.sin(tick / 8) * 8 }}
    >
      ✦
    </div>
  );
}

function Monsters({ state }: { state: GameState }) {
  return (
    <>
      <AcornEnemy
        x={state.enemyX}
        y={FLOOR_Y - 100}
        direction={state.enemyDirection}
        hp={state.enemyHp}
      />
      <AcornEnemy x={1038} y={FLOOR_Y - 104} direction={-1} hp={2} sleepy />
    </>
  );
}

function AcornEnemy({
  x,
  y,
  direction,
  hp,
  sleepy = false,
}: {
  x: number;
  y: number;
  direction: 1 | -1;
  hp: number;
  sleepy?: boolean;
}) {
  return (
    <div
      className={`absolute z-40 ${hp <= 0 ? "opacity-35 grayscale" : ""}`}
      style={{ left: x, top: y, transform: `scaleX(${direction})` }}
    >
      <div className="relative h-[112px] w-[104px] rounded-[52%_52%_46%_46%] border-4 border-amber-900 bg-[linear-gradient(180deg,#c77a2a_0%,#f0a14b_52%,#8a4a24_100%)] shadow-xl">
        <div className="absolute -top-[24px] left-[18px] h-[44px] w-[74px] rounded-t-[70px] rounded-b-[28px] bg-[linear-gradient(180deg,#6d3b1a,#b46b2c)]" />
        <span className="absolute -top-[32px] left-[40px] h-[34px] w-[22px] rotate-[-25deg] rounded-[100%_0_100%_0] bg-lime-500" />
        <span className="absolute left-[28px] top-[36px] h-[10px] w-[8px] rounded-full bg-amber-950" />
        <span className="absolute left-[66px] top-[36px] h-[10px] w-[8px] rounded-full bg-amber-950" />
        <span className="absolute left-[34px] top-[58px] h-4 w-[34px] rounded-b-full border-b-4 border-amber-950" />
        <span className="absolute -left-[14px] top-[70px] h-[18px] w-[28px] rounded-full bg-amber-700" />
        <span className="absolute left-[88px] top-[70px] h-[18px] w-[28px] rounded-full bg-amber-700" />
        {sleepy ? (
          <span className="absolute left-[72px] -top-[30px] text-2xl font-black text-white drop-shadow">
            zZ
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Player({ state, action }: { state: GameState; action: Action }) {
  const isMelee = action === "melee";
  const isHurt = action === "hurt";
  return (
    <div
      className="absolute z-50"
      style={{
        left: state.x,
        top: state.y,
        transform: `scaleX(${state.facing})`,
      }}
    >
      <div className="relative h-[138px] w-[142px]">
        <div
          className={`absolute left-[10px] top-[20px] h-[104px] w-[118px] rounded-[55%_55%_48%_48%] border-4 border-emerald-950 bg-[radial-gradient(circle_at_35%_24%,#e2ff85_0_8%,transparent_10%),linear-gradient(180deg,#9dff31_0%,#42d934_46%,#15983d_100%)] shadow-[0_18px_28px_rgba(18,90,39,0.35)] ${isHurt ? "brightness-125 saturate-50" : ""}`}
        >
          <span className="absolute left-[30px] top-[34px] h-[16px] w-[12px] rounded-full bg-black" />
          <span className="absolute left-[68px] top-[34px] h-[16px] w-[12px] rounded-full bg-black" />
          <span className="absolute left-[34px] top-[38px] h-[5px] w-[4px] rounded-full bg-white" />
          <span className="absolute left-[72px] top-[38px] h-[5px] w-[4px] rounded-full bg-white" />
          <span className="absolute left-[36px] top-[72px] h-[8px] w-[40px] rounded-b-full border-b-8 border-emerald-950" />
          <span className="absolute left-[14px] top-[62px] h-[16px] w-[12px] rounded-full bg-pink-300/[0.8]" />
          <span className="absolute left-[86px] top-[62px] h-[16px] w-[12px] rounded-full bg-pink-300/[0.8]" />
        </div>
        <div className="absolute -top-[2px] left-[28px] h-[46px] w-[70px] rotate-[-9deg] rounded-b-[36px] rounded-t-[80px] bg-emerald-600 shadow-lg" />
        <span className="absolute -top-[18px] left-[58px] h-[42px] w-[24px] rotate-[26deg] rounded-[100%_0_100%_0] bg-lime-300" />
        <span className="absolute top-[78px] left-0 h-[42px] w-[26px] rotate-[28deg] rounded-full bg-emerald-500" />
        <span className="absolute top-[84px] left-[112px] h-[42px] w-[28px] rotate-[-26deg] rounded-full bg-emerald-500" />
        <span className="absolute left-[20px] top-[118px] h-[18px] w-[38px] rounded-full bg-emerald-800" />
        <span className="absolute left-[78px] top-[118px] h-[18px] w-[38px] rounded-full bg-emerald-800" />
        <span className="absolute left-0 top-[72px] h-[66px] w-[18px] rounded-full bg-amber-700" />
        <span className="absolute left-[4px] top-[96px] h-[24px] w-[32px] rounded-lg bg-amber-900" />
        <Sword active={isMelee} />
      </div>
    </div>
  );
}

function Sword({ active }: { active: boolean }) {
  return (
    <div
      className="absolute left-[104px] top-[34px] origin-bottom-left"
      style={{ transform: active ? "rotate(-72deg)" : "rotate(-28deg)" }}
    >
      <span className="absolute left-0 top-[58px] h-[16px] w-[12px] rounded bg-amber-900" />
      <span className="absolute left-[8px] top-0 h-[76px] w-[20px] rounded-t-full bg-[linear-gradient(90deg,#fff7a8,#74ff9b,#0f9f52)] shadow-[0_0_20px_rgba(148,255,124,0.95)]" />
    </div>
  );
}

function Effects({
  effects,
  facing,
}: {
  effects: EffectBurst[];
  facing: 1 | -1;
}) {
  return effects.map((effect, index) => {
    if (effect.kind === "slash") {
      return (
        <div
          key={`${effect.kind}-${index}-${effect.ttl}`}
          className="absolute z-[60] h-[150px] w-[250px] rounded-[50%] border-b-[18px] border-l-[10px] border-l-transparent border-b-lime-200 opacity-90 blur-[1px]"
          style={{
            left: effect.x - (facing === 1 ? 20 : 140),
            top: effect.y,
            transform: `scaleX(${facing}) rotate(-12deg)`,
          }}
        />
      );
    }
    if (effect.kind === "projectile") {
      return (
        <div
          key={`${effect.kind}-${index}-${effect.ttl}`}
          className="absolute z-[60] h-[34px] w-[68px] rounded-full bg-[radial-gradient(circle,#efffc6,#66ff5d_60%,transparent_72%)] shadow-[0_0_18px_rgba(138,255,89,0.95)]"
          style={{ left: effect.x, top: effect.y }}
        />
      );
    }
    return (
      <div
        key={`${effect.kind}-${index}-${effect.ttl}`}
        className="absolute z-[65] h-[62px] w-[62px] rounded-full bg-[radial-gradient(circle,#fff6a3_0_18%,#ff9b1b_20%_42%,transparent_64%)]"
        style={{ left: effect.x, top: effect.y }}
      />
    );
  });
}

function DamageNumber({ state }: { state: GameState }) {
  return (
    <div
      className="absolute z-[70] text-6xl font-black text-orange-400 drop-shadow-[0_4px_0_rgba(96,22,0,0.95)]"
      style={{ left: state.enemyX + 86, top: FLOOR_Y - 250 }}
    >
      128!
    </div>
  );
}

function TopLeftHud({ state }: { state: GameState }) {
  const hpMax = 560;
  const hp = Math.max(0, Math.round((hpMax * state.hp) / 3));
  return (
    <div className="absolute left-4 top-4 z-[90] flex items-center gap-3">
      <div className="relative h-[126px] w-[126px] rounded-full border-4 border-amber-200 bg-[radial-gradient(circle_at_40%_25%,#edff94,#32df48_62%,#087231)] shadow-[0_8px_24px_rgba(0,0,0,0.42)]">
        <span className="absolute left-[35px] top-[54px] h-[13px] w-[10px] rounded-full bg-black" />
        <span className="absolute left-[76px] top-[54px] h-[13px] w-[10px] rounded-full bg-black" />
        <span className="absolute left-[45px] top-[76px] h-5 w-[34px] rounded-b-full border-b-[5px] border-emerald-950" />
        <span className="absolute -right-2 bottom-4 grid h-[36px] w-[36px] place-items-center rounded-full bg-amber-400 text-xl shadow-lg">
          ⭐
        </span>
      </div>
      <div className="min-w-[240px] rounded-2xl bg-black/[0.35] p-2 text-white shadow-xl backdrop-blur-md">
        <div className="text-xl font-black leading-tight drop-shadow">
          Lv. 12
        </div>
        <div className="text-2xl font-black leading-tight drop-shadow">
          Sproutling
        </div>
        <StatusBar
          label="HP"
          value={hp}
          max={hpMax}
          color="from-red-600 to-orange-400"
        />
        <StatusBar
          label="MP"
          value={220}
          max={220}
          color="from-blue-700 to-cyan-300"
        />
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="w-[30px] text-sm font-black text-amber-200">
        {label}
      </span>
      <div className="h-[24px] w-[210px] overflow-hidden rounded-md border border-black/[0.5] bg-black/[0.55]">
        <div
          className={`h-full bg-gradient-to-r ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-[76px] text-right text-sm font-black">
        {value} / {max}
      </span>
    </div>
  );
}

function LeftRail() {
  return (
    <div className="absolute left-[18px] top-[176px] z-[90] flex flex-col gap-[18px]">
      {[
        ["🙂", "bg-amber-200"],
        ["👥", "bg-sky-300"],
        ["✦", "bg-violet-300"],
      ].map(([icon, color]) => (
        <button
          key={icon}
          type="button"
          className={`grid h-[58px] w-[58px] place-items-center rounded-2xl border border-white/[0.4] ${color} text-3xl shadow-[0_8px_16px_rgba(0,0,0,0.32)]`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function RightMissionPanel({
  leafDrops,
  onReset,
}: {
  leafDrops: number;
  onReset: () => void;
}) {
  return (
    <div className="absolute right-12 top-16 z-[90] w-[286px] space-y-10">
      <div className="overflow-hidden rounded-2xl border border-white/[0.35] bg-black/[0.5] p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between text-lg font-black">
          <span>Greenbloom Forest</span>
          <span className="rounded bg-amber-300/[0.2] px-2 text-sm text-amber-200">
            CH. 01
          </span>
        </div>
        <div className="relative mt-3 h-[156px] overflow-hidden rounded-xl border border-white/[0.3] bg-[linear-gradient(180deg,#0a5f78,#17351c)]">
          <MiniPlatform left={12} top={100} width={102} />
          <MiniPlatform left={150} top={58} width={80} />
          <MiniPlatform left={72} top={22} width={44} />
          <span className="absolute left-[32px] top-[72px] h-[8px] w-[8px] rounded-full bg-lime-300" />
          <span className="absolute left-[178px] top-[34px] h-[9px] w-[9px] rounded-full bg-amber-300" />
          <span className="absolute bottom-3 right-4 grid h-[40px] w-[40px] place-items-center rounded-xl bg-black/[0.55] text-3xl">
            +
          </span>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.25] bg-black/[0.48] p-5 shadow-2xl backdrop-blur-md">
        <p className="text-xl font-black text-yellow-300">(!) The Lost Acorn</p>
        <p className="mt-5 text-lg font-bold">Defeat Acornies</p>
        <p className="mt-4 text-xl font-black text-lime-200">
          🍃 {leafDrops} / 12
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="ml-auto block rounded-2xl border border-white/[0.35] bg-white/[0.18] px-5 py-3 text-sm font-black shadow-xl backdrop-blur-md transition hover:bg-white/[0.28]"
      >
        다시 시작
      </button>
    </div>
  );
}

function MiniPlatform({
  left,
  top,
  width,
}: {
  left: number;
  top: number;
  width: number;
}) {
  return (
    <span
      className="absolute h-[14px] rounded-full bg-lime-500 shadow-[0_8px_0_#5a3a1f]"
      style={{ left, top, width }}
    />
  );
}

function BattleLog({ leafDrops }: { leafDrops: number }) {
  return (
    <div className="absolute bottom-[34px] left-12 z-[90] w-[300px] rounded-xl border border-white/[0.25] bg-black/[0.45] p-3 text-sm font-bold text-white shadow-xl backdrop-blur-md">
      <p>You obtained {leafDrops * 3} Leaf Drops!</p>
      <p className="text-lime-200">You gained 48 EXP.</p>
    </div>
  );
}

function BottomDock() {
  return (
    <div className="absolute bottom-28 left-1/2 z-[95] flex -translate-x-1/2 items-end gap-4">
      <div className="flex rounded-2xl border border-white/[0.3] bg-black/[0.45] p-2 shadow-2xl backdrop-blur-md">
        {SKILLS.map((skill) => (
          <div
            key={skill.key}
            className="relative mx-1 h-[78px] w-[78px] rounded-xl border border-white/[0.45] bg-black/[0.3] p-1"
          >
            <div
              className={`grid h-full w-full place-items-center rounded-lg bg-gradient-to-br ${skill.color} text-4xl font-black shadow-inner`}
            >
              {skill.icon}
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/[0.8] px-2 text-sm font-black">
              {skill.key}
            </span>
          </div>
        ))}
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="mx-1 h-[78px] w-[78px] rounded-xl border border-white/[0.2] bg-white/[0.1]"
          />
        ))}
      </div>
      <IconButton icon="🎒" label="Bag" />
      <IconButton icon="📘" label="Skills" active />
      <IconButton icon="📜" label="Quests" />
      <IconButton icon="🧭" label="Map" />
      <IconButton icon="👥" label="Friends" />
      <IconButton icon="☰" label="Menu" />
      <div className="ml-4 flex h-[54px] items-center gap-3 rounded-2xl border border-white/[0.25] bg-black/[0.45] px-5 text-2xl font-black shadow-xl backdrop-blur-md">
        <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-yellow-300 text-amber-900">
          ✦
        </span>
        15,287
        <span className="grid h-[42px] w-[42px] place-items-center rounded-lg bg-white/[0.2]">
          +
        </span>
      </div>
    </div>
  );
}

function IconButton({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="grid justify-items-center gap-1 text-sm font-black drop-shadow">
      <div
        className={`grid h-[64px] w-[64px] place-items-center rounded-2xl border border-white/[0.3] ${active ? "bg-violet-500" : "bg-black/[0.42]"} text-3xl shadow-xl backdrop-blur-md`}
      >
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}

function ExpBar() {
  return (
    <div className="absolute inset-x-12 bottom-8 z-[95] h-[18px] rounded-full border border-black/[0.5] bg-black/[0.6] shadow-inner">
      <div className="h-full w-[68.7%] rounded-full bg-gradient-to-r from-lime-500 via-lime-300 to-emerald-500" />
      <span className="absolute -left-1 -top-1 text-base font-black text-lime-200 drop-shadow">
        EXP 68.7%
      </span>
    </div>
  );
}

function ClearOverlay({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-0 z-[120] grid place-items-center bg-emerald-950/[0.42] backdrop-blur-sm">
      <div className="rounded-[2rem] border border-lime-200 bg-white/[0.9] p-8 text-center text-emerald-950 shadow-2xl">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-3 text-3xl font-black">포탈 도착!</h2>
        <p className="mt-2 text-sm font-bold">
          Greenbloom Forest를 클리어했습니다.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg"
        >
          다시 시작
        </button>
      </div>
    </div>
  );
}
