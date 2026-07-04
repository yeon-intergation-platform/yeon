"use client";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PLATFORM_LANGUAGE,
  PLATFORM_LANGUAGE_CHANGE_EVENT,
  PLATFORM_LANGUAGE_STORAGE_KEY,
  readPlatformLanguagePreference,
  writePlatformLanguagePreference,
  type PlatformLanguage,
} from "@/lib/platform-language";

export function usePlatformLanguage() {
  const [language, setLanguageState] = useState<PlatformLanguage>(
    DEFAULT_PLATFORM_LANGUAGE
  );

  useEffect(() => {
    setLanguageState(readPlatformLanguagePreference());

    const syncFromStorage = () => {
      setLanguageState(readPlatformLanguagePreference());
    };
    const syncFromLocalStorage = (event: StorageEvent) => {
      if (event.key === PLATFORM_LANGUAGE_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener(PLATFORM_LANGUAGE_CHANGE_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromLocalStorage);
    return () => {
      window.removeEventListener(
        PLATFORM_LANGUAGE_CHANGE_EVENT,
        syncFromStorage
      );
      window.removeEventListener("storage", syncFromLocalStorage);
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: PlatformLanguage) => {
    writePlatformLanguagePreference(nextLanguage);
    setLanguageState(nextLanguage);
    window.dispatchEvent(new Event(PLATFORM_LANGUAGE_CHANGE_EVENT));
  }, []);

  return { language, setLanguage };
}
