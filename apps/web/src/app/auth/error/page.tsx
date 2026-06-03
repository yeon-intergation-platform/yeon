import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { getAuthErrorCopy } from "@/server/auth/auth-errors";
import { normalizeAuthRedirectPath } from "@/server/auth/constants";

export const metadata: YeonPageMetadata = {
  title: `로그인 오류 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

type AuthErrorPageProps = {
  searchParams: Promise<{
    reason?: string | string[];
    provider?: string | string[];
    next?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const resolvedSearchParams = await searchParams;
  const reason = pickFirstValue(resolvedSearchParams.reason);
  const provider = pickFirstValue(resolvedSearchParams.provider);
  const nextPath = normalizeAuthRedirectPath(
    pickFirstValue(resolvedSearchParams.next)
  );
  const copy = getAuthErrorCopy(reason, provider);
  const retryHref = `/?login=1&next=${encodeURIComponent(nextPath)}`;

  return (
    <YeonView as="main" className={YEON_WEB_AUTH_CLASS.pageSurface}>
      <YeonView className={YEON_WEB_AUTH_CLASS.frame720}>
        <YeonView as="section" className={YEON_WEB_AUTH_CLASS.panel}>
          <YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={YEON_WEB_AUTH_CLASS.eyebrow}
            >
              Authentication Error
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={YEON_WEB_AUTH_CLASS.titleWide}
            >
              {copy.title}
            </YeonText>
          </YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={YEON_WEB_AUTH_CLASS.description}
          >
            {copy.description}
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={YEON_WEB_AUTH_CLASS.body13Dim}
          >
            문제가 반복되면 공급자 콘솔의 리다이렉트 URI와 환경변수 설정을 함께
            확인해야 합니다.
          </YeonText>
          <YeonView className="flex flex-wrap gap-3 md:flex-col">
            <YeonLink
              href={retryHref}
              className={YEON_WEB_AUTH_CLASS.primaryAction}
            >
              다시 로그인
            </YeonLink>
            <YeonLink
              href="/"
              className={YEON_WEB_AUTH_CLASS.secondaryAction52}
            >
              홈으로 돌아가기
            </YeonLink>
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
