"use client";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { experienceHistoryResponseSchema } from "@yeon/api-contract/user-experience";
import { userExperienceQueryKeys } from "./user-experience-query-keys";

async function loadExperienceHistory(limit?: number) {
  const query =
    limit && Number.isFinite(limit) && limit > 0
      ? `?limit=${Math.trunc(limit)}`
      : "";

  const response = await fetchYeon(`/api/v1/user-experience/history${query}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("경험치 이력을 불러오지 못했습니다.");
  }

  return experienceHistoryResponseSchema.parse(await response.json());
}

// 현재 로그인 사용자의 경험치 적립 이력. userId는 서버 세션에서 주입된다.
export function useExperienceHistory(isAuthenticated: boolean, limit?: number) {
  return useQuery({
    queryKey: userExperienceQueryKeys.history(isAuthenticated),
    queryFn: () => loadExperienceHistory(limit),
    enabled: isAuthenticated,
  });
}
