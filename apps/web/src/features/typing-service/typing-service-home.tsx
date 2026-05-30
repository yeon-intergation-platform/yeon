"use client";

import { YeonButton, YeonSurface } from "@/components/yeon-ui";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useTypingProfile } from "./use-typing-profile";
import {
  TypingProfileCard,
  TypingProfileCardSkeleton,
} from "./typing-profile-card";
import { TypingServiceHeader } from "./typing-service-header";
import { createTranslator, useTypingSettings } from "./use-typing-settings";
import { TYPING_SERVICE_HOME_CLASS } from "./typing-service-home.const";

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
      aria-label={`${label} — ${description}`}
      className={`${TYPING_SERVICE_HOME_CLASS.startCardBase} ${
        isPrimary
          ? TYPING_SERVICE_HOME_CLASS.startCardPrimary
          : TYPING_SERVICE_HOME_CLASS.startCardSecondary
      }`}
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={TYPING_SERVICE_HOME_CLASS.startCardLabel}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={
          isPrimary
            ? TYPING_SERVICE_HOME_CLASS.startCardDescriptionPrimary
            : TYPING_SERVICE_HOME_CLASS.startCardDescriptionSecondary
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
    <div className={TYPING_SERVICE_HOME_CLASS.root}>
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

      <main className={TYPING_SERVICE_HOME_CLASS.main}>
        <section className={TYPING_SERVICE_HOME_CLASS.introSection}>
          <div className={TYPING_SERVICE_HOME_CLASS.introCopy}>
            <h1 className={TYPING_SERVICE_HOME_CLASS.introTitle}>
              바로 시작하는 타자 연습
            </h1>
            <p className={TYPING_SERVICE_HOME_CLASS.introDescription}>
              원하는 방식으로 연습하거나, 친구들과 함께 타자방에 입장하세요.
            </p>
          </div>
        </section>

        <YeonSurface
          as="section"
          className={TYPING_SERVICE_HOME_CLASS.boardSection}
        >
          <div className={TYPING_SERVICE_HOME_CLASS.profilePanel}>
            <h2 className={TYPING_SERVICE_HOME_CLASS.sectionTitle}>
              내 프로필
            </h2>
            <div className={TYPING_SERVICE_HOME_CLASS.sectionBody}>
              {loaded ? (
                <TypingProfileCard
                  profile={profile}
                  onNicknameChange={(nickname) => updateProfile({ nickname })}
                  onCharacterChange={(characterId) =>
                    updateProfile({ characterId })
                  }
                  locale={settings.locale}
                />
              ) : (
                <TypingProfileCardSkeleton />
              )}
            </div>
          </div>

          <div className={TYPING_SERVICE_HOME_CLASS.actionPanel}>
            <h2 className={TYPING_SERVICE_HOME_CLASS.sectionTitle}>
              오늘의 시작
            </h2>

            <div className={TYPING_SERVICE_HOME_CLASS.ctaWrap}>
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
