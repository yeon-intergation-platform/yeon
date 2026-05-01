import type { Metadata } from "next";
import Link from "next/link";

import { TypingDecksScreen } from "@/features/typing-service/typing-decks-screen";
import { getCurrentAdminUser, getAdminSeedEmails } from "@/server/auth/admin";

export const metadata: Metadata = {
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
    <main className="app-theme flex min-h-screen items-center justify-center bg-bg px-6 text-text">
      <section className="max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-red">
          Admin only
        </p>
        <h1 className="mt-3 text-[28px] font-black tracking-[-0.04em]">
          관리자 권한이 필요합니다
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-text-secondary">
          타자 덱 관리자 페이지는 DB role이 <strong>admin</strong>인 계정만
          접근할 수 있습니다. 최초 관리자는 운영 환경변수{" "}
          <code>YEON_ADMIN_EMAILS</code> 또는 <code>ADMIN_EMAILS</code>에
          이메일을 넣고 로그인하면 자동으로 admin role로 승격됩니다.
        </p>
        <div className="mt-5 rounded-2xl border border-border bg-surface-2 p-4 text-[13px] leading-6 text-text-secondary">
          <p className="font-bold text-text">현재 시드 설정</p>
          <p className="mt-1">
            {hasSeedEmail
              ? `${seedEmails.length}개 이메일이 설정되어 있습니다.`
              : "아직 시드 이메일이 설정되어 있지 않습니다."}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/auth/login"
            className="rounded-2xl bg-accent px-5 py-3 text-[14px] font-bold text-text no-underline transition-colors hover:bg-[var(--accent-hover)]"
          >
            로그인하기
          </Link>
          <Link
            href="/typing-service/decks"
            className="rounded-2xl border border-border bg-surface-2 px-5 py-3 text-[14px] font-bold text-text-secondary no-underline transition-colors hover:border-border-light hover:text-text"
          >
            일반 덱 화면으로
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function AdminTypingDecksPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminDenied />;
  }

  return (
    <div>
      <div className="app-theme border-b border-border bg-surface px-6 py-3 text-text md:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">
              Admin
            </p>
            <p className="text-[14px] font-semibold">
              {adminUser.email} · 타자 덱 관리자
            </p>
          </div>
          <Link
            href="/typing-service/rooms"
            className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-[13px] font-bold text-text no-underline transition-colors hover:border-accent-border"
          >
            타자방 로비 확인
          </Link>
        </div>
      </div>
      <TypingDecksScreen adminMode />
    </div>
  );
}
