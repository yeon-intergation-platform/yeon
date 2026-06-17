import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { AdminMemberList } from "@/features/admin/admin-member-list";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getCurrentAdminUser, getAdminSeedEmails } from "@/server/auth/admin";
import {
  fetchUsersFromSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";

export const metadata: YeonPageMetadata = {
  title: "회원 관리 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

function AdminDenied() {
  const seedEmails = Array.from(getAdminSeedEmails());
  const hasSeedEmail = seedEmails.some(Boolean);

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
          회원관리 페이지는 DB role이{" "}
          <YeonText as="strong" variant="unstyled" tone="inherit">
            admin
          </YeonText>
          인 계정만 접근할 수 있습니다. 최초 관리자는 운영 환경변수{" "}
          <YeonText as="code" variant="unstyled" tone="inherit">
            YEON_ADMIN_EMAILS
          </YeonText>{" "}
          또는{" "}
          <YeonText as="code" variant="unstyled" tone="inherit">
            ADMIN_EMAILS
          </YeonText>
          에 이메일을 넣고 로그인하면 자동으로 admin role로 승격됩니다.
        </YeonText>
        <YeonView className="mt-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="font-bold text-[#111]"
          >
            현재 시드 설정
          </YeonText>
          <YeonText variant="unstyled" tone="inherit" className="mt-1">
            {hasSeedEmail
              ? `${seedEmails.length}개 이메일이 설정되어 있습니다.`
              : "아직 시드 이메일이 설정되어 있지 않습니다."}
          </YeonText>
        </YeonView>
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

function AdminMemberListError({ message }: { message: string }) {
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
          회원 목록 오류
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-black tracking-[-0.04em]"
        >
          회원 정보를 불러오지 못했습니다
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

export default async function AdminMembersPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminDenied />;
  }

  try {
    const result = await fetchUsersFromSpring(adminUser.id);

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
                {adminUser.email} · 회원 관리
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
                href="/admin/users"
                className={SHARED_FEATURE_CLASS.ghostButtonMd13}
              >
                사용자 · 경험치
              </YeonLink>
              <YeonLink
                href="/admin/typing-decks"
                className={SHARED_FEATURE_CLASS.ghostButtonMd13}
              >
                타자 덱 관리자
              </YeonLink>
            </YeonView>
          </YeonView>
        </YeonView>
        <AdminMemberList users={result.users} />
      </YeonView>
    );
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return <AdminMemberListError message={error.message} />;
    }

    console.error(error);
    return (
      <AdminMemberListError message="예상하지 못한 오류가 발생했습니다." />
    );
  }
}
