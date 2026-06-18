"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useYeonPathname } from "@yeon/ui/runtime/YeonNavigation";
import { YeonView } from "@yeon/ui";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { getTypingUiText } from "@/features/typing-service/typing-service-i18n";
import type { TypingLocale } from "@/features/typing-service/use-typing-settings";

const CHAT_WIDGET_HIDDEN_PATHS = new Set([
  "/typing-service/rooms",
  "/typing-service/territory",
  "/territory",
]);

const CHAT_WIDGET_HIDDEN_PREFIXES = ["/typing-service/rooms/"];

function resolveTypingDocumentTitle(pathname: string, locale: TypingLocale) {
  const text = getTypingUiText(locale);

  if (pathname.startsWith("/typing-service/decks")) {
    return text.deck.title;
  }
  if (pathname.startsWith("/typing-service/rooms")) {
    return text.header.roomsTitle;
  }
  if (pathname.startsWith("/typing-service/practice")) {
    return locale === "en" ? "Solo Practice" : "타자 덱 연습";
  }
  if (pathname.startsWith("/typing-service/play")) {
    return text.header.raceTitle;
  }
  if (pathname.startsWith("/typing-service/territory")) {
    return locale === "en" ? "Territory Battle" : "점령전";
  }

  return locale === "en" ? "Typing Practice" : "타자연습";
}

export function TypingServiceLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = useYeonPathname();
  const { settings, loaded } = useTypingSettings();
  const shouldHideChatWidget =
    !loaded ||
    settings.locale === "en" ||
    CHAT_WIDGET_HIDDEN_PATHS.has(pathname) ||
    CHAT_WIDGET_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    const title = `${resolveTypingDocumentTitle(pathname, settings.locale)} | YEON`;
    document.title = title;

    const handle = window.setTimeout(() => {
      document.title = title;
    }, 100);

    return () => window.clearTimeout(handle);
  }, [pathname, settings.locale]);

  if (!loaded) {
    return <YeonView aria-busy="true" className="min-h-screen bg-white" />;
  }

  return (
    <>
      {children}
      {shouldHideChatWidget ? null : (
        <YeonView className="fixed inset-x-4 bottom-3 z-40 sm:inset-auto sm:right-6 sm:bottom-6">
          <CommunityChatWidget variant="compact" />
        </YeonView>
      )}
    </>
  );
}
