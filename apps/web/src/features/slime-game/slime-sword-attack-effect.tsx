import { SLIME_GAME_ASSETS } from "./asset-manifest";
import { SLIME_STAGE } from "./slime-game-domain";

export function SlimeSwordAttackEffect({
  facing,
  groundOffset,
  progress,
  x,
}: {
  x: number;
  groundOffset: number;
  facing: 1 | -1;
  progress: number;
}) {
  const cutProgress = easeOutCubic(Math.min(1, progress / 0.68));
  const arcProgress = Math.min(1, progress / 0.52);
  const arcFade = Math.max(0, (progress - 0.58) / 0.42);
  const snapLift = Math.sin(cutProgress * Math.PI) * 8;
  const bladeRotation = -24 + cutProgress * 78;
  const bladeSpeedScale = 1.02 + Math.sin(cutProgress * Math.PI) * 0.1;

  return (
    <>
      <img
        src={SLIME_GAME_ASSETS.swordTipArc}
        alt=""
        aria-hidden="true"
        data-testid="slime-sword-attack-effect"
        className="pointer-events-none absolute z-10 select-none"
        style={{
          left: facing === 1 ? x + 78 : x - 368,
          bottom: SLIME_STAGE.groundBottom + groundOffset + 56,
          width: 286,
          height: 330,
          opacity: Math.max(0, 0.96 - arcFade * 0.96),
          transform: `scaleX(${facing}) rotate(${lerp(-8, 2, arcProgress)}deg)`,
          transformOrigin: facing === 1 ? "18% 82%" : "82% 82%",
        }}
      />
      <img
        src={SLIME_GAME_ASSETS.swordBlade}
        alt=""
        aria-hidden="true"
        data-testid="slime-sword-attack-blade"
        className="pointer-events-none absolute z-20 select-none"
        style={{
          left: facing === 1 ? x + 58 : x - 38,
          bottom: SLIME_STAGE.groundBottom + groundOffset + 68 + snapLift,
          width: 150,
          height: 220,
          transform: `scaleX(${facing}) rotate(${bladeRotation}deg) scale(${bladeSpeedScale})`,
          transformOrigin: facing === 1 ? "44% 71%" : "56% 71%",
        }}
      />
    </>
  );
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function lerp(start: number, end: number, value: number) {
  return start + (end - start) * value;
}
