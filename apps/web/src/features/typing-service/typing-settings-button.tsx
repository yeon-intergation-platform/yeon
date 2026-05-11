"use client";

import { useEffect, useRef, useState } from "react";
import { ProductHeaderSettingsButton } from "@/components/product-shell/product-header";
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
  const ref = useRef<HTMLDivElement>(null);
  const t = createTranslator(settings.locale);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!loaded) return null;

  return (
    <div ref={ref} className="relative">
      <ProductHeaderSettingsButton
        onClick={() => setOpen((v) => !v)}
        aria-label={t("settings")}
      />

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-lg">
          <p className="px-3 py-1.5 text-[11px] font-medium text-[#aaa]">
            {t("speedUnit")}
          </p>
          {LOCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateSettings({ locale: opt.value })}
              className={`flex w-full items-center justify-between px-3 py-2 text-[13px] transition-colors hover:bg-[#f5f5f5] ${
                settings.locale === opt.value
                  ? "font-semibold text-[#111]"
                  : "text-[#555]"
              }`}
            >
              <span>{opt.label}</span>
              <span className="font-mono text-[11px] text-[#aaa]">
                {opt.unit}
              </span>
            </button>
          ))}

          <div className="my-1 border-t border-[#eee]" />
          <label className="grid gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#555]">
            기본 연습 덱
            <select
              value={selectedDeckId}
              onChange={(event) =>
                setDefaultDeckForLanguage(settings.locale, event.target.value)
              }
              className="rounded-lg border border-[#e5e5e5] bg-white px-2 py-2 text-[13px] font-medium text-[#111] outline-none transition-colors focus:border-[#111]"
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title}
                  {deck.visibility === "private"
                    ? " · 비공개"
                    : deck.visibility === "public"
                      ? " · 공개"
                      : " · 기본"}
                </option>
              ))}
            </select>
          </label>
          <p className="px-3 pb-2 text-[11px] leading-4 text-[#999]">
            {decksLoading
              ? "덱을 불러오는 중..."
              : (decksError ?? "언어별로 솔로/방 생성 기본 덱을 저장합니다.")}
          </p>
        </div>
      )}
    </div>
  );
}
