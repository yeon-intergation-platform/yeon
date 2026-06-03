import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import type { ReactNode } from "react";
import { YeonView } from "@yeon/ui";
import { CardServiceAuthProvider } from "@/features/card-service/auth-context";
import { WebCardDeckRepositoryProvider } from "@/features/card-service/runtime-adapters/card-deck-repository";
import { WebCardItemRepositoryProvider } from "@/features/card-service/runtime-adapters/card-item-repository";
import { CommunityChatWidget } from "@/features/community/components/community-chat-widget";
import { QueryProvider } from "@/lib/query-provider";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: YeonPageMetadata = {
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
        <WebCardDeckRepositoryProvider>
          <WebCardItemRepositoryProvider>
            {children}
            <YeonView className="fixed inset-x-4 bottom-3 z-40 sm:inset-auto sm:right-6 sm:bottom-6">
              <CommunityChatWidget variant="compact" />
            </YeonView>
          </WebCardItemRepositoryProvider>
        </WebCardDeckRepositoryProvider>
      </CardServiceAuthProvider>
    </QueryProvider>
  );
}
