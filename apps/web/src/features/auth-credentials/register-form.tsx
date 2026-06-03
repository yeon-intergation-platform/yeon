"use client";
import { YeonLink } from "@yeon/ui";
import { useState } from "react";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui/types";
import { credentialPasswordPolicy } from "@yeon/api-contract/credential";
import {
  YeonButton,
  YeonField,
  YeonForm,
  YeonLabel,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  credentialRegister,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";
import { ResendVerificationForm } from "./resend-verification-form";

type RegisterViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "link-needed" }
  | { kind: "email-send-failed"; email: string }
  | { kind: "sent"; email: string };

type RegisterFormProps = {
  nextPath?: string;
};

function deriveHelperMessage(password: string): string | null {
  if (password.length === 0) {
    return null;
  }
  if (password.length < credentialPasswordPolicy.minLength) {
    return `비밀번호가 너무 짧아요 (최소 ${credentialPasswordPolicy.minLength}자).`;
  }
  if (/\s/.test(password)) {
    return "비밀번호에 공백을 포함할 수 없습니다.";
  }
  if (password.length > credentialPasswordPolicy.maxLength) {
    return `비밀번호는 최대 ${credentialPasswordPolicy.maxLength}자까지 가능합니다.`;
  }
  return null;
}

export function RegisterForm({ nextPath = "/" }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<RegisterViewState>({ kind: "idle" });
  const registerMutation = useMutation({
    mutationFn: credentialRegister,
  });

  const isSubmitting =
    state.kind === "submitting" || registerMutation.isPending;
  const passwordHelper = deriveHelperMessage(password);

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    if (passwordHelper) {
      setState({ kind: "error", message: passwordHelper });
      return;
    }

    setState({ kind: "submitting" });

    try {
      const response = await registerMutation.mutateAsync({
        email,
        password,
        displayName: displayName.trim() || null,
      });

      if (response.requiresLinkToExistingAccount) {
        setState({ kind: "link-needed" });
        return;
      }

      if (!response.verificationEmailSent) {
        setState({ kind: "email-send-failed", email });
        return;
      }

      setState({ kind: "sent", email });
    } catch (error) {
      const message = getCredentialErrorMessage(
        error,
        "가입 처리에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
      setState({ kind: "error", message });
    }
  }

  if (state.kind === "link-needed") {
    const socialLoginHref = `/?login=1&next=${encodeURIComponent(nextPath)}`;
    return (
      <YeonView className={YEON_WEB_AUTH_CLASS.noticePanel}>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.statusTitle15}
        >
          이미 같은 이메일로 가입된 소셜 계정이 있어요.
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.body13}
        >
          기존 카카오/구글 계정으로 로그인하신 뒤 프로필 설정에서 &quot;비밀번호
          추가&quot;를 진행하면 같은 계정으로 일반 로그인도 할 수 있어요.
        </YeonText>
        <YeonLink
          href={socialLoginHref}
          className={YEON_WEB_AUTH_CLASS.primaryAction}
        >
          홈에서 소셜 로그인
        </YeonLink>
      </YeonView>
    );
  }

  if (state.kind === "sent") {
    return (
      <YeonView className="grid gap-4">
        <YeonView role="status" className={YEON_WEB_AUTH_CLASS.statusPanel}>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={YEON_WEB_AUTH_CLASS.statusTitle15}
          >
            인증 메일을 발송했습니다.
          </YeonText>
          <YeonText variant="unstyled" tone="inherit" className="m-0">
            받은 편지함에서 링크를 눌러 이메일 인증을 완료해 주세요. 스팸함도
            함께 확인해 보시고, 메일이 도착하지 않으면 아래에서 다시 요청할 수
            있습니다.
          </YeonText>
        </YeonView>
        <ResendVerificationForm initialEmail={state.email} />
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="m-0 text-[12px] text-[#f8f7f3]/55"
        >
          인증 메일은 24시간 동안 유효합니다. 새로운 요청이 들어오면 이전 링크는
          더 이상 사용할 수 없습니다.
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonForm onSubmit={handleSubmit} className="grid gap-4">
      <YeonLabel className={YEON_WEB_AUTH_CLASS.label}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.labelText}
        >
          이메일
        </YeonText>
        <YeonField
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="you@yeon.world"
          disabled={isSubmitting}
        />
      </YeonLabel>

      <YeonLabel className={YEON_WEB_AUTH_CLASS.label}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.labelText}
        >
          표시 이름{" "}
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[#f8f7f3]/50"
          >
            (선택)
          </YeonText>
        </YeonText>
        <YeonField
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="예: 김연재"
          disabled={isSubmitting}
        />
      </YeonLabel>

      <YeonLabel className={YEON_WEB_AUTH_CLASS.label}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.labelText}
        >
          비밀번호
        </YeonText>
        <YeonField
          type="password"
          autoComplete="new-password"
          required
          minLength={credentialPasswordPolicy.minLength}
          maxLength={credentialPasswordPolicy.maxLength}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder={`${credentialPasswordPolicy.minLength}자 이상, 공백 불가`}
          disabled={isSubmitting}
        />
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.helperText}
        >
          {passwordHelper ??
            `최소 ${credentialPasswordPolicy.minLength}자 · 최대 ${credentialPasswordPolicy.maxLength}자 · 공백 불가`}
        </YeonText>
      </YeonLabel>

      {state.kind === "error" ? (
        <YeonText
          role="alert"
          variant="unstyled"
          tone="inherit"
          className={AUTH_CREDENTIALS_COMMON_CLASS.errorText13}
        >
          {state.message}
        </YeonText>
      ) : null}

      {state.kind === "email-send-failed" ? (
        <YeonView role="alert" className={YEON_WEB_AUTH_CLASS.alertPanel}>
          <YeonText variant="unstyled" tone="inherit" className="m-0 font-bold">
            계정은 만들어졌지만 인증 메일 발송에 실패했습니다.
          </YeonText>
          <YeonText variant="unstyled" tone="inherit" className="m-0">
            잠시 후 아래 재발송 페이지에서 인증 메일을 다시 요청해 주세요.
          </YeonText>
          <ResendVerificationForm initialEmail={state.email} />
        </YeonView>
      ) : null}

      <YeonButton
        type="submit"
        disabled={isSubmitting || passwordHelper !== null}
        className={YEON_WEB_AUTH_CLASS.primaryAction}
      >
        {isSubmitting ? "가입 처리 중..." : "계정 만들기"}
      </YeonButton>
    </YeonForm>
  );
}
