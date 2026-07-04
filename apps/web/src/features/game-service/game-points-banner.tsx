"use client";
import { YeonText, YeonView } from "@yeon/ui";
import { QueryProvider } from "@/lib/query-provider";
import { useExperienceAuthState } from "@/features/user-experience/use-experience-auth-state";
import { useUserExperience } from "@/features/user-experience/use-user-experience";
import type { GameServiceLanguage } from "./game-service-i18n";

// 포인트·현금 전환 정책 안내(레벨업당 1,000P, 환산율 10,000P = 100원, 관리자 문의로 전환).
const POINTS_NOTICE: Record<
  GameServiceLanguage,
  { authed: string; guest: string; numberLocale: string }
> = {
  ko: {
    authed:
      "게임을 플레이하면 경험치가 쌓여 레벨이 오릅니다. 레벨이 오를 때마다 1,000P가 적립되고, 10,000P당 100원으로 환산해 관리자에게 문의하면 현금으로 바꿀 수 있어요.",
    guest:
      "로그인하고 게임을 플레이하면 경험치와 포인트가 쌓입니다. 레벨이 오를 때마다 1,000P가 적립되고, 10,000P당 100원으로 환산해 관리자 문의로 현금으로 바꿀 수 있어요.",
    numberLocale: "ko-KR",
  },
  en: {
    authed:
      "Playing games earns experience and levels. Each level grants 1,000P, and 10,000P can be converted to 100 KRW by contacting an admin.",
    guest:
      "Sign in before playing to earn experience and points. Each level grants 1,000P, and 10,000P can be converted to 100 KRW by contacting an admin.",
    numberLocale: "en-US",
  },
};

function GamePointsBannerInner({
  isAuthenticated,
  language,
}: {
  isAuthenticated: boolean;
  language: GameServiceLanguage;
}) {
  const { data } = useUserExperience(isAuthenticated);
  const text = POINTS_NOTICE[language];

  return (
    <YeonView className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
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
            className="text-[13px] font-bold text-[#111]"
          >
            {data.points.toLocaleString(text.numberLocale)} P
          </YeonText>
        </YeonView>
      ) : null}
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="min-w-0 flex-1 text-[12px] leading-[1.6] text-[#666]"
      >
        {isAuthenticated ? text.authed : text.guest}
      </YeonText>
    </YeonView>
  );
}

// 게임 허브 상단의 포인트/레벨 안내 배너. 공통 헤더처럼 전역 QueryProvider 밖에서도
// 동작하도록 자체 provider로 감싼다.
export function GamePointsBanner({
  language,
}: {
  language: GameServiceLanguage;
}) {
  const isAuthenticated = useExperienceAuthState();

  return (
    <QueryProvider>
      <GamePointsBannerInner
        isAuthenticated={isAuthenticated === true}
        language={language}
      />
    </QueryProvider>
  );
}
