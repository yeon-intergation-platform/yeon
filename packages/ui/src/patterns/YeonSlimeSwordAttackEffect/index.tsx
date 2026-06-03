import { YeonImage } from "../../primitives/YeonImage";

export type YeonSlimeSwordAttackEffectProps = {
  bladeSrc: string;
  facing: 1 | -1;
  groundBottom: number;
  groundOffset: number;
  progress: number;
  tipArcSrc: string;
  x: number;
};

export function YeonSlimeSwordAttackEffect({
  bladeSrc,
  facing,
  groundBottom,
  groundOffset,
  progress,
  tipArcSrc,
  x,
}: YeonSlimeSwordAttackEffectProps) {
  const cutProgress = easeOutCubic(Math.min(1, progress / 0.68));
  const arcProgress = Math.min(1, progress / 0.52);
  const arcFade = Math.max(0, (progress - 0.58) / 0.42);
  const snapLift = Math.sin(cutProgress * Math.PI) * 8;
  const bladeRotation = -24 + cutProgress * 78;
  const bladeSpeedScale = 1.02 + Math.sin(cutProgress * Math.PI) * 0.1;

  return (
    <>
      <YeonImage
        src={tipArcSrc}
        alt=""
        aria-hidden="true"
        data-testid="slime-sword-attack-effect"
        className="pointer-events-none absolute z-10 select-none"
        style={{
          left: facing === 1 ? x + 78 : x - 368,
          bottom: groundBottom + groundOffset + 56,
          width: 286,
          height: 330,
          opacity: Math.max(0, 0.96 - arcFade * 0.96),
          transform: `scaleX(${facing}) rotate(${lerp(-8, 2, arcProgress)}deg)`,
          transformOrigin: facing === 1 ? "18% 82%" : "82% 82%",
        }}
      />
      <YeonImage
        src={bladeSrc}
        alt=""
        aria-hidden="true"
        data-testid="slime-sword-attack-blade"
        className="pointer-events-none absolute z-20 select-none"
        style={{
          left: facing === 1 ? x + 58 : x - 38,
          bottom: groundBottom + groundOffset + 68 + snapLift,
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
