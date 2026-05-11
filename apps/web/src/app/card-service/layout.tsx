import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CardServiceAuthProvider } from "@/features/card-service/auth-context";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";
import { QueryProvider } from "@/lib/query-provider";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CardServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentAuthUser();
  return (
    <QueryProvider>
      <CardServiceAuthProvider isAuthenticated={Boolean(user)}>
        {children}
        <div className="fixed inset-x-4 bottom-3 z-40 sm:inset-auto sm:right-6 sm:bottom-6">
          <CommunityChatWidget
            variant="compact"
            className="w-[calc(100%-0.75rem)] max-w-[328px]"
          />
        </div>
      </CardServiceAuthProvider>
    </QueryProvider>
  );
}
