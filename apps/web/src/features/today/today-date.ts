import { todayDateSchema } from "@yeon/api-contract/today";

export function getLocalDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function normalizeDate(value: string | null, fallback = getLocalDate()) {
  const parsed = todayDateSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function formatKoreanDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" })
    .format(date)
    .replace("요일", "");
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${year}년 ${month}월`;
}

export function toMonth(value: string) {
  return value.slice(0, 7);
}

export function addMonths(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  const next = new Date(year!, month! - 1 + amount, 1);
  return getLocalDate(next).slice(0, 7);
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}시간 ${remaining}분` : `${hours}시간`;
}

export type CalendarCell = {
  date: string;
  day: number;
  inMonth: boolean;
};

export function buildCalendarCells(month: string): CalendarCell[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year!, monthNumber! - 1, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: getLocalDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthNumber! - 1,
    };
  });
}
