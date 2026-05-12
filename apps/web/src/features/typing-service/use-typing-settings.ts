"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import type {
  TypingDeckLanguageTag as SharedTypingDeckLanguageTag,
  TypingDeckVisibility as SharedTypingDeckVisibility,
  TypingRaceSeed as SharedTypingRaceSeed,
} from "@yeon/race-shared";
import { persist, createJSONStorage } from "zustand/middleware";
import { TYPING_PASSAGES, type TypingPassage } from "./typing-content";
import { requestTypingRaceSeed } from "./typing-service-fetch";
import { useTypingDeckDetail, useTypingDecks } from "./use-typing-decks";

export type TypingLocale = "ko" | "en";
export type TypingDeckLanguageTag = SharedTypingDeckLanguageTag;
export type SelectedDeckVisibility = SharedTypingDeckVisibility;

export type TypingSettings = {
  locale: TypingLocale;
  selectedDeckIdsByLanguage: Partial<Record<TypingDeckLanguageTag, string>>;
};

export type TypingDeckOption = {
  id: string;
  title: string;
  description?: string | null;
  languageTag: TypingDeckLanguageTag;
  visibility: SelectedDeckVisibility;
  source?: "default" | "user" | string;
  passageCount?: number;
};

export type TypingDeckPassageOption = {
  id: string;
  title: string;
  prompt: string;
  difficulty?: string;
};

export type TypingRaceSeed = SharedTypingRaceSeed;

export type ResolveTypingRaceSeedResult =
  | { ok: true; seed: TypingRaceSeed | null; deck: TypingDeckOption | null }
  | { ok: false; message: string; deck: TypingDeckOption | null };

const STORAGE_KEY = "yeon:typing-settings";
const LOCAL_DEFAULT_DECK_ID_PREFIX = "local-default";

const DEFAULT_SETTINGS: TypingSettings = {
  locale: "ko",
  selectedDeckIdsByLanguage: {},
};

const LOCAL_DEFAULT_DECKS: Record<TypingLocale, TypingDeckOption> = {
  ko: {
    id: `${LOCAL_DEFAULT_DECK_ID_PREFIX}-ko`,
    title: "기본 타자 문장",
    description: "네트워크 없이 사용할 수 있는 기본 문장",
    languageTag: "ko",
    visibility: "default",
    source: "default",
    passageCount: TYPING_PASSAGES.length,
  },
  en: {
    id: `${LOCAL_DEFAULT_DECK_ID_PREFIX}-en`,
    title: "Default local passages",
    description: "Fallback passages available without deck API",
    languageTag: "en",
    visibility: "default",
    source: "default",
    passageCount: TYPING_PASSAGES.length,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickArray(
  payload: unknown,
  paths: readonly (string | readonly string[])[]
): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  for (const path of paths) {
    const keys = typeof path === "string" ? [path] : path;
    let current: unknown = payload;
    for (const key of keys) {
      if (!isRecord(current)) {
        current = undefined;
        break;
      }
      current = current[key];
    }
    if (Array.isArray(current)) return current;
  }
  return [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asLanguageTag(
  value: unknown,
  fallback: TypingDeckLanguageTag
): TypingDeckLanguageTag {
  return value === "ko" ||
    value === "en" ||
    value === "mixed" ||
    value === "code"
    ? value
    : fallback;
}

function toLocale(
  languageTag: TypingDeckLanguageTag | TypingLocale
): TypingLocale {
  return languageTag === "en" ? "en" : "ko";
}

function getLocalDefaultDeck(
  languageTag: TypingDeckLanguageTag | TypingLocale
) {
  return LOCAL_DEFAULT_DECKS[toLocale(languageTag)];
}

function isLocalDefaultDeckId(deckId: string | null | undefined) {
  return Boolean(deckId?.startsWith(`${LOCAL_DEFAULT_DECK_ID_PREFIX}-`));
}

function normalizeVisibility(
  deck: Record<string, unknown>
): SelectedDeckVisibility {
  const explicit = deck.selectedDeckVisibility ?? deck.deckVisibility;
  if (explicit === "default" || explicit === "public" || explicit === "private")
    return explicit;
  if (deck.source === "default") return "default";
  if (deck.visibility === "private") return "private";
  return "public";
}

function normalizeDeck(
  value: unknown,
  fallbackLanguage: TypingDeckLanguageTag
): TypingDeckOption | null {
  if (!isRecord(value)) return null;
  const id =
    asString(value.publicId) ?? asString(value.deckId) ?? asString(value.id);
  const title = asString(value.title) ?? asString(value.name);
  if (!id || !title) return null;
  const passageCount =
    typeof value.passageCount === "number"
      ? value.passageCount
      : Array.isArray(value.passages)
        ? value.passages.length
        : undefined;
  return {
    id,
    title,
    description: asString(value.description),
    languageTag: asLanguageTag(value.languageTag, fallbackLanguage),
    visibility: normalizeVisibility(value),
    source: asString(value.source) ?? undefined,
    passageCount,
  };
}

function normalizeDeckList(
  payload: unknown,
  fallbackLanguage: TypingDeckLanguageTag
) {
  return pickArray(payload, ["decks", "items", "data"])
    .map((item) => normalizeDeck(item, fallbackLanguage))
    .filter((item): item is TypingDeckOption => item !== null);
}

function normalizePassage(value: unknown): TypingDeckPassageOption | null {
  if (!isRecord(value)) return null;
  const id =
    asString(value.publicId) ?? asString(value.passageId) ?? asString(value.id);
  const prompt = asString(value.prompt) ?? asString(value.text);
  if (!id || !prompt) return null;
  return {
    id,
    prompt,
    title: asString(value.title) ?? "Typing passage",
    difficulty: asString(value.difficulty) ?? undefined,
  };
}

function normalizePassages(payload: unknown) {
  return pickArray(payload, ["passages", ["deck", "passages"], "items"])
    .map(normalizePassage)
    .filter((item): item is TypingDeckPassageOption => item !== null);
}

function localPassagesFor(
  languageTag: TypingDeckLanguageTag | TypingLocale
): TypingDeckPassageOption[] {
  const locale = toLocale(languageTag);
  return TYPING_PASSAGES.map((passage: TypingPassage) => ({
    id: `${LOCAL_DEFAULT_DECK_ID_PREFIX}-${locale}-${passage.id}`,
    title: passage.title,
    prompt: passage.prompt,
    difficulty: passage.difficulty,
  }));
}

function normalizeRaceSeed(
  payload: unknown,
  deck: TypingDeckOption,
  fallbackLanguage: TypingDeckLanguageTag
): TypingRaceSeed | null {
  const source =
    isRecord(payload) && isRecord(payload.raceSeed)
      ? payload.raceSeed
      : isRecord(payload) && isRecord(payload.seed)
        ? payload.seed
        : payload;
  if (!isRecord(source)) return null;
  const prompt = asString(source.prompt) ?? asString(source.text);
  if (!prompt) return null;
  return {
    passageId:
      asString(source.passageId) ?? asString(source.id) ?? `${deck.id}:seed`,
    prompt,
    roundLabel:
      asString(source.roundLabel) ?? asString(source.title) ?? deck.title,
    seedToken: asString(source.seedToken) ?? undefined,
    deckId: asString(source.deckId) ?? deck.id,
    deckVisibility: normalizeVisibility({ ...deck, ...source }),
    lobbyDeckTitle:
      asString(source.lobbyDeckTitle) ??
      (deck.visibility === "private" ? "비공개 덱" : deck.title),
    participantDeckTitle: asString(source.participantDeckTitle) ?? deck.title,
    languageTag: asLanguageTag(source.languageTag, fallbackLanguage),
  };
}

function localRaceSeed(
  deck: TypingDeckOption,
  languageTag: TypingDeckLanguageTag,
  excludedPassageId?: string | null
): TypingRaceSeed {
  const passages = localPassagesFor(languageTag);
  const candidates =
    passages.length > 1 && excludedPassageId
      ? passages.filter((passage) => passage.id !== excludedPassageId)
      : passages;
  const passage =
    candidates[Math.floor(Math.random() * candidates.length)] ?? passages[0]!;
  return {
    passageId: passage.id,
    prompt: passage.prompt,
    roundLabel: passage.title,
    deckId: deck.id,
    deckVisibility: "default",
    lobbyDeckTitle: deck.title,
    participantDeckTitle: deck.title,
    languageTag,
  };
}

export function getSpeedUnit(locale: TypingLocale) {
  return locale === "ko" ? "타" : "wpm";
}

type TranslationKey =
  | "appName"
  | "joinRace"
  | "restart"
  | "result"
  | "accuracy"
  | "seconds"
  | "typeHere"
  | "startingIn"
  | "settings"
  | "speedUnit"
  | "nicknamePlaceholder"
  | "characterCamel"
  | "typingInputLabel"
  | "connectingToServer"
  | "offlineFallback"
  | "reconnect"
  | "roundFlowFocus";

const TRANSLATIONS: Record<TypingLocale, Record<TranslationKey, string>> = {
  ko: {
    appName: "타자연습",
    joinRace: "레이스 입장",
    restart: "다시 레이스",
    result: "결과",
    accuracy: "정확도",
    seconds: "s",
    typeHere: "여기에 입력하세요",
    startingIn: "초 후 시작...",
    settings: "설정",
    speedUnit: "속도 단위",
    nicknamePlaceholder: "Guest",
    characterCamel: "낙타",
    typingInputLabel: "타자 입력 영역",
    connectingToServer: "레이스 서버에 연결 중...",
    offlineFallback: "멀티플레이 서버에 연결할 수 없어 솔로 모드로 진행합니다.",
    reconnect: "재연결",
    roundFlowFocus: "몰입 플로우",
  },
  en: {
    appName: "Typing Race",
    joinRace: "Join Race",
    restart: "Restart",
    result: "Result",
    accuracy: "accuracy",
    seconds: "s",
    typeHere: "Type here",
    startingIn: "s to start...",
    settings: "Settings",
    speedUnit: "Speed unit",
    nicknamePlaceholder: "Guest",
    characterCamel: "Camel",
    typingInputLabel: "Typing input",
    connectingToServer: "Connecting to race server...",
    offlineFallback: "Cannot reach multiplayer server. Playing in solo mode.",
    reconnect: "Reconnect",
    roundFlowFocus: "Flow Focus",
  },
};

export function createTranslator(locale: TypingLocale) {
  return (key: TranslationKey) => TRANSLATIONS[locale][key];
}

type TypingSettingsStore = {
  settings: TypingSettings;
  updateSettings: (updates: Partial<TypingSettings>) => void;
  setDefaultDeckForLanguage: (
    languageTag: TypingDeckLanguageTag,
    deckId: string | null
  ) => void;
};

const useTypingSettingsStore = create<TypingSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      setDefaultDeckForLanguage: (languageTag, deckId) =>
        set((state) => {
          const selectedDeckIdsByLanguage = {
            ...state.settings.selectedDeckIdsByLanguage,
          };
          if (deckId) selectedDeckIdsByLanguage[languageTag] = deckId;
          else delete selectedDeckIdsByLanguage[languageTag];
          return { settings: { ...state.settings, selectedDeckIdsByLanguage } };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
          : window.localStorage
      ),
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => {
        if (!isRecord(persisted) || !isRecord(persisted.settings))
          return current;
        const persistedSettings = persisted.settings;
        return {
          ...current,
          settings: {
            ...current.settings,
            locale: persistedSettings.locale === "en" ? "en" : "ko",
            selectedDeckIdsByLanguage: isRecord(
              persistedSettings.selectedDeckIdsByLanguage
            )
              ? (persistedSettings.selectedDeckIdsByLanguage as Partial<
                  Record<TypingDeckLanguageTag, string>
                >)
              : {},
          },
        };
      },
    }
  )
);

export function useTypingSettings() {
  const settings = useTypingSettingsStore((s) => s.settings);
  const updateSettings = useTypingSettingsStore((s) => s.updateSettings);
  const setDefaultDeckForLanguage = useTypingSettingsStore(
    (s) => s.setDefaultDeckForLanguage
  );

  // SSR/CSR hydration mismatch 방지: persist rehydrate 완료 시점을 노출.
  // 서버/빌드 타임에는 persist API에 접근하지 않고 false로 시작.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) return;
    const persist = useTypingSettingsStore.persist;
    if (persist.hasHydrated()) {
      setLoaded(true);
      return;
    }
    return persist.onFinishHydration(() => setLoaded(true));
  }, [loaded]);

  return { settings, updateSettings, setDefaultDeckForLanguage, loaded };
}

export function useTypingDeckOptions(
  languageTag: TypingDeckLanguageTag | TypingLocale
) {
  const normalizedLanguage = languageTag === "en" ? "en" : "ko";
  const fallbackDeck = getLocalDefaultDeck(normalizedLanguage);
  const deckQuery = useTypingDecks("all");

  const decks = useMemo(() => {
    const remoteDecks = normalizeDeckList(deckQuery.data, normalizedLanguage)
      .filter(
        (deck) =>
          deck.languageTag === normalizedLanguage ||
          deck.languageTag === "mixed"
      )
      .filter((deck) => deck.id !== fallbackDeck.id);
    return [fallbackDeck, ...remoteDecks];
  }, [deckQuery.data, fallbackDeck, normalizedLanguage]);

  return {
    decks,
    loading: deckQuery.isLoading,
    error: deckQuery.isError
      ? "덱 API를 사용할 수 없어 기본 문장으로 대체합니다."
      : null,
    reload: deckQuery.refetch,
  };
}

export function getSelectedTypingDeckForLanguage(
  settings: TypingSettings,
  decks: TypingDeckOption[],
  languageTag: TypingDeckLanguageTag | TypingLocale
) {
  const normalizedLanguage = languageTag === "en" ? "en" : "ko";
  const selectedDeckId =
    settings.selectedDeckIdsByLanguage[normalizedLanguage] ??
    getLocalDefaultDeck(normalizedLanguage).id;
  const selectedDeck =
    decks.find((deck) => deck.id === selectedDeckId) ??
    getLocalDefaultDeck(normalizedLanguage);

  return { selectedDeckId, selectedDeck };
}

export function useSelectedTypingDeck(
  languageTag: TypingDeckLanguageTag | TypingLocale
) {
  const normalizedLanguage = languageTag === "en" ? "en" : "ko";
  const { settings, loaded } = useTypingSettings();
  const deckState = useTypingDeckOptions(normalizedLanguage);
  const { selectedDeckId, selectedDeck } = useMemo(
    () =>
      getSelectedTypingDeckForLanguage(
        settings,
        deckState.decks,
        normalizedLanguage
      ),
    [deckState.decks, normalizedLanguage, settings]
  );

  return { ...deckState, selectedDeckId, selectedDeck, loaded };
}

export function useTypingDeckPassages(
  deckId: string | null | undefined,
  languageTag: TypingDeckLanguageTag | TypingLocale
) {
  const normalizedLanguage = languageTag === "en" ? "en" : "ko";
  const fallback = useMemo(
    () => localPassagesFor(normalizedLanguage),
    [normalizedLanguage]
  );
  const shouldFetchDeck = Boolean(deckId && !isLocalDefaultDeckId(deckId));
  const detailQuery = useTypingDeckDetail(
    shouldFetchDeck ? (deckId ?? null) : null
  );

  const passages = useMemo(() => {
    if (!shouldFetchDeck) return fallback;
    const remotePassages = normalizePassages(detailQuery.data);
    return remotePassages.length > 0 ? remotePassages : fallback;
  }, [detailQuery.data, fallback, shouldFetchDeck]);

  return {
    passages,
    loading: shouldFetchDeck && detailQuery.isLoading,
    error:
      shouldFetchDeck && detailQuery.isError
        ? "선택한 덱을 불러오지 못해 기본 문장으로 대체합니다."
        : null,
  };
}

export async function resolveTypingRaceSeed(
  deck: TypingDeckOption | null,
  languageTag: TypingDeckLanguageTag,
  options?: { excludedPassageId?: string | null }
): Promise<ResolveTypingRaceSeedResult> {
  if (!deck) return { ok: true, seed: null, deck: null };
  if (isLocalDefaultDeckId(deck.id))
    return {
      ok: true,
      seed: localRaceSeed(deck, languageTag, options?.excludedPassageId),
      deck,
    };

  try {
    const payload = await requestTypingRaceSeed(
      `/api/v1/typing-decks/${encodeURIComponent(deck.id)}/race-seed`,
      languageTag
    );
    const seed = normalizeRaceSeed(payload, deck, languageTag);
    if (!seed) throw new Error("Invalid race seed response");
    return { ok: true, seed, deck };
  } catch {
    return {
      ok: false,
      deck,
      message: "선택한 덱의 레이스 문장을 준비하지 못했어요.",
    };
  }
}
