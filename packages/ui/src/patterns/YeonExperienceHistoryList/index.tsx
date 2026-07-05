import type { ExperienceHistoryItem } from "@yeon/api-contract/user-experience";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonExperienceHistoryListProps = {
  activityLabels: Record<string, string>;
  className?: string;
  emptyText?: string;
  items: ExperienceHistoryItem[];
  locale?: string;
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
  className,
  emptyText = "아직 적립된 경험치가 없습니다.",
  items,
  locale = "ko-KR",
}: YeonExperienceHistoryListProps) {
  if (items.length === 0) {
    return (
      <YeonView
        className={joinClassNames(
          "rounded-2xl bg-[#fafafa] px-4 py-6",
          className
        )}
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-center text-[13px] text-[#aaa]"
        >
          {emptyText}
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonView className={joinClassNames("flex flex-col", className)}>
      {items.map((item, index) => (
        <YeonView
          key={`${item.referenceId}-${item.createdAt}-${index}`}
          className="flex flex-row items-center justify-between gap-3 border-b border-[#f0f0f0] py-3 last:border-b-0"
        >
          <YeonView className="flex flex-col gap-1">
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-bold text-[#111]"
            >
              {resolveLabel(activityLabels, item.activityType)}
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[12px] text-[#aaa]"
            >
              {formatTimestamp(item.createdAt, locale)}
            </YeonText>
          </YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-extrabold text-[#111]"
          >
            {`+${item.xpAmount} XP`}
          </YeonText>
        </YeonView>
      ))}
    </YeonView>
  );
}
