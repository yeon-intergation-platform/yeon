import { YeonProgressBar } from "../../primitives/YeonProgressBar";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonExperienceBadgeProps = {
  className?: string;
  level: number;
  xpForNextLevel: number;
  xpIntoLevel: number;
};

function clampPercent(into: number, forNext: number) {
  if (!Number.isFinite(into) || !Number.isFinite(forNext) || forNext <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (into / forNext) * 100));
}

// 헤더용 컴팩트 경험치 뱃지. "Lv.N" + 미니 진행바. 데이터 패칭 없음(순수 표시).
export function YeonExperienceBadge({
  className,
  level,
  xpForNextLevel,
  xpIntoLevel,
}: YeonExperienceBadgeProps) {
  const percent = clampPercent(xpIntoLevel, xpForNextLevel);

  return (
    <YeonView
      className={joinClassNames(
        "inline-flex items-center gap-2 rounded-full bg-[#fafafa] px-2.5 py-1.5",
        className
      )}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[11px] font-extrabold text-[#111]"
      >
        {`Lv.${level}`}
      </YeonText>
      <YeonProgressBar
        className="h-1.5 w-12"
        label={`레벨 ${level} 진행도`}
        value={percent}
      />
    </YeonView>
  );
}
