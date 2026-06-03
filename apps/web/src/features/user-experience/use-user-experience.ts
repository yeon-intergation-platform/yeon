"use client";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { userExperienceViewSchema } from "@yeon/api-contract/user-experience";
import { userExperienceQueryKeys } from "./user-experience-query-keys";

async function loadUserExperience() {
  const response = await fetchYeon("/api/v1/user-experience", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("경험치 정보를 불러오지 못했습니다.");
  }

  return userExperienceViewSchema.parse(await response.json());
}

// 현재 로그인 사용자의 레벨/경험치 요약. userId는 서버 세션에서 주입된다.
export function useUserExperience(isAuthenticated: boolean) {
  return useQuery({
    queryKey: userExperienceQueryKeys.me(isAuthenticated),
    queryFn: loadUserExperience,
    enabled: isAuthenticated,
  });
}
