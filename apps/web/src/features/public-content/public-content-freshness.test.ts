import { describe, expect, it } from "vitest";
import {
  getPublicContentFreshnessState,
  getPublicContentReviewDate,
  PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS,
} from "./public-content-freshness";

describe("public content freshness", () => {
  it("support 문서는 reviewedAt이 있으면 최근 확인일로 사용한다", () => {
    expect(
      getPublicContentReviewDate({
        channel: "support",
        reviewedAt: "2026-06-10T00:00:00.000Z",
        updatedAt: "2026-06-01",
      })
    ).toBe("2026-06-10");
  });

  it("reviewedAt이 없으면 updatedAt을 최근 확인일 fallback으로 사용한다", () => {
    expect(
      getPublicContentReviewDate({
        channel: "support",
        updatedAt: "2026-06-17",
      })
    ).toBe("2026-06-17");
  });

  it("support 문서가 180일 이내면 정상으로 본다", () => {
    const state = getPublicContentFreshnessState(
      {
        channel: "support",
        updatedAt: "2026-06-17",
      },
      { referenceDate: "2026-06-17T12:00:00.000Z" }
    );

    expect(state).toMatchObject({
      daysSinceReview: 0,
      reviewDate: "2026-06-17",
      status: "ready",
    });
  });

  it("support 문서가 freshness 기준을 넘으면 확인 필요로 본다", () => {
    const state = getPublicContentFreshnessState(
      {
        channel: "support",
        updatedAt: "2026-01-01",
      },
      { referenceDate: "2026-07-01T00:00:00.000Z" }
    );

    expect(state.daysSinceReview).toBeGreaterThan(
      PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS
    );
    expect(state.status).toBe("warning");
  });

  it("news와 blog는 support freshness 대상이 아니다", () => {
    expect(
      getPublicContentFreshnessState(
        {
          channel: "blog",
          updatedAt: "2020-01-01",
        },
        { referenceDate: "2026-06-17T00:00:00.000Z" }
      )
    ).toEqual({
      daysSinceReview: null,
      reviewDate: null,
      status: "not-required",
    });
  });
});
