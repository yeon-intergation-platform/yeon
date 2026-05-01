import type { Metadata } from "next";
import Link from "next/link";

import { TypingServiceHeader } from "@/features/typing-service";
import { TypingDeckDetailPanel } from "@/features/typing-service/typing-decks-screen";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
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
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader
        active="decks"
        title="YEON 연습덱"
        controls={
          <>
            <Link
              href="/typing-service/decks"
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              덱 목록
            </Link>
            {showAdminEntry ? (
              <Link
                href="/admin/typing-decks"
                className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
              >
                관리자
              </Link>
            ) : null}
          </>
        }
      />

      <main className="px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#888]">
              Typing deck detail
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">
              타자 덱 상세 관리
            </h1>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]">
              덱 정보, 문단 목록, 직접 추가, AI 붙여넣기 관리 기능을 한 화면에서
              이어서 사용할 수 있습니다.
            </p>
          </div>
          {adminMode ? (
            <span className="w-fit rounded-full bg-[#f3f3f3] px-3 py-1 text-[12px] font-semibold text-[#666]">
              관리자 모드
            </span>
          ) : null}
        </div>

        <TypingDeckDetailPanel deckId={deckId} adminMode={adminMode} />
      </main>
    </div>
  );
}
