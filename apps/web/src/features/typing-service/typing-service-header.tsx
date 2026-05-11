"use client";

import type { ReactNode } from "react";

import { CommonProductHeader } from "@/components/product-shell/product-header";

import { TypingSettingsButton } from "./typing-settings-button";

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
      settingsControl={<TypingSettingsButton />}
      rightExtras={controls}
    />
  );
}
