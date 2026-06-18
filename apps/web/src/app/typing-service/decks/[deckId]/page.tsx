import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { TypingDeckDetailPageClient } from "@/features/typing-service/typing-deck-detail-page-client";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "YEON 타자 덱 상세 관리",
  description: "선택한 타자 덱의 정보와 연습 문단을 관리합니다.",
  robots: {
    index: false,
    follow: true,
  },
};

type TypingDeckDetailPageProps = {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{
    admin?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TypingDeckDetailPage({
  params,
  searchParams,
}: TypingDeckDetailPageProps) {
  const [{ deckId }, resolvedSearchParams, currentUser] = await Promise.all([
    params,
    searchParams,
    getCurrentAuthUser(),
  ]);
  const showAdminEntry = currentUser ? await isAdminUser(currentUser) : false;
  const adminMode =
    showAdminEntry && pickFirstValue(resolvedSearchParams.admin) === "1";

  return (
    <TypingDeckDetailPageClient
      adminMode={adminMode}
      deckId={deckId}
      showAdminEntry={showAdminEntry}
    />
  );
}
