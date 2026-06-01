"use client";

import type { ReactNode } from "react";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import { ServiceHelpDialog } from "@/components/product-shell/service-help-dialog";

import { TypingSettingsButton } from "./typing-settings-button";
import {
  TYPING_FAQS,
  TYPING_FEATURES,
  TYPING_SEO_HEADING,
  TYPING_SEO_INTRO,
} from "./typing-content";

export type TypingServiceNavKey = "home" | "rooms" | "decks" | "race";

type TypingServiceHeaderProps = {
  active: TypingServiceNavKey;
  title?: string;
  controls?: ReactNode;
};

export function TypingServiceHeader({ controls }: TypingServiceHeaderProps) {
  return (
    <CommonProductHeader
      activeService="typing"
      settingsControl={
        <>
          <ServiceHelpDialog
            content={{
              title: TYPING_SEO_HEADING,
              intro: TYPING_SEO_INTRO,
              features: TYPING_FEATURES,
              faqs: TYPING_FAQS,
            }}
          />
          <TypingSettingsButton />
        </>
      }
      rightExtras={controls}
    />
  );
}
