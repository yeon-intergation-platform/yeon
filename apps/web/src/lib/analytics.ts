"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export function trackEvent(
  eventName: string,
  params: AnalyticsEventParams = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
