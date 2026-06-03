import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: YeonPageMetadata = {
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
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="home" brandLabel="YEON 내정보" />

      <YeonView as="main" className="mx-auto max-w-[820px] px-6 py-12 md:px-12">
        <YeonView
          as="section"
          className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-6 md:p-8"
        >
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            My profile
          </YeonText>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[30px] font-black tracking-[-0.04em] md:text-[38px]"
          >
            내정보
          </YeonText>

          {user ? (
            <YeonView className="mt-8 grid gap-4">
              <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                >
                  이메일
                </YeonText>
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="mt-2 text-[15px] font-semibold"
                >
                  {user.email}
                </YeonText>
              </YeonView>
              <YeonView className="grid gap-4 md:grid-cols-2">
                <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                  >
                    로그인 방식
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[15px] font-semibold"
                  >
                    {user.providers.join(", ")}
                  </YeonText>
                </YeonView>
                <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                  >
                    최근 로그인
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[15px] font-semibold"
                  >
                    {formatDateTime(user.lastLoginAt)}
                  </YeonText>
                </YeonView>
              </YeonView>
            </YeonView>
          ) : (
            <YeonView className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="text-[15px] leading-[1.8] text-[#666]"
              >
                내정보를 보려면 로그인이 필요합니다.
              </YeonText>
              <YeonLink
                href="/?login=1&next=%2Fprofile"
                className={
                  SHARED_FEATURE_CLASS.primaryActionButtonMd13 + " mt-5"
                }
              >
                로그인하고 내정보 보기
              </YeonLink>
            </YeonView>
          )}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
