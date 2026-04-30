import { describe, expect, it } from "vitest";
import {
  calculateTypingScore,
  clampPercent,
  clampRaceProgress,
  rankTypingResults,
  toWpmFromCpm,
  type RankableTypingResult,
} from "./typing-race";

function result(overrides: Partial<RankableTypingResult>): RankableTypingResult {
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

  it("ranks by score, accuracy, elapsed time, then mistake count", () => {
    const ranked = rankTypingResults([
      result({ userId: "slow", label: "Slow", score: 350, accuracy: 100, elapsedTimeMs: 5000, mistakeCount: 0, finishedAt: 5000 }),
      result({ userId: "fast", label: "Fast", score: 380, accuracy: 95, elapsedTimeMs: 4500, mistakeCount: 2, finishedAt: 4500 }),
      result({ userId: "accurate", label: "Accurate", score: 380, accuracy: 98, elapsedTimeMs: 6000, mistakeCount: 1, finishedAt: 6000 }),
      result({ userId: "tie", label: "Tie", score: 380, accuracy: 98, elapsedTimeMs: 6000, mistakeCount: 3, finishedAt: 6100 }),
    ]);

    expect(ranked.map((item) => item.userId)).toEqual(["accurate", "tie", "fast", "slow"]);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3, 4]);
  });
});
