const COMMUNITY_SHORT_DATE_TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const COMMUNITY_MEDIUM_DATE_TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const COMMUNITY_INVALID_DATE_LABEL = "날짜 없음";

function parseCommunityDateTime(isoDate: string): Date | null {
  const time = new Date(isoDate).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }
  return new Date(time);
}

export function formatCommunityShortDateTime(isoDate: string): string {
  const date = parseCommunityDateTime(isoDate);
  return date
    ? COMMUNITY_SHORT_DATE_TIME_FORMAT.format(date)
    : COMMUNITY_INVALID_DATE_LABEL;
}

export function formatCommunityMediumDateTime(isoDate: string): string {
  const date = parseCommunityDateTime(isoDate);
  return date
    ? COMMUNITY_MEDIUM_DATE_TIME_FORMAT.format(date)
    : COMMUNITY_INVALID_DATE_LABEL;
}

export function readCommunityDateTimeMs(isoDate: string): number | null {
  const date = parseCommunityDateTime(isoDate);
  return date ? date.getTime() : null;
}

export function formatCommunityRelativeTime(isoDate: string): string {
  const createdAtMs = readCommunityDateTimeMs(isoDate);
  if (createdAtMs === null) {
    return formatCommunityShortDateTime(isoDate);
  }

  const diffMs = getYeonNow() - createdAtMs;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return formatCommunityShortDateTime(isoDate);
}
import { getYeonNow } from "@yeon/ui/runtime/YeonBrowserRuntime";
