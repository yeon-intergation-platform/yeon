import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";

export default function TypingServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      {children}
      <div className="fixed inset-x-4 bottom-3 z-40 sm:inset-auto sm:right-6 sm:bottom-6">
        <CommunityChatWidget variant="compact" />
      </div>
    </QueryProvider>
  );
}
