"use client";
import {
  useYeonPathname as usePathname,
  useYeonSearchParams as useSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

export function GoogleAnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (!path || lastTrackedPathRef.current === path) {
      return;
    }

    lastTrackedPathRef.current = path;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}
