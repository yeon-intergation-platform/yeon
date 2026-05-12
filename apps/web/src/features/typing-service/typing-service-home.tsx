"use client";

import { YeonButton, YeonSurface } from "@/components/yeon-ui";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useTypingProfile } from "./use-typing-profile";
import { TypingProfileCard } from "./typing-profile-card";
import { TypingServiceHeader } from "./typing-service-header";
import { createTranslator, useTypingSettings } from "./use-typing-settings";

type TypingServiceHomeProps = {
  showCharacterAdminLink?: boolean;
};

type StartCardProps = {
  href: string;
  label: string;
  description: string;
  tone: "primary" | "secondary";
  onClick: () => void;
};

function StartCard({
  href,
  label,
  description,
  tone,
  onClick,
}: StartCardProps) {
  const isPrimary = tone === "primary";

  return (
    <YeonButton
      as="a"
      href={href}
      variant={isPrimary ? "primary" : "secondary"}
      className={
        isPrimary
          ? "group relative flex min-h-[96px] items-start overflow-hidden rounded-2xl px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#111] hover:shadow-[0_16px_34px_rgba(17,17,17,0.18)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_16px_34px_rgba(17,17,17,0.18)]"
          : "group relative flex min-h-[96px] items-start overflow-hidden rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#111] hover:bg-[#fafafa] hover:shadow-[0_14px_30px_rgba(17,17,17,0.08)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_14px_30px_rgba(17,17,17,0.08)]"
      }
      onClick={onClick}
    >
      <span className="block text-[17px] font-extrabold tracking-[-0.03em]">
        {label}
      </span>
      <span
        className={
          isPrimary
            ? "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 translate-y-1 text-[13px] font-medium leading-[1.45] text-white/72 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            : "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 translate-y-1 text-[13px] font-medium leading-[1.45] text-[#666] opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        }
      >
        {description}
      </span>
    </YeonButton>
  );
}

export function TypingServiceHome({
  showCharacterAdminLink = false,
}: TypingServiceHomeProps) {
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const t = createTranslator(settings.locale);
  const handleCtaClick = (target: string) => {
    trackEvent(analyticsEvents.typingHomeCtaClick, {
      target,
      locale: settings.locale,
      has_profile: loaded,
      character_id: profile.characterId,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader
        active="home"
        title={t("appName")}
        controls={
          showCharacterAdminLink ? (
            <YeonButton as="a" href="/admin/typing-characters" size="sm">
              캐릭터 프레임 설정
            </YeonButton>
          ) : null
        }
      />

      <main className="flex flex-col items-center px-5 py-5 md:px-10 md:py-5">
        <section className="w-full max-w-[960px]">
          <div className="max-w-[640px]">
            <h1 className="text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]">
              바로 시작하는 타자 연습
            </h1>
            <p className="mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]">
              원하는 방식으로 연습하거나, 친구들과 함께 타자방에 입장하세요.
            </p>
          </div>
        </section>

        <YeonSurface
          as="section"
          className="mt-8 grid w-full max-w-[980px] overflow-hidden rounded-[28px] md:grid-cols-[430px_minmax(0,1fr)]"
        >
          <div className="border-b border-[#e5e5e5] p-5 md:border-b-0 md:border-r md:p-6">
            <h2 className="text-[16px] font-bold text-[#111]">내 프로필</h2>
            <div className="mt-5 flex justify-center">
              <TypingProfileCard
                profile={profile}
                onNicknameChange={(nickname) => updateProfile({ nickname })}
                onCharacterChange={(characterId) =>
                  updateProfile({ characterId })
                }
                locale={settings.locale}
              />
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-[#111]">오늘의 시작</h2>

            <div className="mt-5 grid gap-4">
              <StartCard
                href="/typing-service/rooms"
                label="타자방 입장"
                description="친구들과 실시간으로 함께 연습합니다."
                tone="primary"
                onClick={() => handleCtaClick("rooms")}
              />
              <StartCard
                href="/typing-service/decks"
                label="연습 덱 관리"
                description="연습할 문장을 직접 추가하고 관리합니다."
                tone="secondary"
                onClick={() => handleCtaClick("decks")}
              />
              <StartCard
                href="/typing-service/play"
                label="레이스 입장"
                description="다른 사용자와 타자 속도를 겨룹니다."
                tone="secondary"
                onClick={() => handleCtaClick("play")}
              />
            </div>
          </div>
        </YeonSurface>
      </main>
    </div>
  );
}
