import { formatCommunityShortDateTime } from "../community-date-format";

export const COMMUNITY_CHAT_RETENTION_DAYS = 3;

export function formatCommunityChatMessageTimestamp(isoDate: string) {
  return formatCommunityShortDateTime(isoDate);
}

export function trimCommunityChatDisplayText(value: string) {
  return value.trim();
}
