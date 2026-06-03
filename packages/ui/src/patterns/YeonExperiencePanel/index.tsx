import { YeonProgressBar } from "../../primitives/YeonProgressBar";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonExperiencePanelProps = {
  className?: string;
  level: number;
  totalXp: number;
  xpForNextLevel: number;
  xpIntoLevel: number;
};

function clampPercent(into: number, forNext: number) {
  if (!Number.isFinite(into) || !Number.isFinite(forNext) || forNext <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (into / forNext) * 100));
}

function formatXp(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Math.trunc(value).toLocaleString("ko-KR");
}

// 프로필용 큰 경험치 패널. 레벨·총 경험치·다음 레벨 진행바. 데이터 패칭 없음(순수 표시).
export function YeonExperiencePanel({
  className,
  level,
  totalXp,
  xpForNextLevel,
  xpIntoLevel,
}: YeonExperiencePanelProps) {
  const percent = clampPercent(xpIntoLevel, xpForNextLevel);

  return (
    <YeonView
      className={joinClassNames(
        "flex flex-col gap-3 rounded-2xl bg-[#fafafa] p-4",
        className
      )}
    >
      <YeonView className="flex flex-row items-baseline justify-between gap-2">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[28px] font-black leading-none tracking-[-0.03em] text-[#111]"
        >
          {`Lv.${level}`}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-bold text-[#666]"
        >
          {`총 ${formatXp(totalXp)} XP`}
        </YeonText>
      </YeonView>
      <YeonProgressBar
        className="h-2.5"
        label={`레벨 ${level} 진행도`}
        value={percent}
      />
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[12px] text-[#666]"
      >
        {`다음 레벨까지 ${formatXp(xpIntoLevel)} / ${formatXp(xpForNextLevel)} XP`}
      </YeonText>
    </YeonView>
  );
}
