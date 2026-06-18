"use client";
import { YeonButton, YeonSurface, YeonView, YeonText } from "@yeon/ui";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useTypingProfile } from "./use-typing-profile";
import {
  TypingProfileCard,
  TypingProfileCardSkeleton,
} from "./typing-profile-card";
import { TypingServiceHeader } from "./typing-service-header";
import { createTranslator, useTypingSettings } from "./use-typing-settings";
import { TYPING_SERVICE_HOME_CLASS } from "./typing-service-home.const";
import { getTypingUiText } from "./typing-service-i18n";

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
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        aria-hidden="true"
        className={TYPING_SERVICE_HOME_CLASS.startCardLabel}
      >
        {label}
      </YeonText>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        aria-hidden="true"
        className={
          isPrimary
            ? TYPING_SERVICE_HOME_CLASS.startCardDescriptionPrimary
            : TYPING_SERVICE_HOME_CLASS.startCardDescriptionSecondary
        }
      >
        {description}
      </YeonText>
    </YeonButton>
  );
}

export function TypingServiceHome({
  showCharacterAdminLink = false,
}: TypingServiceHomeProps) {
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const t = createTranslator(settings.locale);
  const text = getTypingUiText(settings.locale);
  const handleCtaClick = (target: string) => {
    trackEvent(analyticsEvents.typingHomeCtaClick, {
      target,
      locale: settings.locale,
      has_profile: loaded,
      character_id: profile.characterId,
    });
  };

  return (
    <YeonView className={TYPING_SERVICE_HOME_CLASS.root}>
      <TypingServiceHeader
        active="home"
        title={t("appName")}
        controls={
          showCharacterAdminLink ? (
            <YeonButton as="a" href="/admin/typing-characters" size="sm">
              {text.home.adminCharacters}
            </YeonButton>
          ) : null
        }
      />

      <YeonView as="main" className={TYPING_SERVICE_HOME_CLASS.main}>
        <YeonView
          as="section"
          className={TYPING_SERVICE_HOME_CLASS.introSection}
        >
          <YeonView className={TYPING_SERVICE_HOME_CLASS.introCopy}>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_HOME_CLASS.introTitle}
            >
              {text.home.heroTitle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_HOME_CLASS.introDescription}
            >
              {text.home.heroDescription}
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonSurface
          as="section"
          className={TYPING_SERVICE_HOME_CLASS.boardSection}
        >
          <YeonView className={TYPING_SERVICE_HOME_CLASS.profilePanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_HOME_CLASS.sectionTitle}
            >
              {text.home.profileTitle}
            </YeonText>
            <YeonView className={TYPING_SERVICE_HOME_CLASS.sectionBody}>
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
                <TypingProfileCardSkeleton locale={settings.locale} />
              )}
            </YeonView>
          </YeonView>

          <YeonView className={TYPING_SERVICE_HOME_CLASS.actionPanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_HOME_CLASS.sectionTitle}
            >
              {text.home.startTitle}
            </YeonText>

            <YeonView className={TYPING_SERVICE_HOME_CLASS.ctaWrap}>
              <StartCard
                href="/typing-service/rooms"
                label={text.home.cards.rooms.label}
                description={text.home.cards.rooms.description}
                tone="primary"
                onClick={() => handleCtaClick("rooms")}
              />
              <StartCard
                href="/typing-service/decks"
                label={text.home.cards.decks.label}
                description={text.home.cards.decks.description}
                tone="secondary"
                onClick={() => handleCtaClick("decks")}
              />
              <StartCard
                href="/typing-service/rooms"
                label={text.home.cards.territory.label}
                description={text.home.cards.territory.description}
                tone="secondary"
                onClick={() => handleCtaClick("territory")}
              />
              <StartCard
                href="/typing-service/play"
                label={text.home.cards.race.label}
                description={text.home.cards.race.description}
                tone="secondary"
                onClick={() => handleCtaClick("play")}
              />
            </YeonView>
          </YeonView>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}
