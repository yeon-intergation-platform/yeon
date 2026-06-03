import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { normalizeAuthRedirectPath } from "@/server/auth/constants";
import { AuthShell } from "@/features/auth-credentials/auth-shell";
import { LoginForm } from "@/features/auth-credentials/login-form";

export const metadata: YeonPageMetadata = {
  title: `이메일 로그인 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

type PageProps = {
  searchParams: Promise<{
    next?: string | string[];
    resetOk?: string | string[];
  }>;
};

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CredentialLoginPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const nextPath = normalizeAuthRedirectPath(pickFirst(resolved.next));
  const showResetSuccess = pickFirst(resolved.resetOk) === "1";

  return (
    <AuthShell
      eyebrow="Sign in"
      title="이메일로 로그인"
      description="가입한 이메일과 비밀번호로 로그인하세요."
      footer={
        <YeonView className={YEON_WEB_AUTH_CLASS.footerLinks}>
          <YeonLink
            href={`/auth/register?next=${encodeURIComponent(nextPath)}`}
            className={YEON_WEB_AUTH_CLASS.inlineLinkStrong}
          >
            계정 만들기
          </YeonLink>
          <YeonLink
            href="/auth/reset-request"
            className={YEON_WEB_AUTH_CLASS.inlineLink}
          >
            비밀번호 찾기
          </YeonLink>
          <YeonLink
            href={`/?login=1&next=${encodeURIComponent(nextPath)}`}
            className={YEON_WEB_AUTH_CLASS.inlineLink}
          >
            소셜 로그인으로 돌아가기
          </YeonLink>
        </YeonView>
      }
    >
      {showResetSuccess ? (
        <YeonView role="status" className={YEON_WEB_AUTH_CLASS.alertPanel}>
          <YeonText variant="unstyled" tone="inherit" className="m-0 font-bold">
            비밀번호가 재설정되었습니다.
          </YeonText>
          <YeonText variant="unstyled" tone="inherit" className="m-0">
            새 비밀번호로 로그인해 주세요.
          </YeonText>
        </YeonView>
      ) : null}
      <LoginForm nextPath={nextPath} />
    </AuthShell>
  );
}
