"use client";
import { useState } from "react";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui/types";
import { YeonButton, YeonField, YeonForm, YeonLabel, YeonText } from "@yeon/ui";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  credentialLogin,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";

type LoginViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useYeonRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginViewState>({ kind: "idle" });
  const loginMutation = useMutation({
    mutationFn: credentialLogin,
  });

  const isSubmitting = state.kind === "submitting" || loginMutation.isPending;

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    setState({ kind: "submitting" });
    trackEvent(analyticsEvents.credentialLoginSubmit, {
      method: "credentials",
      next_path: nextPath,
    });

    try {
      await loginMutation.mutateAsync({ email, password });
      trackEvent("login_success", {
        source: "credentials_login_form",
        method: "credentials",
        next_path: nextPath,
      });
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message = getCredentialErrorMessage(
        error,
        "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
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
          비밀번호
        </YeonText>
        <YeonField
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="비밀번호 입력"
          disabled={isSubmitting}
        />
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
        disabled={isSubmitting}
        className={YEON_WEB_AUTH_CLASS.primaryAction}
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </YeonButton>
    </YeonForm>
  );
}
