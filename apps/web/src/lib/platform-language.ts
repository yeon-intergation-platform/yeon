import type { YeonProductProfileMenuLabels } from "@yeon/ui";

export const PLATFORM_LANGUAGE_STORAGE_KEY = "yeon:platform-language";
export const PLATFORM_LANGUAGE_COOKIE_NAME = "yeon.platform.language";
export const PLATFORM_LANGUAGE_CHANGE_EVENT = "yeon:platform-language-change";

export const PLATFORM_LANGUAGES = {
  ko: "ko",
  en: "en",
} as const;

export type PlatformLanguage =
  (typeof PLATFORM_LANGUAGES)[keyof typeof PLATFORM_LANGUAGES];

export const DEFAULT_PLATFORM_LANGUAGE: PlatformLanguage =
  PLATFORM_LANGUAGES.ko;

export const PLATFORM_LANGUAGE_LABELS: Record<
  PlatformLanguage,
  Record<PlatformLanguage, string>
> = {
  ko: {
    ko: "한국어",
    en: "영어",
  },
  en: {
    ko: "Korean",
    en: "English",
  },
};

export const PLATFORM_PROFILE_MENU_LABELS: Record<
  PlatformLanguage,
  Partial<YeonProductProfileMenuLabels>
> = {
  ko: {
    button: "내정보 메뉴",
    profile: "내정보보기",
    loggingOut: "로그아웃 중...",
    logout: "로그아웃",
  },
  en: {
    button: "Profile menu",
    profile: "View profile",
    loggingOut: "Signing out...",
    logout: "Sign out",
  },
};

export function normalizePlatformLanguage(
  value: string | null | undefined
): PlatformLanguage {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return DEFAULT_PLATFORM_LANGUAGE;
  if (normalized === "en" || normalized.startsWith("en-")) {
    return PLATFORM_LANGUAGES.en;
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return PLATFORM_LANGUAGES.ko;
  }
  return DEFAULT_PLATFORM_LANGUAGE;
}

export function isPlatformLanguage(
  value: string | null | undefined
): value is PlatformLanguage {
  return value === PLATFORM_LANGUAGES.ko || value === PLATFORM_LANGUAGES.en;
}

function readCookieValue(cookieText: string, name: string): string | null {
  const prefix = `${name}=`;
  return (
    cookieText
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

export function readPlatformLanguagePreference(): PlatformLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_PLATFORM_LANGUAGE;
  }

  try {
    const urlLanguage = new URL(window.location.href).searchParams.get("lang");
    if (isPlatformLanguage(urlLanguage)) {
      return urlLanguage;
    }
  } catch {
    // URL 파싱 실패 시 저장된 선호도/기본값으로 이어간다.
  }

  try {
    const stored = window.localStorage.getItem(PLATFORM_LANGUAGE_STORAGE_KEY);
    if (isPlatformLanguage(stored)) {
      return stored;
    }
  } catch {
    // 브라우저 저장소 접근이 막혀도 쿠키/기본값으로 이어간다.
  }

  if (typeof document !== "undefined") {
    return normalizePlatformLanguage(
      readCookieValue(document.cookie, PLATFORM_LANGUAGE_COOKIE_NAME)
    );
  }

  return DEFAULT_PLATFORM_LANGUAGE;
}

export function writePlatformLanguagePreference(language: PlatformLanguage) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PLATFORM_LANGUAGE_STORAGE_KEY, language);
    } catch {
      // 저장소 접근 실패는 쿠키 저장으로 보완한다.
    }
  }

  if (typeof document !== "undefined") {
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${PLATFORM_LANGUAGE_COOKIE_NAME}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }
}
