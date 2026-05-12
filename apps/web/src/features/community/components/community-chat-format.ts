export function formatCommunityChatMessageTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

export function trimCommunityChatDisplayText(value: string) {
  return value.trim();
}
