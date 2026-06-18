"use client";
import type { ReactNode } from "react";
import { useYeonPathname } from "@yeon/ui/runtime/YeonNavigation";
import { YeonView } from "@yeon/ui";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";

const CHAT_WIDGET_HIDDEN_PATHS = new Set([
  "/typing-service/rooms",
  "/typing-service/territory",
  "/territory",
]);

const CHAT_WIDGET_HIDDEN_PREFIXES = ["/typing-service/rooms/"];

export function TypingServiceLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = useYeonPathname();
  const shouldHideChatWidget =
    CHAT_WIDGET_HIDDEN_PATHS.has(pathname) ||
    CHAT_WIDGET_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
