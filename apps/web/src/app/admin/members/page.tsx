import type { Metadata } from "next";
import Link from "next/link";

import { AdminMemberList } from "@/features/admin/admin-member-list";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getCurrentAdminUser, getAdminSeedEmails } from "@/server/auth/admin";
import {
  fetchUsersFromSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";

export const metadata: Metadata = {
  title: "회원 관리 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

function AdminDenied() {
  const seedEmails = Array.from(getAdminSeedEmails());
  const hasSeedEmail = seedEmails.some(Boolean);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
      <section className="max-w-xl rounded-2xl border border-[#e5e5e5] bg-white p-8">
        <p className="text-[13px] font-semibold text-red-600">관리자 전용</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#111]">
          관리자 권한이 필요합니다
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#666]">
          회원관리 페이지는 DB role이 <strong>admin</strong>인 계정만 접근할 수
          있습니다. 최초 관리자는 운영 환경변수 <code>YEON_ADMIN_EMAILS</code>
          또는 <code>ADMIN_EMAILS</code>에 이메일을 넣고 로그인하면 자동으로
          admin role로 승격됩니다.
        </p>
        <div className="mt-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
          <p className="font-bold text-[#111]">현재 시드 설정</p>
          <p className="mt-1">
            {hasSeedEmail
              ? `${seedEmails.length}개 이메일이 설정되어 있습니다.`
              : "아직 시드 이메일이 설정되어 있지 않습니다."}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
          >
            로그인하기
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#666] no-underline transition-colors hover:border-[#ddd] hover:text-[#111]"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}

function AdminMemberListError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-[#111] md:px-12">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8">
        <p className="text-[13px] font-bold text-red-600">회원 목록 오류</p>
        <h1 className="mt-2 text-[26px] font-black tracking-[-0.04em]">
          회원 정보를 불러오지 못했습니다
        </h1>
        <p className="mt-4 text-[14px] leading-6 text-[#666]">{message}</p>
      </section>
    </main>
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
      <div className="min-h-screen bg-white">
        <div className="border-b border-[#e5e5e5] bg-white px-6 py-3 text-[#111] md:px-12">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[#888]">관리자</p>
              <p className="text-[14px] font-semibold">
                {adminUser.email} · 회원 관리
              </p>
            </div>
            <Link
              href="/admin/typing-decks"
              className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
            >
              타자 덱 관리자
            </Link>
          </div>
        </div>
        <AdminMemberList users={result.users} />
      </div>
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
