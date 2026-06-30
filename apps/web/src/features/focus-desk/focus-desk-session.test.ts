import {
  CARD_REVIEW_DIFFICULTIES,
  type CardDeckItemDto,
} from "@yeon/api-contract/card-decks";
import { describe, expect, it } from "vitest";
import {
  FOCUS_DESK_MODES,
  applyFocusDeskReviewResult,
  applyFocusDeskSkip,
  buildFocusDeskStudyQueue,
  createFocusDeskSummary,
  createInitialFocusDeskStats,
  getNextFocusDeskCardIndex,
  parseFocusDeskMode,
  parseFocusDeskSessionMinutes,
} from "./focus-desk-session";

function card(
  id: string,
  patch: Partial<CardDeckItemDto> = {}
): CardDeckItemDto {
  return {
    id,
    frontText: `front ${id}`,
    backText: `back ${id}`,
    imageStorageKey: null,
    imageUrl: null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
    ...patch,
  };
}

describe("focus-desk-session", () => {
  it("잘못된 query 값은 기본 세션 값으로 보정한다", () => {
    expect(parseFocusDeskMode("wrong")).toBe(FOCUS_DESK_MODES.review);
    expect(parseFocusDeskSessionMinutes("13")).toBe(25);
  });

  it("review 모드는 어려움/복습 예정 카드만 우선 큐로 만든다", () => {
    const queue = buildFocusDeskStudyQueue({
      items: [
        card("easy", {
          reviewDifficulty: CARD_REVIEW_DIFFICULTIES.easy,
          nextReviewAt: "2026-07-10T00:00:00.000Z",
        }),
        card("hard", {
          reviewDifficulty: CARD_REVIEW_DIFFICULTIES.hard,
        }),
        card("due", {
          reviewDifficulty: CARD_REVIEW_DIFFICULTIES.good,
          nextReviewAt: "2026-06-29T00:00:00.000Z",
        }),
      ],
      minutes: 25,
      mode: FOCUS_DESK_MODES.review,
      now: new Date("2026-06-30T00:00:00.000Z"),
    });

    expect(queue.map((item) => item.id)).toEqual(["hard", "due"]);
  });

  it("exam 모드는 어려운 카드와 미복습 카드를 앞에 둔다", () => {
    const queue = buildFocusDeskStudyQueue({
      items: [
        card("easy", {
          reviewDifficulty: CARD_REVIEW_DIFFICULTIES.easy,
          lastReviewedAt: "2026-06-28T00:00:00.000Z",
        }),
        card("new"),
        card("hard", {
          reviewDifficulty: CARD_REVIEW_DIFFICULTIES.hard,
          lastReviewedAt: "2026-06-29T00:00:00.000Z",
        }),
      ],
      minutes: 25,
      mode: FOCUS_DESK_MODES.exam,
    });

    expect(queue.map((item) => item.id)).toEqual(["hard", "new", "easy"]);
  });

  it("세션 통계와 요약은 카드 원본을 바꾸지 않고 파생한다", () => {
    const stats = applyFocusDeskSkip(
      applyFocusDeskReviewResult(
        createInitialFocusDeskStats(),
        CARD_REVIEW_DIFFICULTIES.hard
      )
    );

    expect(stats).toMatchObject({ reviewed: 1, hard: 1, skipped: 1 });
    expect(
      createFocusDeskSummary({
        plannedMinutes: 25,
        startedAt: new Date("2026-06-30T00:00:00.000Z"),
        endedAt: new Date("2026-06-30T00:02:05.000Z"),
        stats,
      })
    ).toMatchObject({ elapsedSeconds: 125, reviewed: 1, skipped: 1 });
  });

  it("마지막 카드를 지나도 세션 종료 대신 큐 완료 인덱스로 멈춘다", () => {
    expect(getNextFocusDeskCardIndex({ currentIndex: 0, queueLength: 3 })).toBe(
      1
    );
    expect(getNextFocusDeskCardIndex({ currentIndex: 2, queueLength: 3 })).toBe(
      3
    );
    expect(getNextFocusDeskCardIndex({ currentIndex: 3, queueLength: 3 })).toBe(
      3
    );
  });
});
