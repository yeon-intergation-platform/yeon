import { YeonProgressBar } from "../../primitives/YeonProgressBar/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonExperienceBadgeProps = {
  level: number;
  style?: YeonViewProps["style"];
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
  level,
  style,
  xpForNextLevel,
  xpIntoLevel,
}: YeonExperienceBadgeProps) {
  const percent = clampPercent(xpIntoLevel, xpForNextLevel);

  return (
    <YeonView style={[styles.badge, style]}>
      <YeonText variant="unstyled" tone="inherit" style={styles.level}>
        {`Lv.${level}`}
      </YeonText>
      <YeonProgressBar
        label={`레벨 ${level} 진행도`}
        style={styles.bar}
        value={percent}
      />
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  badge: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.neutralSoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bar: {
    height: 6,
    width: 48,
  },
  level: {
    color: yeonMobileAppColors.neutral,
    fontSize: 11,
    fontWeight: "800",
  },
});
