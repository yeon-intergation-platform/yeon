"use client";
import { useRef, useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonLabel,
  YeonText,
  YeonView,
  YeonOption,
  YeonProductHeaderActionButton,
  type YeonElement,
  type YeonNode,
} from "@yeon/ui";
import { useYeonDocumentEvent } from "@yeon/ui/hooks/YeonBrowserHooks";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { writePlatformLanguagePreference } from "@/lib/platform-language";
import {
  createTranslator,
  type TypingLocale,
  useSelectedTypingDeck,
  useTypingSettings,
} from "./use-typing-settings";
import { getTypingUiText } from "./typing-service-i18n";

const LOCALE_OPTIONS: { value: TypingLocale; label: string; unit: string }[] = [
  { value: "ko", label: "한국어", unit: "타/분" },
  { value: "en", label: "English", unit: "wpm" },
];

const LOCALE_OPTION_LABELS_BY_ACTIVE_LOCALE: Record<
  TypingLocale,
  Record<TypingLocale, { label: string; unit: string }>
> = {
  ko: {
    ko: { label: "한국어", unit: "타/분" },
    en: { label: "English", unit: "WPM" },
  },
  en: {
    ko: { label: "Korean", unit: "CPM" },
    en: { label: "English", unit: "WPM" },
  },
};

export function TypingSettingsButton() {
  const { settings, updateSettings, setDefaultDeckForLanguage, loaded } =
    useTypingSettings();
  const {
    decks,
    selectedDeckId,
    loading: decksLoading,
    error: decksError,
  } = useSelectedTypingDeck(settings.locale);
  const [open, setOpen] = useState(false);
  const ref = useRef<YeonElement>(null);
  const t = createTranslator(settings.locale);
  const text = getTypingUiText(settings.locale);

  useYeonDocumentEvent(
    "mousedown",
    (event) => {
      if (ref.current && !ref.current.contains(event.target as YeonNode)) {
        setOpen(false);
      }
    },
    open
  );

  if (!loaded) return null;

  return (
    <YeonView ref={ref} className="relative">
      <YeonProductHeaderActionButton
        onClick={() => setOpen((v) => !v)}
        aria-label={t("settings")}
      />

      {open && (
        <YeonView className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-lg">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="px-3 py-1.5 text-[11px] font-medium text-[#aaa]"
          >
            {text.settings.localeLabel}
          </YeonText>
          {LOCALE_OPTIONS.map((opt) => {
            const optionText =
              LOCALE_OPTION_LABELS_BY_ACTIVE_LOCALE[settings.locale][opt.value];
            return (
              <YeonButton
                key={opt.value}
                type="button"
                onClick={() => {
                  updateSettings({ locale: opt.value });
                  writePlatformLanguagePreference(opt.value);
                }}
                variant="ghost"
                size="sm"
                className={`w-full justify-between rounded-none px-3 py-2 text-[13px] ${
                  settings.locale === opt.value
                    ? "font-semibold text-[#111]"
                    : "text-[#666]"
                }`}
              >
                <YeonText as="span" variant="unstyled" tone="inherit">
                  {optionText.label}
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="font-mono text-[11px] text-[#aaa]"
                >
                  {optionText.unit}
                </YeonText>
              </YeonButton>
            );
          })}

          <YeonView className="my-1 border-t border-[#e5e5e5]" />
          <YeonLabel
            className={`grid gap-1.5 px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
          >
            {text.settings.defaultDeck}
            <YeonField
              as="select"
              value={selectedDeckId}
              onChange={(event) =>
                setDefaultDeckForLanguage(settings.locale, event.target.value)
              }
              className="rounded-lg px-2 py-2 text-[13px] font-medium"
            >
              {decks.map((deck) => (
                <YeonOption key={deck.id} value={deck.id}>
                  {deck.title}
                  {` · ${text.settings.deckVisibility[deck.visibility]}`}
                </YeonOption>
              ))}
            </YeonField>
          </YeonLabel>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="px-3 pb-2 text-[11px] leading-4 text-[#aaa]"
          >
            {decksLoading
              ? text.settings.loadingDecks
              : (decksError ?? text.settings.deckHelp)}
          </YeonText>
        </YeonView>
      )}
    </YeonView>
  );
}
