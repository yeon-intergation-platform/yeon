"use client";

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
        {loaded && (
          <>
            <TypingProfileCard
              profile={profile}
              onNicknameChange={(nickname) => updateProfile({ nickname })}
              onCharacterChange={(characterId) => updateProfile({ characterId })}
              locale={settings.locale}
            />

            <div className="mt-5 grid w-[340px] gap-3">
              <a
                href="/typing-service/rooms"
                className="inline-flex items-center justify-center rounded-xl bg-[#111] py-4 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
              >
                타자방 입장
              </a>
              <a
                href="/typing-service/decks"
                className="inline-flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-3.5 text-[14px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
              >
                연습 덱 관리
              </a>
              <a
                href="/typing-service/play"
                className="inline-flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-3.5 text-[14px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
              >
                {t("joinRace")}
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
