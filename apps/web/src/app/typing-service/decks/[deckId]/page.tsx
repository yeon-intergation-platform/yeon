import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonBadge, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TypingServiceHeader } from "@/features/typing-service";
import { TypingDeckDetailPanel } from "@/features/typing-service/typing-decks-screen";
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
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="decks"
        title="YEON 연습덱"
        controls={
          <>
            <YeonLink
              href="/typing-service/decks"
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              덱 목록
            </YeonLink>
            {showAdminEntry ? (
              <YeonLink
                href="/admin/typing-decks"
                className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#111]"
              >
                관리자
              </YeonLink>
            ) : null}
          </>
        }
      />

      <YeonView as="main" className="px-6 py-10 md:px-10">
        <YeonView className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#aaa]"
            >
              Typing deck detail
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              타자 덱 상세 관리
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]"
            >
              덱 정보, 문단 목록, 직접 추가, AI 붙여넣기 관리 기능을 한 화면에서
              이어서 사용할 수 있습니다.
            </YeonText>
          </YeonView>
          {adminMode ? (
            <YeonBadge variant="neutral" className="w-fit">
              관리자 모드
            </YeonBadge>
          ) : null}
        </YeonView>

        <TypingDeckDetailPanel deckId={deckId} adminMode={adminMode} />
      </YeonView>
    </YeonView>
  );
}
