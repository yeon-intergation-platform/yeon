"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";

const FULLSCREEN_TYPING_PATHS = new Set(["/typing-service/territory"]);

export function TypingServiceLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideChatWidget = FULLSCREEN_TYPING_PATHS.has(pathname);

  return (
    <>
      {children}
      {shouldHideChatWidget ? null : (
        <div className="fixed inset-x-4 bottom-3 z-40 sm:inset-auto sm:right-6 sm:bottom-6">
          <CommunityChatWidget variant="compact" />
        </div>
      )}
    </>
  );
}
