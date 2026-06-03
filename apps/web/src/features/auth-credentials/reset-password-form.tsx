"use client";
import { useState } from "react";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui/types";
import { credentialPasswordPolicy } from "@yeon/api-contract/credential";
import { YeonButton, YeonField, YeonForm, YeonLabel, YeonText } from "@yeon/ui";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  credentialConfirmReset,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";

type ResetPasswordViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

type ResetPasswordFormProps = {
  token: string;
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

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useYeonRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<ResetPasswordViewState>({ kind: "idle" });
  const confirmResetMutation = useMutation({
    mutationFn: credentialConfirmReset,
  });

  const isSubmitting =
    state.kind === "submitting" || confirmResetMutation.isPending;
  const passwordHelper = deriveHelperMessage(password);
  const mismatched = confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();

    if (passwordHelper) {
      setState({ kind: "error", message: passwordHelper });
      return;
    }
    if (mismatched) {
      setState({
        kind: "error",
        message: "확인용 비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    setState({ kind: "submitting" });

    try {
      await confirmResetMutation.mutateAsync({ token, newPassword: password });
      router.push("/auth/login?resetOk=1");
    } catch (error) {
      const message = getCredentialErrorMessage(
        error,
        "비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
      setState({ kind: "error", message });
    }
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
          새 비밀번호
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

      <YeonLabel className={YEON_WEB_AUTH_CLASS.label}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.labelText}
        >
          새 비밀번호 확인
        </YeonText>
        <YeonField
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="비밀번호를 한 번 더 입력해 주세요."
          disabled={isSubmitting}
        />
        {mismatched ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] leading-[1.55] text-[#f8f7f3]"
          >
            두 비밀번호가 일치하지 않아요.
          </YeonText>
        ) : null}
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

      <YeonButton
        type="submit"
        disabled={isSubmitting || passwordHelper !== null || mismatched}
        className={YEON_WEB_AUTH_CLASS.primaryAction}
      >
        {isSubmitting ? "재설정 중..." : "비밀번호 재설정"}
      </YeonButton>
    </YeonForm>
  );
}
