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
import {
  createTranslator,
  type TypingLocale,
  useSelectedTypingDeck,
  useTypingSettings,
} from "./use-typing-settings";

const LOCALE_OPTIONS: { value: TypingLocale; label: string; unit: string }[] = [
  { value: "ko", label: "한국어", unit: "타/분" },
  { value: "en", label: "English", unit: "wpm" },
];

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
            {t("speedUnit")}
          </YeonText>
          {LOCALE_OPTIONS.map((opt) => (
            <YeonButton
              key={opt.value}
              type="button"
              onClick={() => updateSettings({ locale: opt.value })}
              variant="ghost"
              size="sm"
              className={`w-full justify-between rounded-none px-3 py-2 text-[13px] ${
                settings.locale === opt.value
                  ? "font-semibold text-[#111]"
                  : "text-[#666]"
              }`}
            >
              <YeonText as="span" variant="unstyled" tone="inherit">
                {opt.label}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="font-mono text-[11px] text-[#aaa]"
              >
                {opt.unit}
              </YeonText>
            </YeonButton>
          ))}

          <YeonView className="my-1 border-t border-[#e5e5e5]" />
          <YeonLabel
            className={`grid gap-1.5 px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
          >
            기본 연습 덱
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
                  {deck.visibility === "private"
                    ? " · 비공개"
                    : deck.visibility === "public"
                      ? " · 공개"
                      : " · 기본"}
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
              ? "덱을 불러오는 중..."
              : (decksError ?? "언어별로 솔로/방 생성 기본 덱을 저장합니다.")}
          </YeonText>
        </YeonView>
      )}
    </YeonView>
  );
}
