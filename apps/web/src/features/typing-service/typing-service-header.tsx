"use client";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonServiceHelpDialog } from "@yeon/ui";
import { TypingSettingsButton } from "./typing-settings-button";
import { getTypingServiceHelpContent } from "./typing-content";
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

export type TypingServiceNavKey = "home" | "rooms" | "decks" | "race";

type TypingServiceHeaderProps = {
  active: TypingServiceNavKey;
  title?: string;
  controls?: ReactNode;
};

export function TypingServiceHeader({
  active,
  controls,
  title,
}: TypingServiceHeaderProps) {
  const { settings } = useTypingSettings();
  const text = getTypingUiText(settings.locale);
  const resolvedTitle =
    title ??
    (active === "rooms"
      ? text.header.roomsTitle
      : active === "decks"
        ? text.deck.title
        : active === "race"
          ? text.header.raceTitle
          : text.home.heroTitle);

  useEffect(() => {
    document.title = `${resolvedTitle} | YEON`;
  }, [resolvedTitle]);

  return (
    <CommonProductHeader
      activeService="typing"
      ariaLabel={text.header.navAriaLabel}
      initialLanguage={settings.locale}
      profileLabels={text.header.profileMenu}
      levelAriaLabel={text.header.levelAriaLabel}
      settingsControl={
        <>
          <YeonServiceHelpDialog
            content={getTypingServiceHelpContent(settings.locale)}
            labels={text.header.helpDialog}
          />
          <TypingSettingsButton />
        </>
      }
      rightExtras={controls}
    />
  );
}
