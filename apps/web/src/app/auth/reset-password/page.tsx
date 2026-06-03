import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { AuthShell } from "@/features/auth-credentials/auth-shell";
import { ResetPasswordForm } from "@/features/auth-credentials/reset-password-form";

export const metadata: YeonPageMetadata = {
  title: `비밀번호 재설정 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

type PageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const token = pickFirst(resolved.token) ?? "";

  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="재설정 링크가 올바르지 않아요"
        description="메일에서 받은 재설정 링크를 다시 눌러주세요. 링크가 만료되었다면 재설정을 다시 요청할 수 있습니다."
        footer={
          <YeonLink
            href="/auth/reset-request"
            className={YEON_WEB_AUTH_CLASS.secondaryAction}
          >
            재설정 다시 요청하기
          </YeonLink>
        }
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.body13}
        >
          브라우저 주소창의 token 값이 잘려 있거나 비어 있으면 메일 링크를 다시
          눌러 주세요.
        </YeonText>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="새 비밀번호 설정"
      description="새로 사용할 비밀번호를 입력하세요. 설정 후에는 기존 모든 기기의 로그인이 해제됩니다."
      footer={
        <YeonLink
          href="/auth/login"
          className={`text-[13px] ${YEON_WEB_AUTH_CLASS.inlineLink}`}
        >
          로그인으로 돌아가기
        </YeonLink>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
