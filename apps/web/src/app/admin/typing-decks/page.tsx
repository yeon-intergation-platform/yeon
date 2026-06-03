import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { TypingDecksScreen } from "@/features/typing-service/typing-decks-screen";
import { getCurrentAdminUser, getAdminSeedEmails } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "타자 덱 관리자 | YEON",
  robots: {
    index: false,
    follow: false,
  },
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
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-[#111]"
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
          as="p"
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          타자 덱 관리자 페이지는 DB role이{" "}
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
            as="p"
            variant="unstyled"
            tone="inherit"
            className="font-bold text-[#111]"
          >
            현재 시드 설정
          </YeonText>
          <YeonText as="p" variant="unstyled" tone="inherit" className="mt-1">
            {hasSeedEmail
              ? `${seedEmails.length}개 이메일이 설정되어 있습니다.`
              : "아직 시드 이메일이 설정되어 있지 않습니다."}
          </YeonText>
        </YeonView>
        <YeonView className="mt-6 flex flex-wrap gap-2">
          <YeonLink
            href="/auth/login"
            className="rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#111]"
          >
            로그인하기
          </YeonLink>
          <YeonLink
            href="/typing-service/decks"
            className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#666] no-underline transition-colors hover:border-[#e5e5e5] hover:text-[#111]"
          >
            일반 덱 화면으로
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

export default async function AdminTypingDecksPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminDenied />;
  }

  return (
    <YeonView>
      <YeonView className="border-b border-[#e5e5e5] bg-white px-6 py-3 text-[#111] md:px-12">
        <YeonView className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#aaa]"
            >
              관리자
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-semibold"
            >
              {adminUser.email} · 타자 덱 관리자
            </YeonText>
          </YeonView>
          <YeonView className="flex flex-wrap gap-2">
            <YeonLink
              href="/admin/members"
              className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
            >
              회원관리
            </YeonLink>
            <YeonLink
              href="/typing-service/rooms"
              className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
            >
              타자방 로비 확인
            </YeonLink>
          </YeonView>
        </YeonView>
      </YeonView>
      <TypingDecksScreen adminMode />
    </YeonView>
  );
}
