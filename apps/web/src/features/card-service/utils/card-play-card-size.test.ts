import { describe, expect, it } from "vitest";
import {
  CARD_PLAY_CARD_SIZE_LIMITS,
  DEFAULT_CARD_PLAY_CARD_SIZE,
  clampCardPlayCardSize,
  parseCardPlayCardSize,
} from "./card-play-card-size";

describe("card play card size", () => {
  it("invalid storage values fall back to the default size", () => {
    expect(parseCardPlayCardSize(null)).toEqual(DEFAULT_CARD_PLAY_CARD_SIZE);
    expect(parseCardPlayCardSize("not-json")).toEqual(
      DEFAULT_CARD_PLAY_CARD_SIZE
    );
    expect(parseCardPlayCardSize('{"width":"720","height":380}')).toEqual(
      DEFAULT_CARD_PLAY_CARD_SIZE
    );
  });

  it("stored size is clamped to the supported resize range", () => {
    expect(parseCardPlayCardSize('{"width":9999,"height":1}')).toEqual({
      width: CARD_PLAY_CARD_SIZE_LIMITS.maxWidth,
      height: CARD_PLAY_CARD_SIZE_LIMITS.minHeight,
    });
  });

  it("pointer deltas are rounded before applying to style", () => {
    expect(clampCardPlayCardSize({ width: 640.4, height: 300.6 })).toEqual({
      width: 640,
      height: 301,
    });
  });
});
