import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { AuthShell } from "@/features/auth-credentials/auth-shell";

export const metadata: YeonPageMetadata = {
  title: `이메일 인증 완료 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

export default function AuthVerifiedPage() {
  return (
    <AuthShell
      eyebrow="Verified"
      title="이메일 인증이 완료되었어요"
      description="이제 이메일과 비밀번호로 로그인할 수 있습니다."
      footer={
        <YeonLink
          href="/auth/login"
          className={YEON_WEB_AUTH_CLASS.primaryAction}
        >
          로그인
        </YeonLink>
      }
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={YEON_WEB_AUTH_CLASS.body13}
      >
        이미 로그인된 상태라면 자동으로 이용이 가능합니다. 로그아웃된 상태라면
        로그인 버튼을 눌러 주세요.
      </YeonText>
    </AuthShell>
  );
}
