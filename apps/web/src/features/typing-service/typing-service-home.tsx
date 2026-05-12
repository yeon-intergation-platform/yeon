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
              <YeonButton
                as="a"
                href="/typing-service/rooms"
                variant="primary"
                className="block rounded-2xl px-5 py-5 text-left"
                onClick={() => handleCtaClick("rooms")}
              >
                <span className="block text-[16px] font-bold">타자방 입장</span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-white/70">
                  친구들과 실시간으로 연습하기
                </span>
              </YeonButton>
              <YeonButton
                as="a"
                href="/typing-service/decks"
                variant="secondary"
                className="block rounded-2xl px-5 py-5 text-left"
                onClick={() => handleCtaClick("decks")}
              >
                <span className="block text-[16px] font-bold">
                  연습 덱 관리
                </span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-[#666]">
                  내가 연습할 문장 관리
                </span>
              </YeonButton>
              <YeonButton
                as="a"
                href="/typing-service/play"
                variant="secondary"
                className="block rounded-2xl px-5 py-5 text-left"
                onClick={() => handleCtaClick("play")}
              >
                <span className="block text-[16px] font-bold">
                  {t("joinRace")}
                </span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-[#666]">
                  다른 사용자와 속도 경쟁
                </span>
              </YeonButton>
            </div>
          </div>
        </YeonSurface>
      </main>
    </div>
  );
}
