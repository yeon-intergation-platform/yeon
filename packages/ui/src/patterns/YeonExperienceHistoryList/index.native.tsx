import type { ExperienceHistoryItem } from "@yeon/api-contract/user-experience";

import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonExperienceHistoryListProps = {
  activityLabels: Record<string, string>;
  emptyText?: string;
  items: ExperienceHistoryItem[];
  locale?: string;
  style?: YeonViewProps["style"];
};

function resolveLabel(
  activityLabels: Record<string, string>,
  activityType: string
) {
  return activityLabels[activityType] ?? activityType;
}

function formatTimestamp(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 경험치 적립 이력 리스트(활동 라벨 + +XP + 시각). 데이터 패칭 없음(순수 표시).
export function YeonExperienceHistoryList({
  activityLabels,
  emptyText = "아직 적립된 경험치가 없습니다.",
  items,
  locale = "ko-KR",
  style,
}: YeonExperienceHistoryListProps) {
  if (items.length === 0) {
    return (
      <YeonView style={[styles.empty, style]}>
        <YeonText variant="unstyled" tone="inherit" style={styles.emptyText}>
          {emptyText}
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonView style={[styles.list, style]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <YeonView
            key={`${item.referenceId}-${item.createdAt}-${index}`}
            style={[styles.row, isLast ? styles.rowLast : null]}
          >
            <YeonView style={styles.copy}>
              <YeonText variant="unstyled" tone="inherit" style={styles.label}>
                {resolveLabel(activityLabels, item.activityType)}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                style={styles.timestamp}
              >
                {formatTimestamp(item.createdAt, locale)}
              </YeonText>
            </YeonView>
            <YeonText variant="unstyled" tone="inherit" style={styles.xp}>
              {`+${item.xpAmount} XP`}
            </YeonText>
          </YeonView>
        );
      })}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  copy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  empty: {
    backgroundColor: yeonMobileAppColors.neutralSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  label: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    flexDirection: "column",
  },
  row: {
    alignItems: "center",
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  timestamp: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  xp: {
    color: yeonMobileAppColors.neutral,
    fontSize: 14,
    fontWeight: "800",
  },
});
