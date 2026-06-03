"use client";
import { useState } from "react";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui/types";
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
  credentialRequestReset,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";

type ResetRequestViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "sent" };

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ResetRequestViewState>({ kind: "idle" });
  const requestResetMutation = useMutation({
    mutationFn: credentialRequestReset,
  });

  const isSubmitting =
    state.kind === "submitting" || requestResetMutation.isPending;

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    setState({ kind: "submitting" });

    try {
      await requestResetMutation.mutateAsync({ email });
      setState({ kind: "sent" });
    } catch (error) {
      const message = getCredentialErrorMessage(
        error,
        "요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
      setState({ kind: "error", message });
    }
  }

  if (state.kind === "sent") {
    return (
      <YeonView role="status" className={YEON_WEB_AUTH_CLASS.statusPanel}>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={YEON_WEB_AUTH_CLASS.statusTitle13}
        >
          재설정 메일을 보냈습니다.
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="m-0">
          입력한 이메일이 가입된 계정이라면 1시간 내 유효한 재설정 링크가 포함된
          메일이 도착합니다. 받은 편지함과 스팸함을 함께 확인해 주세요.
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
          가입에 사용한 이메일
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
        {isSubmitting ? "요청 중..." : "재설정 링크 받기"}
      </YeonButton>
    </YeonForm>
  );
}
