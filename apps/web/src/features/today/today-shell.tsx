"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { TodayCalendarResponse } from "@yeon/api-contract/today";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  addMonths,
  buildCalendarCells,
  formatKoreanDate,
  formatMinutes,
  formatMonth,
  getLocalDate,
  toMonth,
} from "@/features/today/today-date";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2";

export function TodayTopTabs({
  active,
  date,
}: {
  active: "board" | "record";
  date: string;
}) {
  const items = [
    { key: "board", label: "할 일 보드", href: `/today?date=${date}` },
    { key: "record", label: "하루 기록", href: `/today/record?date=${date}` },
  ] as const;

  return (
    <nav aria-label="YEON Today 기능" className="flex gap-2">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          aria-current={active === item.key ? "page" : undefined}
          className={`${FOCUS_RING} inline-flex min-h-10 min-w-[126px] items-center justify-center rounded-xl border px-5 text-sm font-bold transition-colors md:min-h-11 md:min-w-[148px] ${
            active === item.key
              ? "border-[#111] bg-[#111] text-white"
              : "border-[#dedede] bg-white text-[#444] hover:border-[#999] hover:text-[#111]"
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function TodayHero({
  active,
  date,
  completedCount,
  totalCount,
  completionRate,
}: {
  active: "board" | "record";
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}) {
  const isToday = date === getLocalDate();
  const title =
    active === "record"
      ? "하루 기록"
      : isToday
        ? "오늘 할 일"
        : `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일 할 일`;

  return (
    <section className="grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_290px] md:items-end md:py-10">
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#333]">
          <CalendarDays size={18} aria-hidden="true" />
          {formatKoreanDate(date)}
        </p>
        <h1 className="text-[38px] font-black leading-none tracking-[-0.055em] text-[#111] md:text-[46px]">
          {title}
        </h1>
        <p className="mt-4 text-[15px] text-[#666]">
          {active === "record"
            ? "계획이 아니라 실제로 보낸 시간을 한 시간씩 남겨보세요."
            : "끝낼 일만 골라 오늘의 집중을 가볍게 만드세요."}
        </p>
      </div>
      <div className="rounded-2xl border border-[#dedede] bg-white p-5">
        <p className="text-xs font-bold text-[#555]">
          {active === "record"
            ? isToday
              ? "오늘 기록률"
              : "선택 날짜 기록률"
            : isToday
              ? "오늘 진행률"
              : "선택 날짜 진행률"}
        </p>
        <div className="mt-2 flex items-baseline gap-2 text-[#111]">
          <strong className="text-[30px] font-black tracking-[-0.04em]">
            {completedCount}
          </strong>
          <span className="text-base font-bold">/ {totalCount}</span>
          <span className="ml-1 text-sm text-[#666]">{completionRate}%</span>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9e9e9]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
          aria-label={active === "record" ? "하루 기록률" : "할 일 완료율"}
        >
          <div
            className="h-full rounded-full bg-[#111] transition-[width] duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export function TodayPageFrame({
  active,
  date,
  visibleMonth,
  onVisibleMonthChange,
  calendar,
  calendarError,
  calendarRetrying = false,
  onRetryCalendar,
  totalCount,
  completedCount,
  estimatedMinutes,
  children,
}: {
  active: "board" | "record";
  date: string;
  visibleMonth: string;
  onVisibleMonthChange(month: string): void;
  calendar?: TodayCalendarResponse;
  calendarError?: string;
  calendarRetrying?: boolean;
  onRetryCalendar?(): void;
  totalCount: number;
  completedCount: number;
  estimatedMinutes: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#111]">
      <CommonProductHeader activeService="todo" />
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
        <TodayHero
          active={active}
          date={date}
          completedCount={completedCount}
          totalCount={totalCount}
          completionRate={
            totalCount === 0
              ? 0
              : Math.round((completedCount / totalCount) * 100)
          }
        />
        <TodayTopTabs active={active} date={date} />
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="min-w-0">{children}</div>
          <TodaySidebar
            active={active}
            date={date}
            visibleMonth={visibleMonth}
            onVisibleMonthChange={onVisibleMonthChange}
            calendar={calendar}
            calendarError={calendarError}
            calendarRetrying={calendarRetrying}
            onRetryCalendar={onRetryCalendar}
            totalCount={totalCount}
            completedCount={completedCount}
            estimatedMinutes={estimatedMinutes}
          />
        </div>
      </main>
    </div>
  );
}

function TodaySidebar({
  active,
  date,
  visibleMonth,
  onVisibleMonthChange,
  calendar,
  calendarError,
  calendarRetrying,
  onRetryCalendar,
  totalCount,
  completedCount,
  estimatedMinutes,
}: {
  active: "board" | "record";
  date: string;
  visibleMonth: string;
  onVisibleMonthChange(month: string): void;
  calendar?: TodayCalendarResponse;
  calendarError?: string;
  calendarRetrying: boolean;
  onRetryCalendar?(): void;
  totalCount: number;
  completedCount: number;
  estimatedMinutes: number;
}) {
  const router = useYeonRouter();
  const today = getLocalDate();
  const cells = buildCalendarCells(visibleMonth);
  const summaries = new Map(calendar?.days.map((day) => [day.date, day]));

  const selectDate = (nextDate: string) => {
    router.push(
      active === "board"
        ? `/today?date=${nextDate}`
        : `/today/record?date=${nextDate}`
    );
    const nextMonth = toMonth(nextDate);
    if (nextMonth !== visibleMonth) onVisibleMonthChange(nextMonth);
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-4" aria-label="날짜와 요약">
      <section className="rounded-2xl border border-[#dedede] bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black tracking-[-0.03em]">
              월간 캘린더
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              {formatMonth(visibleMonth)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
              className={`${FOCUS_RING} grid size-9 place-items-center rounded-lg border border-[#dedede] hover:bg-[#f5f5f5]`}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
              className={`${FOCUS_RING} grid size-9 place-items-center rounded-lg border border-[#dedede] hover:bg-[#f5f5f5]`}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        {calendarError ? (
          <div
            className="mt-4 rounded-xl border border-[#f0d5d2] bg-[#fff8f7] px-3 py-3 text-xs text-[#8b302b]"
            role="alert"
          >
            <p>{calendarError}</p>
            {onRetryCalendar ? (
              <button
                type="button"
                disabled={calendarRetrying}
                onClick={onRetryCalendar}
                className={`${FOCUS_RING} mt-2 rounded-lg border border-[#e5c4c1] bg-white px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {calendarRetrying ? "다시 불러오는 중" : "캘린더 다시 불러오기"}
              </button>
            ) : null}
          </div>
        ) : null}
        <div
          className="mt-5 grid grid-cols-7 text-center text-[11px] font-bold text-[#777]"
          aria-hidden="true"
        >
          {Array.from("일월화수목금토").map((day) => (
            <span key={day} className="py-2">
              {day}
            </span>
          ))}
        </div>
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={`${formatMonth(visibleMonth)} 날짜 선택`}
        >
          {cells.map((cell) => {
            const summary = summaries.get(cell.date);
            const selected = cell.date === date;
            const isToday = cell.date === today;
            const label = [
              formatKoreanDate(cell.date),
              isToday ? "오늘" : "",
              selected ? "선택됨" : "",
              summary?.openCount ? `남은 일 ${summary.openCount}개` : "",
              summary && summary.totalCount > 0 && summary.openCount === 0
                ? "모두 완료"
                : "",
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={cell.date}
                type="button"
                role="gridcell"
                aria-label={label}
                aria-selected={selected}
                onClick={() => selectDate(cell.date)}
                className={`${FOCUS_RING} relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  selected
                    ? "bg-[#111] text-white shadow-sm"
                    : cell.inMonth
                      ? "text-[#222] hover:bg-[#f2f2f2]"
                      : "text-[#bbb] hover:bg-[#f7f7f7]"
                }`}
              >
                <span>{cell.day}</span>
                <span
                  className="mt-0.5 h-1 text-[8px] leading-none"
                  aria-hidden="true"
                >
                  {isToday
                    ? "●"
                    : summary?.openCount
                      ? "○"
                      : summary?.totalCount
                        ? "✓"
                        : ""}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-[#ededed] pt-4 text-[11px] text-[#666]">
          <span>● 오늘</span>
          <span>○ 남은 일</span>
          <span>✓ 완료</span>
        </div>
      </section>

      <section className="rounded-2xl border border-[#dedede] bg-white p-5">
        <h2 className="text-lg font-black tracking-[-0.03em]">
          {Number(date.slice(5, 7))}월 {Number(date.slice(8, 10))}일 요약
        </h2>
        <dl className="mt-4 divide-y divide-[#ededed] rounded-xl border border-[#e5e5e5]">
          <SummaryRow
            label={active === "board" ? "할 일" : "기록 블록"}
            value={`${active === "board" ? totalCount : completedCount}개`}
          />
          <SummaryRow
            label={active === "board" ? "예상 시간" : "기록 시간"}
            value={formatMinutes(estimatedMinutes)}
          />
          <SummaryRow
            label={active === "board" ? "완료" : "기록률"}
            value={
              active === "board"
                ? `${completedCount}개`
                : `${Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%`
            }
          />
        </dl>
      </section>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <dt className="text-sm text-[#555]">{label}</dt>
      <dd className="text-sm font-black text-[#111]">{value}</dd>
    </div>
  );
}

export function TodayLoadingState() {
  return (
    <div
      className="rounded-2xl border border-[#dedede] bg-white p-8"
      aria-live="polite"
    >
      <div className="h-5 w-32 animate-pulse rounded bg-[#e8e8e8]" />
      <div className="mt-5 space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-[#f1f1f1]"
          />
        ))}
      </div>
      <span className="sr-only">Today 데이터를 불러오는 중입니다.</span>
    </div>
  );
}

export function TodayErrorState({
  message,
  onRetry,
  isRetrying = false,
  showLogin = false,
}: {
  message: string;
  onRetry?(): void;
  isRetrying?: boolean;
  showLogin?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-[#dedede] bg-white px-6 py-12 text-center"
      role="alert"
    >
      <h2 className="text-xl font-black">데이터를 불러오지 못했습니다.</h2>
      <p className="mt-2 text-sm text-[#666]">{message}</p>
      <div className="mt-5 flex justify-center gap-2">
        {onRetry ? (
          <button
            type="button"
            disabled={isRetrying}
            onClick={onRetry}
            className={`${FOCUS_RING} rounded-xl bg-[#111] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#999]`}
          >
            {isRetrying ? "다시 불러오는 중" : "다시 시도"}
          </button>
        ) : null}
        {showLogin ? (
          <a
            href="/?login=1"
            className={`${FOCUS_RING} rounded-xl border border-[#dedede] px-5 py-3 text-sm font-bold`}
          >
            로그인
          </a>
        ) : null}
      </div>
    </div>
  );
}
