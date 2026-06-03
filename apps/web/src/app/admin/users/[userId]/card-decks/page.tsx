import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { AdminUserCardDecksList } from "@/features/admin/admin-user-card-decks-list";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getCurrentAdminUser } from "@/server/auth/admin";
import {
  adminListUserCardDecks,
  UserExperienceSpringBackendHttpError,
} from "@/server/user-experience-spring-client";

export const metadata: YeonPageMetadata = {
  title: "사용자 카드덱 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

function AdminGuardDenied() {
  return (
    <YeonView
      as="main"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]"
    >
      <YeonView
        as="section"
        className="max-w-xl rounded-2xl border border-[#e5e5e5] bg-white p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          관리자 전용
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#111]"
        >
          관리자 권한이 필요합니다
        </YeonText>
        <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
          <YeonLink
            href="/auth/login"
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            로그인하기
          </YeonLink>
          <YeonLink href="/" className={SHARED_FEATURE_CLASS.ghostButtonMd14}>
            홈으로
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

function AdminCardDecksError({ message }: { message: string }) {
  return (
    <YeonView
      as="main"
      className="min-h-screen bg-white px-6 py-12 text-[#111] md:px-12"
    >
      <YeonView
        as="section"
        className="mx-auto max-w-2xl rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          카드덱 오류
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-black tracking-[-0.04em]"
        >
          카드덱 정보를 불러오지 못했습니다
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-4 text-[14px] leading-6 text-[#666]"
        >
          {message}
        </YeonText>
      </YeonView>
    </YeonView>
  );
}

export default async function AdminUserCardDecksPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminGuardDenied />;
  }

  const { userId } = await params;

  try {
    const result = await adminListUserCardDecks(adminUser.id, userId);

    return (
      <YeonView className="min-h-screen bg-white">
        <YeonView className="border-b border-[#e5e5e5] bg-white px-6 py-3 text-[#111] md:px-12">
          <YeonView className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <YeonView>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
              >
                관리자 · 사용자 카드덱
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="text-[14px] font-semibold"
              >
                {`사용자 ${userId}`}
              </YeonText>
            </YeonView>
            <YeonLink
              href="/admin/users"
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              사용자 목록으로
            </YeonLink>
          </YeonView>
        </YeonView>
        <AdminUserCardDecksList cardDecks={result.cardDecks} />
      </YeonView>
    );
  } catch (error) {
    if (error instanceof UserExperienceSpringBackendHttpError) {
      return <AdminCardDecksError message={error.message} />;
    }
    console.error(error);
    return <AdminCardDecksError message="예상하지 못한 오류가 발생했습니다." />;
  }
}
