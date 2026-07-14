"use client";
import {
  YeonButton,
  YeonIcon,
  YeonImage,
  YeonLink,
  YeonSurface,
  YeonView,
  YeonText,
} from "@yeon/ui";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { ProductPageHeader } from "@/components/product-shell/product-page-header";
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

type FeatureRowProps = {
  href: string;
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
};

function FeatureRow({
  href,
  icon,
  label,
  description,
  onClick,
}: FeatureRowProps) {
  return (
    <YeonLink
      href={href}
      aria-label={`${label} — ${description}`}
      className={TYPING_SERVICE_HOME_CLASS.featureRow}
      onClick={onClick}
    >
      <YeonView
        as="span"
        aria-hidden="true"
        className={TYPING_SERVICE_HOME_CLASS.featureIconWrap}
      >
        <YeonImage
          src={icon}
          alt=""
          aria-hidden="true"
          className={TYPING_SERVICE_HOME_CLASS.featureIcon}
        />
      </YeonView>
      <YeonView as="span" className={TYPING_SERVICE_HOME_CLASS.featureBody}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_HOME_CLASS.featureTitle}
        >
          {label}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_HOME_CLASS.featureDescription}
        >
          {description}
        </YeonText>
      </YeonView>
      <YeonIcon
        name="chevron-right"
        size={18}
        aria-hidden="true"
        className={TYPING_SERVICE_HOME_CLASS.featureChevron}
      />
    </YeonLink>
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
        <YeonView className={TYPING_SERVICE_HOME_CLASS.introSection}>
          <ProductPageHeader
            title={text.home.heroTitle}
            description={text.home.heroDescription}
          />
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

            <YeonLink
              href="/typing-service/play"
              aria-label={`${text.home.cards.race.label} — ${text.home.cards.race.description}`}
              className={TYPING_SERVICE_HOME_CLASS.raceBanner}
              onClick={() => handleCtaClick("play")}
            >
              <YeonImage
                src="/typing/race-entry-card.png"
                srcSet="/typing/race-entry-card.png 1x, /typing/race-entry-card@2x.png 2x"
                alt={`${text.home.cards.race.label} — ${text.home.cards.race.description}`}
                className={TYPING_SERVICE_HOME_CLASS.raceBannerImage}
              />
            </YeonLink>

            <YeonView
              aria-hidden="true"
              className={TYPING_SERVICE_HOME_CLASS.featureDivider}
            />

            <YeonText
              as="h3"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_HOME_CLASS.featureListTitle}
            >
              {text.home.otherFeaturesTitle}
            </YeonText>

            <YeonView className={TYPING_SERVICE_HOME_CLASS.featureList}>
              <FeatureRow
                href="/typing-service/rooms"
                icon="/typing/typing-room-icon.svg"
                label={text.home.cards.rooms.label}
                description={text.home.cards.rooms.description}
                onClick={() => handleCtaClick("rooms")}
              />
              <FeatureRow
                href="/typing-service/decks"
                icon="/typing/practice-deck-icon.svg"
                label={text.home.cards.decks.label}
                description={text.home.cards.decks.description}
                onClick={() => handleCtaClick("decks")}
              />
              <FeatureRow
                href="/typing-service/rooms"
                icon="/typing/conquest-room-icon.svg"
                label={text.home.cards.territory.label}
                description={text.home.cards.territory.description}
                onClick={() => handleCtaClick("territory")}
              />
            </YeonView>
          </YeonView>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}
