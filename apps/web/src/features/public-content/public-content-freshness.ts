import type { PublicContentArticle } from "./public-content-data";

export const PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS = 180;

type PublicContentFreshnessInput = {
  channel: PublicContentArticle["channel"];
  reviewedAt?: string | null;
  updatedAt: string;
};

type PublicContentFreshnessOptions = {
  referenceDate?: string;
};

export type PublicContentFreshnessState = {
  daysSinceReview: number | null;
  reviewDate: string | null;
  status: "not-required" | "ready" | "warning";
};

function getDateOnly(value: string) {
  return value.split("T")[0] ?? value;
}

function getTimestamp(value: string) {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getPublicContentReviewDate(input: PublicContentFreshnessInput) {
  const reviewedAt = input.reviewedAt?.trim();

  if (reviewedAt) {
    return getDateOnly(reviewedAt);
  }

  return getDateOnly(input.updatedAt);
}

export function getPublicContentFreshnessState(
  input: PublicContentFreshnessInput,
  options: PublicContentFreshnessOptions = {}
): PublicContentFreshnessState {
  if (input.channel !== "support") {
    return {
      daysSinceReview: null,
      reviewDate: null,
      status: "not-required",
    };
  }

  const reviewDate = getPublicContentReviewDate(input);
  const reviewTimestamp = getTimestamp(reviewDate);
  const referenceTimestamp = getTimestamp(
    options.referenceDate ?? new Date().toISOString()
  );

  if (reviewTimestamp === null || referenceTimestamp === null) {
    return {
      daysSinceReview: null,
      reviewDate,
      status: "warning",
    };
  }

  const daysSinceReview = Math.max(
    0,
    Math.floor((referenceTimestamp - reviewTimestamp) / 86_400_000)
  );

  return {
    daysSinceReview,
    reviewDate,
    status:
      daysSinceReview <= PUBLIC_CONTENT_SUPPORT_REVIEW_FRESH_DAYS
        ? "ready"
        : "warning",
  };
}
