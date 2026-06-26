import { describe, expect, it } from "vitest";
import {
  calculateTypingSpeedMetrics,
  calculateTypingScore,
  clampPercent,
  clampRaceProgress,
  countTypingMetricUnits,
  isTypingRoomGuestParticipant,
  isTypingRoomHostParticipant,
  rankTypingResults,
  resolveTypingSpeedStyle,
  TYPING_ROOM_PARTICIPANT_ROLE,
  TYPING_SPEED_STYLE,
  toWpmFromCpm,
  type RankableTypingResult,
} from "./typing-race";

function result(
  overrides: Partial<RankableTypingResult>
): RankableTypingResult {
  return {
    userId: "user",
    label: "User",
    cpm: 0,
    wpm: 0,
    accuracy: 100,
    mistakeCount: 0,
    elapsedTimeMs: 1000,
    score: 0,
    finishedAt: 1000,
    ...overrides,
  };
}

describe("typing race scoring", () => {
  it("calculates score as cpm times normalized accuracy", () => {
    expect(calculateTypingScore(400, 95)).toBe(380);
    expect(calculateTypingScore(421, 97)).toBe(408);
  });

  it("clamps progress and accuracy boundaries", () => {
    expect(clampRaceProgress(-10)).toBe(0);
    expect(clampRaceProgress(120)).toBe(100);
    expect(clampPercent(-1)).toBe(0);
    expect(clampPercent(101)).toBe(100);
  });

  it("converts CPM to standard five-character WPM", () => {
    expect(toWpmFromCpm(400)).toBe(80);
  });

  it("counts Korean typing units in jaso instead of syllables", () => {
    expect(countTypingMetricUnits("가", TYPING_SPEED_STYLE.KO_JASO)).toBe(2);
    expect(countTypingMetricUnits("각", TYPING_SPEED_STYLE.KO_JASO)).toBe(3);
    expect(countTypingMetricUnits("한글", TYPING_SPEED_STYLE.KO_JASO)).toBe(6);
  });

  it("uses five-character WPM for English and jaso CPM for Korean", () => {
    expect(resolveTypingSpeedStyle("ko")).toBe(TYPING_SPEED_STYLE.KO_JASO);
    expect(resolveTypingSpeedStyle("en")).toBe(TYPING_SPEED_STYLE.ENGLISH_WPM);

    expect(calculateTypingSpeedMetrics("hello", 1, "en")).toEqual({
      cpm: 300,
      wpm: 60,
      displaySpeed: 60,
      displayUnit: "wpm",
      typedUnitCount: 5,
    });

    expect(calculateTypingSpeedMetrics("한글", 1, "ko")).toEqual({
      cpm: 360,
      wpm: 0,
      displaySpeed: 360,
      displayUnit: "타",
      typedUnitCount: 6,
    });
  });

  it("ranks by score, accuracy, elapsed time, then mistake count", () => {
    const ranked = rankTypingResults([
      result({
        userId: "slow",
        label: "Slow",
        score: 350,
        accuracy: 100,
        elapsedTimeMs: 5000,
        mistakeCount: 0,
        finishedAt: 5000,
      }),
      result({
        userId: "fast",
        label: "Fast",
        score: 380,
        accuracy: 95,
        elapsedTimeMs: 4500,
        mistakeCount: 2,
        finishedAt: 4500,
      }),
      result({
        userId: "accurate",
        label: "Accurate",
        score: 380,
        accuracy: 98,
        elapsedTimeMs: 6000,
        mistakeCount: 1,
        finishedAt: 6000,
      }),
      result({
        userId: "tie",
        label: "Tie",
        score: 380,
        accuracy: 98,
        elapsedTimeMs: 6000,
        mistakeCount: 3,
        finishedAt: 6100,
      }),
    ]);

    expect(ranked.map((item) => item.userId)).toEqual([
      "accurate",
      "tie",
      "fast",
      "slow",
    ]);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3, 4]);
  });
});

describe("typing room participant role helpers", () => {
  it("checks host/guest roles through shared constants", () => {
    expect(
      isTypingRoomHostParticipant({
        id: "host",
        role: TYPING_ROOM_PARTICIPANT_ROLE.HOST,
        isReady: false,
      })
    ).toBe(true);
    expect(
      isTypingRoomGuestParticipant({
        id: "guest",
        role: TYPING_ROOM_PARTICIPANT_ROLE.GUEST,
        isReady: true,
      })
    ).toBe(true);
  });
});
