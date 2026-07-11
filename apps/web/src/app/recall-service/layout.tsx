import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";
import { CardServiceAuthProvider } from "@/features/card-service/auth-context";
import { WebCardDeckRepositoryProvider } from "@/features/card-service/runtime-adapters/card-deck-repository";
import { WebCardItemRepositoryProvider } from "@/features/card-service/runtime-adapters/card-item-repository";
import { WebCardRecallRepositoryProvider } from "@/features/card-service/runtime-adapters/card-recall-repository";
import { getCurrentAuthUser } from "@/server/auth/session";

// 백지 학습은 카드 서비스와 같은 인증·게스트 저장소·query cache를 사용한다.
export default async function RecallServiceLayout({
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
            <WebCardRecallRepositoryProvider>
              {children}
            </WebCardRecallRepositoryProvider>
          </WebCardItemRepositoryProvider>
        </WebCardDeckRepositoryProvider>
      </CardServiceAuthProvider>
    </QueryProvider>
  );
}
