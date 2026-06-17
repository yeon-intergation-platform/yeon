import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { AdminUserExperienceList } from "@/features/admin/admin-user-experience-list";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getCurrentAdminUser } from "@/server/auth/admin";
import {
  adminListUsers,
  UserExperienceSpringBackendHttpError,
} from "@/server/user-experience-spring-client";

export const metadata: YeonPageMetadata = {
  title: "사용자 · 경험치 | YEON Admin",
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
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          사용자·경험치 페이지는 admin role 계정만 접근할 수 있습니다.
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

function AdminUsersError({ message }: { message: string }) {
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
          사용자 목록 오류
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-black tracking-[-0.04em]"
        >
          사용자 정보를 불러오지 못했습니다
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

export default async function AdminUsersPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminGuardDenied />;
  }

  try {
    const result = await adminListUsers(adminUser.id);

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
                관리자
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="text-[14px] font-semibold"
              >
                {adminUser.email} · 사용자 · 경험치
              </YeonText>
            </YeonView>
            <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
              <YeonLink
                href="/admin/content"
                className={SHARED_FEATURE_CLASS.ghostButtonMd13}
              >
                공개 콘텐츠
              </YeonLink>
              <YeonLink
                href="/admin/members"
                className={SHARED_FEATURE_CLASS.ghostButtonMd13}
              >
                회원 관리
              </YeonLink>
            </YeonView>
          </YeonView>
        </YeonView>
        <AdminUserExperienceList users={result.users} />
      </YeonView>
    );
  } catch (error) {
    if (error instanceof UserExperienceSpringBackendHttpError) {
      return <AdminUsersError message={error.message} />;
    }
    console.error(error);
    return <AdminUsersError message="예상하지 못한 오류가 발생했습니다." />;
  }
}
