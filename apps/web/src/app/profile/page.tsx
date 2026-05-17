import type { Metadata } from "next";
import Link from "next/link";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: `내정보 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ProfilePage() {
  const user = await getCurrentAuthUser();

  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="home" brandLabel="YEON 내정보" />

      <main className="mx-auto max-w-[820px] px-6 py-12 md:px-12">
        <section className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-6 md:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#888]">
            My profile
          </p>
          <h1 className="mt-3 text-[30px] font-black tracking-[-0.04em] md:text-[38px]">
            내정보
          </h1>

          {user ? (
            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                <p className="text-[12px] font-semibold text-[#888]">이메일</p>
                <p className="mt-2 text-[15px] font-semibold">{user.email}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <p className="text-[12px] font-semibold text-[#888]">
                    로그인 방식
                  </p>
                  <p className="mt-2 text-[15px] font-semibold">
                    {user.providers.join(", ")}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <p className="text-[12px] font-semibold text-[#888]">
                    최근 로그인
                  </p>
                  <p className="mt-2 text-[15px] font-semibold">
                    {formatDateTime(user.lastLoginAt)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
              <p className="text-[15px] leading-[1.8] text-[#555]">
                내정보를 보려면 로그인이 필요합니다.
              </p>
              <Link
                href="/?login=1&next=%2Fprofile"
                className="mt-5 inline-flex rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
              >
                로그인하고 내정보 보기
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
