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
  credentialResendVerification,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";

type ResendViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "sent" };

type ResendVerificationFormProps = {
  initialEmail?: string;
};

export function ResendVerificationForm({
  initialEmail = "",
}: ResendVerificationFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<ResendViewState>({ kind: "idle" });
  const resendMutation = useMutation({
    mutationFn: credentialResendVerification,
  });

  const isSubmitting = state.kind === "submitting" || resendMutation.isPending;

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    setState({ kind: "submitting" });

    try {
      await resendMutation.mutateAsync({ email });
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
          인증 메일을 다시 보냈습니다.
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="m-0">
          받은 편지함을 확인해 주세요. 스팸함도 함께 살펴보시면 좋아요. 메일이
          도착하지 않으면 잠시 후 한 번 더 요청할 수 있습니다.
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonForm onSubmit={handleSubmit} className="grid gap-3">
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
        className={YEON_WEB_AUTH_CLASS.secondaryAction}
      >
        {isSubmitting ? "재발송 중..." : "인증 메일 다시 받기"}
      </YeonButton>
    </YeonForm>
  );
}
