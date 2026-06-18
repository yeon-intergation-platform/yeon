"use client";
import { YeonExperienceBadge, YeonLink } from "@yeon/ui";
import { QueryProvider } from "@/lib/query-provider";
import { useExperienceAuthState } from "./use-experience-auth-state";
import { useUserExperience } from "./use-user-experience";

// 헤더 배지 본체. 비로그인/로딩/에러 시 미표시. 클릭 시 /profile로 이동.
function HeaderExperienceBadgeInner({
  isAuthenticated,
  levelAriaLabel,
}: {
  isAuthenticated: boolean;
  levelAriaLabel?: (level: number) => string;
}) {
  const experienceQuery = useUserExperience(isAuthenticated);
  const data = experienceQuery.data;

  if (!data) {
    return null;
  }

  return (
    <YeonLink
      href="/profile"
      aria-label={
        levelAriaLabel
          ? levelAriaLabel(data.level)
          : `레벨 ${data.level} 경험치 보기`
      }
      className="no-underline transition-opacity hover:opacity-70"
    >
      <YeonExperienceBadge
        level={data.level}
        xpIntoLevel={data.xpIntoLevel}
        xpForNextLevel={data.xpForNextLevel}
      />
    </YeonLink>
  );
}

// 공통 헤더는 전역 QueryProvider 밖에서도 렌더되므로 배지가 자체 provider를 갖는다.
export function HeaderExperienceBadge({
  levelAriaLabel,
}: {
  levelAriaLabel?: (level: number) => string;
} = {}) {
  const isAuthenticated = useExperienceAuthState();

  // 인증 확인 전(null)·비로그인 시 미표시.
  if (isAuthenticated !== true) {
    return null;
  }

  return (
    <QueryProvider>
      <HeaderExperienceBadgeInner
        isAuthenticated={isAuthenticated}
        levelAriaLabel={levelAriaLabel}
      />
    </QueryProvider>
  );
}
