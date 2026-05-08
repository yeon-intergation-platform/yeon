import { describe, expect, it } from "vitest";

import { calculateTypingSpeedMetrics } from "./race-metrics";

describe("race metrics", () => {
  it("calculates Korean typing speed from jaso units", () => {
    expect(calculateTypingSpeedMetrics("한글", 1, "ko")).toMatchObject({
      cpm: 360,
      wpm: 0,
      displaySpeed: 360,
      displayUnit: "타",
      typedUnitCount: 6,
    });
  });

  it("calculates English typing speed in WPM", () => {
    expect(calculateTypingSpeedMetrics("hello world", 2, "en")).toMatchObject({
      cpm: 330,
      wpm: 66,
      displaySpeed: 66,
      displayUnit: "wpm",
      typedUnitCount: 11,
    });
  });
});
