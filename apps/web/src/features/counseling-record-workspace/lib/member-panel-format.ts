export function formatDaysSince(days: number | null): string {
  if (days === null) return "운영 메모 없음";
  if (days === 0) return "오늘 상담";
  if (days === 1) return "어제 상담";
  return `${days}일 전 상담`;
}

export function formatRecordDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatRecordDuration(ms: number): string {
  if (!ms) return "";
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
