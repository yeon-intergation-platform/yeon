"use client";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useTypingProfile } from "./use-typing-profile";
import { TypingBgmButton } from "./typing-bgm-button";
import { TypingProfileCard } from "./typing-profile-card";
import { TypingSettingsButton } from "./typing-settings-button";
import { TypingServiceHeader } from "./typing-service-header";
import { createTranslator, useTypingSettings } from "./use-typing-settings";

export function TypingServiceHome() {
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
          <>
            <TypingBgmButton />
            <TypingSettingsButton />
          </>
        }
      />

      <main className="flex flex-col items-center px-6 py-16 md:px-10 md:py-24">
        <section className="w-full max-w-[760px]">
          <div className="mx-auto max-w-[520px] text-center">
            <h1 className="mt-4 text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[36px]">
              바로 시작하는 타자 연습
            </h1>
            <p className="mt-4 text-[14px] leading-[1.8] text-[#666] md:text-[15px]">
              닉네임과 캐릭터를 고른 뒤 바로 연습을 시작해보세요.
            </p>
          </div>
        </section>

        {loaded ? (
          <section className="mt-12 flex w-full flex-col items-center">
            <TypingProfileCard
              profile={profile}
              onNicknameChange={(nickname) => updateProfile({ nickname })}
              onCharacterChange={(characterId) =>
                updateProfile({ characterId })
              }
              locale={settings.locale}
            />

            <p className="mt-4 max-w-[340px] text-center text-[13px] leading-[1.7] text-[#666]">
              프로필을 고른 뒤 바로 연습을 시작하거나 타자방으로 이동할 수
              있습니다.
            </p>

            <div className="mt-5 grid w-[340px] gap-3">
              <a
                href="/typing-service/rooms"
                className="inline-flex items-center justify-center rounded-xl bg-[#111] py-4 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
                onClick={() => handleCtaClick("rooms")}
              >
                타자방 입장
              </a>
              <a
                href="/typing-service/decks"
                className="inline-flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-3.5 text-[14px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                onClick={() => handleCtaClick("decks")}
              >
                연습 덱 관리
              </a>
              <a
                href="/typing-service/play"
                className="inline-flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-3.5 text-[14px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                onClick={() => handleCtaClick("play")}
              >
                {t("joinRace")}
              </a>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
