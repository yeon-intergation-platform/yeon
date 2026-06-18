export const COMMUNITY_CHAT_RETENTION_DAYS = 3;

export function formatCommunityChatMessageTimestamp(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

export function trimCommunityChatDisplayText(value: string) {
  return value.trim();
}
