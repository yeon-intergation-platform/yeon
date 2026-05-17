"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  credentialLogin,
  getCredentialErrorMessage,
} from "@/lib/credential-client";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { AUTH_CREDENTIALS_COMMON_CLASS } from "./auth-credentials-common.const";

type LoginViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginViewState>({ kind: "idle" });
  const loginMutation = useMutation({
    mutationFn: credentialLogin,
  });

  const isSubmitting = state.kind === "submitting" || loginMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-[13px] font-bold tracking-[-0.01em] text-white/[0.82]">
          이메일
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="you@yeon.world"
          disabled={isSubmitting}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-[13px] font-bold tracking-[-0.01em] text-white/[0.82]">
          비밀번호
        </span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={AUTH_CREDENTIALS_COMMON_CLASS.inputTextBase}
          placeholder="비밀번호 입력"
          disabled={isSubmitting}
        />
      </label>

      {state.kind === "error" ? (
        <p role="alert" className={AUTH_CREDENTIALS_COMMON_CLASS.errorText13}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`min-h-[52px] rounded-full bg-[#e8630a] px-[22px] transition-transform duration-200 ease-[ease] hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 ${SHARED_FEATURE_CLASS.text15EmphasisOnCream}`}
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
