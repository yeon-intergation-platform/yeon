import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonView } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { AuthShell } from "@/features/auth-credentials/auth-shell";
import { RegisterForm } from "@/features/auth-credentials/register-form";
import { normalizeAuthRedirectPath } from "@/server/auth/constants";

export const metadata: YeonPageMetadata = {
  title: `계정 만들기 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

type PageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CredentialRegisterPage({
  searchParams,
}: PageProps) {
  const resolved = await searchParams;
  const nextPath = normalizeAuthRedirectPath(pickFirst(resolved.next));

  return (
    <AuthShell
      eyebrow="Sign up"
      title="이메일로 계정 만들기"
      description="카카오/구글 계정 없이도 가입할 수 있습니다. 인증 메일을 받으면 이용이 시작됩니다."
      footer={
        <YeonView className={YEON_WEB_AUTH_CLASS.footerLinks}>
          <YeonLink
            href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
            className={YEON_WEB_AUTH_CLASS.inlineLinkStrong}
          >
            이미 계정이 있으신가요? 로그인
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
      <RegisterForm nextPath={nextPath} />
    </AuthShell>
  );
}
