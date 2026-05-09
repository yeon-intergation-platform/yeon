"use client";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { TYPING_FAQS } from "./typing-content";
import { useTypingProfile } from "./use-typing-profile";
import { TypingBgmButton } from "./typing-bgm-button";
import { TypingProfileCard } from "./typing-profile-card";
import { TypingSettingsButton } from "./typing-settings-button";
import { TypingServiceHeader } from "./typing-service-header";
import { createTranslator, useTypingSettings } from "./use-typing-settings";

const TYPING_SERVICE_HIGHLIGHTS = [
  {
    title: "로그인 없이 바로 시작",
    description:
      "닉네임과 캐릭터를 고른 뒤 바로 연습을 시작하고, 첫 방문에서도 속도와 정확도를 확인할 수 있습니다.",
  },
  {
    title: "혼자 연습 + 타자방 이동",
    description:
      "짧은 개인 연습으로 손을 푼 뒤 공개 타자방이나 레이스로 바로 이어지는 흐름을 같은 서비스 안에서 제공합니다.",
  },
  {
    title: "한글 타자 리듬 점검",
    description:
      "문장 길이와 난이도가 다른 연습 텍스트를 통해 타수, 정확도, 진행률을 함께 보며 리듬을 조정할 수 있습니다.",
  },
] as const;

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
            <span className="inline-flex rounded-full border border-[#e5e5e5] px-3 py-1 text-[11px] font-semibold text-[#555]">
              무료 한글 타자연습
            </span>
            <h1 className="mt-4 text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[36px]">
              로그인 없이 바로 시작하는 타자 속도 테스트
            </h1>
            <p className="mt-4 text-[14px] leading-[1.8] text-[#666] md:text-[15px]">
              무료 한글 타자연습과 타자 속도 테스트를 한 화면에서 바로 시작하고,
              정확도와 타수를 함께 확인할 수 있습니다. 짧은 문장, 문단 연습,
              레이스 진입까지 이어지는 공개형 타자 서비스입니다.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {TYPING_SERVICE_HIGHLIGHTS.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5"
              >
                <h2 className="text-[15px] font-semibold text-[#111]">
                  {highlight.title}
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  {highlight.description}
                </p>
              </article>
            ))}
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
              무료 한글 타자연습과 타자 속도 테스트를 한 화면에서 바로 시작하고,
              정확도와 타수를 함께 확인할 수 있습니다.
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

        <section className="mt-14 w-full max-w-[760px] rounded-[28px] border border-[#e5e5e5] bg-[#fafafa] p-6 md:p-8">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111]">
            자주 묻는 질문
          </h2>
          <div className="mt-5 grid gap-4">
            {TYPING_FAQS.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-white bg-white p-5"
              >
                <h3 className="text-[15px] font-semibold text-[#111]">
                  {faq.question}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.8] text-[#666]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
