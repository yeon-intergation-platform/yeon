import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonView } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { AuthShell } from "@/features/auth-credentials/auth-shell";
import { ResetRequestForm } from "@/features/auth-credentials/reset-request-form";

export const metadata: YeonPageMetadata = {
  title: `비밀번호 재설정 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

export default function ResetRequestPage() {
  return (
    <AuthShell
      eyebrow="Reset password"
      title="비밀번호 재설정 요청"
      description="가입한 이메일로 재설정 링크를 보내드립니다."
      footer={
        <YeonView className={YEON_WEB_AUTH_CLASS.footerLinks}>
          <YeonLink
            href="/auth/login"
            className={YEON_WEB_AUTH_CLASS.inlineLink}
          >
            로그인으로 돌아가기
          </YeonLink>
          <YeonLink
            href="/auth/register"
            className={YEON_WEB_AUTH_CLASS.inlineLink}
          >
            계정이 없나요? 가입
          </YeonLink>
        </YeonView>
      }
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
