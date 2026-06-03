"use client";
import { YeonLink } from "@yeon/ui";
import { useEffect, useState } from "react";
import {
  useYeonBodyClass,
  useYeonBodyScrollLock,
  useYeonEscapeKey,
} from "@yeon/ui/hooks/YeonBrowserHooks";
import {
  YeonBrandIcon,
  YeonButton,
  YeonField,
  YeonIcon,
  YeonOption,
  YeonPortal,
  YeonText,
  YeonView,
} from "@yeon/ui";
import {
  assignYeonLocation,
  createYeonUrlSearchParams,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { DevLoginOption } from "@/lib/auth/dev-login-options";
import { analyticsEvents, trackEvent } from "@/lib/analytics";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  nextPath: string;
  devLoginOptions: DevLoginOption[];
};

function getProviderLabel(providers: DevLoginOption["providers"]) {
  return providers
    .map((provider) => {
      if (provider === "google") {
        return "구글";
      }

      if (provider === "kakao") {
        return "카카오";
      }

      return "개발";
    })
    .join(" · ");
}

export function LoginModal({
  open,
  onClose,
  nextPath,
  devLoginOptions,
}: LoginModalProps) {
  const [pendingProvider, setPendingProvider] = useState<
    "google" | "kakao" | "dev-login" | "dev-create" | null
  >(null);
  const [selectedDevLoginAccount, setSelectedDevLoginAccount] = useState(
    devLoginOptions[0]?.accountKey ?? ""
  );
  const hasDevLoginOptions = devLoginOptions.length > 0;
  const selectedDevLoginOption =
    devLoginOptions.find(
      (option) => option.accountKey === selectedDevLoginAccount
    ) ?? devLoginOptions[0];

  useYeonBodyScrollLock(open);
  useYeonBodyClass("landing-login-open", open);
  useYeonEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) {
      setPendingProvider(null);
      setSelectedDevLoginAccount(devLoginOptions[0]?.accountKey ?? "");
    }
  }, [devLoginOptions, open]);

  useEffect(() => {
    if (!selectedDevLoginAccount && devLoginOptions[0]) {
      setSelectedDevLoginAccount(devLoginOptions[0].accountKey);
    }
  }, [devLoginOptions, selectedDevLoginAccount]);

  const kakaoLoginHref = `/api/auth/kakao?next=${encodeURIComponent(nextPath)}`;
  const googleLoginHref = `/api/auth/google?next=${encodeURIComponent(nextPath)}`;

  function moveToSocialLogin(provider: "google" | "kakao", href: string) {
    trackEvent("login_click", {
      source: "landing_modal",
      method: provider,
      next_path: nextPath,
    });
    setPendingProvider(provider);
    trackEvent(analyticsEvents.loginProviderClick, {
      provider,
      next_path: nextPath,
      surface: "landing_modal",
    });
    assignYeonLocation(href);
  }

  function moveToDevLogin() {
    if (!selectedDevLoginAccount) {
      return;
    }

    setPendingProvider("dev-login");
    trackEvent(analyticsEvents.loginProviderClick, {
      provider: "dev-login",
      next_path: nextPath,
      surface: "landing_modal",
    });

    const searchParams = createYeonUrlSearchParams({
      account: selectedDevLoginAccount,
      next: nextPath,
    });

    assignYeonLocation(`/api/auth/dev-login?${searchParams.toString()}`);
  }

  function createDevLoginAccount() {
    setPendingProvider("dev-create");
    trackEvent(analyticsEvents.loginProviderClick, {
      provider: "dev-create",
      next_path: nextPath,
      surface: "landing_modal",
    });

    const searchParams = createYeonUrlSearchParams({
      create: "1",
      next: nextPath,
    });

    assignYeonLocation(`/api/auth/dev-login?${searchParams.toString()}`);
  }

  if (!open) {
    return null;
  }

  return (
    <YeonPortal>
      <YeonView
        className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(17,17,17,0.72)] p-6 md:p-4"
        onClick={onClose}
      >
        <YeonView
          id="landing-login-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-login-title"
          className="w-[min(100%,560px)] rounded-[32px] border border-[#e5e5e5] bg-white p-9 text-[#111] shadow-[0_28px_80px_rgba(17,17,17,0.14)] md:p-[22px]"
          onClick={(event) => event.stopPropagation()}
        >
          <YeonView className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
            <YeonView className="grid gap-3">
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                id="landing-login-title"
                className="m-0 text-[clamp(24px,3vw,34px)] font-black leading-[1.08] tracking-[-0.04em] text-[#111]"
              >
                공통 계정으로 계속할게요
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="m-0 text-[14px] leading-[1.6] text-[#666]"
              >
                카드·타자·커뮤니티처럼 계정이 필요한 서비스를 바로 이어 쓸 수
                있어요.
              </YeonText>
            </YeonView>

            <YeonButton
              type="button"
              variant="icon"
              size="icon"
              className="w-12 h-12 border border-[#e5e5e5] rounded-full bg-[#fafafa] text-[#666] inline-flex items-center justify-center cursor-pointer transition-[border-color,background-color,color] duration-[220ms] ease-in-out hover:border-[#aaa] hover:bg-white hover:text-[#111]"
              onClick={onClose}
              aria-label="로그인 모달 닫기"
            >
              <YeonIcon name="x" size={18} strokeWidth={2.2} />
            </YeonButton>
          </YeonView>

          <YeonView className="grid gap-3 mt-[30px]">
            <YeonView className="grid gap-[10px]">
              <YeonButton
                type="button"
                variant="primary"
                className="w-full min-h-16 rounded-[18px] inline-flex items-center justify-center gap-3 px-5 text-[17px] font-black tracking-[-0.02em] cursor-pointer transition-[transform,box-shadow,filter,opacity] duration-[220ms] ease-in-out disabled:cursor-not-allowed disabled:opacity-100 hover:enabled:-translate-y-px hover:enabled:shadow-[0_16px_28px_rgba(17,17,17,0.18)]"
                disabled={pendingProvider !== null}
                onClick={() => moveToSocialLogin("kakao", kakaoLoginHref)}
              >
                <YeonBrandIcon
                  name="kakao"
                  size={22}
                  className="shrink-0 text-white"
                />
                {pendingProvider === "kakao"
                  ? "카카오로 이동하는 중..."
                  : "카카오 로그인"}
              </YeonButton>

              <YeonButton
                type="button"
                variant="secondary"
                className="w-full min-h-16 rounded-[18px] inline-flex items-center justify-center gap-3 px-5 text-[17px] font-black tracking-[-0.02em] cursor-pointer transition-[transform,box-shadow,filter,opacity] duration-[220ms] ease-in-out disabled:cursor-not-allowed disabled:opacity-100 hover:enabled:-translate-y-px hover:enabled:shadow-[0_14px_24px_rgba(17,17,17,0.08)]"
                disabled={pendingProvider !== null}
                onClick={() => moveToSocialLogin("google", googleLoginHref)}
              >
                <YeonBrandIcon
                  name="google"
                  size={20}
                  className="shrink-0 text-[#111]"
                />
                {pendingProvider === "google"
                  ? "구글로 이동하는 중..."
                  : "구글 로그인"}
              </YeonButton>
            </YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="m-0 text-[12px] leading-[1.55] tracking-[-0.01em] text-[#666]"
            >
              카카오 로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의한
              것으로 간주됩니다.
            </YeonText>

            <YeonView className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[12px] leading-[1.5] text-[#666]">
              <YeonLink
                href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
                className="font-semibold text-[#111] underline-offset-2 hover:underline"
                onClick={() =>
                  trackEvent(analyticsEvents.loginSecondaryClick, {
                    target: "email_login",
                    next_path: nextPath,
                    surface: "landing_modal",
                  })
                }
              >
                이메일로 로그인
              </YeonLink>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                aria-hidden="true"
              >
                ·
              </YeonText>
              <YeonLink
                href={`/auth/register?next=${encodeURIComponent(nextPath)}`}
                className="underline-offset-2 hover:underline"
                onClick={() =>
                  trackEvent(analyticsEvents.loginSecondaryClick, {
                    target: "email_register",
                    next_path: nextPath,
                    surface: "landing_modal",
                  })
                }
              >
                이메일로 가입
              </YeonLink>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                aria-hidden="true"
              >
                ·
              </YeonText>
              <YeonLink
                href="/auth/reset-request"
                className="underline-offset-2 hover:underline"
                onClick={() =>
                  trackEvent(analyticsEvents.loginSecondaryClick, {
                    target: "reset_request",
                    next_path: nextPath,
                    surface: "landing_modal",
                  })
                }
              >
                비밀번호 찾기
              </YeonLink>
            </YeonView>

            {hasDevLoginOptions ? (
              <YeonView className="mt-2 grid gap-3 rounded-[22px] border border-[#e5e5e5] bg-[#fafafa] p-4">
                <YeonView className="grid gap-1">
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#aaa]"
                  >
                    로컬 개발 전용
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="m-0 text-[13px] leading-[1.55] text-[#666]"
                  >
                    운영자 테스트용으로 원하는 계정 세션을 바로 발급합니다.
                  </YeonText>
                </YeonView>

                <YeonView className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <YeonView className="relative">
                    <YeonField
                      as="select"
                      className="h-12 w-full appearance-none rounded-[14px] border border-[#e5e5e5] bg-white px-4 pr-10 text-[14px] font-semibold text-[#111] outline-none transition-colors duration-[180ms] ease-out hover:border-[#aaa] focus:border-[#111]"
                      aria-label="테스트 로그인 계정 선택"
                      disabled={pendingProvider !== null}
                      value={selectedDevLoginAccount}
                      onChange={(event) =>
                        setSelectedDevLoginAccount(event.target.value)
                      }
                    >
                      {devLoginOptions.map((option) => (
                        <YeonOption
                          key={option.accountKey}
                          value={option.accountKey}
                        >
                          {option.displayName
                            ? `${option.displayName} · ${option.email}`
                            : option.email}
                        </YeonOption>
                      ))}
                    </YeonField>
                    <YeonIcon
                      name="chevron-down"
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                    />
                  </YeonView>

                  <YeonButton
                    type="button"
                    variant="primary"
                    className="min-h-12 rounded-[14px] bg-[#111] px-4 text-[14px] font-bold tracking-[-0.01em] text-white transition-[transform,background-color,opacity] duration-[180ms] ease-out hover:enabled:-translate-y-px hover:enabled:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      pendingProvider !== null || !selectedDevLoginAccount
                    }
                    onClick={moveToDevLogin}
                  >
                    {pendingProvider === "dev-login"
                      ? "테스트 로그인 중..."
                      : "선택 계정으로 로그인"}
                  </YeonButton>

                  <YeonButton
                    type="button"
                    variant="secondary"
                    className="min-h-12 rounded-[14px] border border-[#e5e5e5] bg-white px-4 text-[14px] font-bold tracking-[-0.01em] text-[#111] transition-[transform,border-color,background-color,opacity] duration-[180ms] ease-out hover:enabled:-translate-y-px hover:enabled:border-[#aaa] hover:enabled:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={pendingProvider !== null}
                    onClick={createDevLoginAccount}
                  >
                    {pendingProvider === "dev-create"
                      ? "생성 중..."
                      : "새 계정 생성 후 로그인"}
                  </YeonButton>
                </YeonView>

                {selectedDevLoginOption ? (
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="m-0 text-[12px] leading-[1.55] tracking-[-0.01em] text-[#666]"
                  >
                    {selectedDevLoginOption.email} ·{" "}
                    {getProviderLabel(selectedDevLoginOption.providers)}
                  </YeonText>
                ) : null}
              </YeonView>
            ) : null}
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonPortal>
  );
}
