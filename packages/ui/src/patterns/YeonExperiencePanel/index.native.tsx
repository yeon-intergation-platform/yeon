import { YeonProgressBar } from "../../primitives/YeonProgressBar/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonExperiencePanelProps = {
  level: number;
  style?: YeonViewProps["style"];
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
  level,
  style,
  totalXp,
  xpForNextLevel,
  xpIntoLevel,
}: YeonExperiencePanelProps) {
  const percent = clampPercent(xpIntoLevel, xpForNextLevel);

  return (
    <YeonView style={[styles.panel, style]}>
      <YeonView style={styles.header}>
        <YeonText variant="unstyled" tone="inherit" style={styles.level}>
          {`Lv.${level}`}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" style={styles.total}>
          {`총 ${formatXp(totalXp)} XP`}
        </YeonText>
      </YeonView>
      <YeonProgressBar
        label={`레벨 ${level} 진행도`}
        style={styles.bar}
        value={percent}
      />
      <YeonText variant="unstyled" tone="inherit" style={styles.caption}>
        {`다음 레벨까지 ${formatXp(xpIntoLevel)} / ${formatXp(xpForNextLevel)} XP`}
      </YeonText>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  bar: {
    height: 10,
  },
  caption: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  header: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  level: {
    color: yeonMobileAppColors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  panel: {
    backgroundColor: yeonMobileAppColors.neutralSoft,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  total: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
});
