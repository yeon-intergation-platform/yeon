"use client";
import { YeonText, YeonView } from "@yeon/ui";
import { QueryProvider } from "@/lib/query-provider";
import { useExperienceAuthState } from "@/features/user-experience/use-experience-auth-state";
import { useUserExperience } from "@/features/user-experience/use-user-experience";

// 포인트·현금 전환 정책 안내(레벨업당 1,000P, 환산율 10,000P = 100원, 관리자 문의로 전환).
const AUTHED_NOTICE =
  "게임을 플레이하면 경험치가 쌓여 레벨이 오릅니다. 레벨이 오를 때마다 1,000P가 적립되고, 10,000P당 100원으로 환산해 관리자에게 문의하면 현금으로 바꿀 수 있어요.";
const GUEST_NOTICE =
  "로그인하고 게임을 플레이하면 경험치와 포인트가 쌓입니다. 레벨이 오를 때마다 1,000P가 적립되고, 10,000P당 100원으로 환산해 관리자 문의로 현금으로 바꿀 수 있어요.";

function GamePointsBannerInner({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const { data } = useUserExperience(isAuthenticated);

  return (
    <YeonView className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
      {data ? (
        <YeonView className="flex items-center gap-2">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="inline-flex items-center rounded-full bg-[#111] px-2 py-0.5 text-[11px] font-bold text-white"
          >
            Lv.{data.level}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-bold text-amber-900"
          >
            {data.points.toLocaleString("ko-KR")} P
          </YeonText>
        </YeonView>
      ) : null}
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="min-w-0 flex-1 text-[12px] leading-[1.6] text-amber-800"
      >
        {isAuthenticated ? AUTHED_NOTICE : GUEST_NOTICE}
      </YeonText>
    </YeonView>
  );
}

// 게임 허브 상단의 포인트/레벨 안내 배너. 공통 헤더처럼 전역 QueryProvider 밖에서도
// 동작하도록 자체 provider로 감싼다.
export function GamePointsBanner() {
  const isAuthenticated = useExperienceAuthState();

  return (
    <QueryProvider>
      <GamePointsBannerInner isAuthenticated={isAuthenticated === true} />
    </QueryProvider>
  );
}
