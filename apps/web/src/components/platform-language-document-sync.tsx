"use client";
import { useEffect } from "react";
import { usePlatformLanguage } from "@/lib/use-platform-language";

export function PlatformLanguageDocumentSync() {
  const { language } = usePlatformLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
