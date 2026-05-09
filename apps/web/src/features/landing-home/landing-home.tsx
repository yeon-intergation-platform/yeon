"use client";

import { useCallback, useEffect, useState } from "react";
import type { DevLoginOption } from "@/lib/auth/dev-login-options";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import type { PlatformServiceDescriptor } from "@/lib/platform-services";
import {
  platformServiceAccessPolicies,
  platformServiceStatuses,
} from "@/lib/platform-services";
import { SITE_BRAND_NAME, SITE_SUPPORT_EMAIL } from "@/lib/site-brand";
import { LoginModal } from "./login-modal";

type LandingHomeProps = {
  nextPath: string;
  initialLoginModalOpen?: boolean;
  devLoginOptions: DevLoginOption[];
  services: readonly PlatformServiceDescriptor[];
  isAuthenticated: boolean;
};

const serviceLabels: Record<string, string> = {
  "counseling-service": "COUNSELING",
  "typing-service": "TYPING",
  "card-service": "CARD",
};

const serviceEntryHints: Record<string, string> = {
  "counseling-service": "로그인 후 상담 기록 워크스페이스로 이동",
  "typing-service": "로그인 없이 바로 시작 가능",
  "card-service": "게스트로 덱 생성 후 계정으로 이어쓰기 가능",
};

export function LandingHome({
  nextPath,
  initialLoginModalOpen = false,
  devLoginOptions,
  services,
  isAuthenticated,
}: LandingHomeProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    initialLoginModalOpen
  );
  const [loginNextPath, setLoginNextPath] = useState(nextPath);

  useEffect(() => {
    setLoginNextPath(nextPath);
  }, [nextPath]);

  useEffect(() => {
    if (!initialLoginModalOpen) {
      return;
    }

    trackEvent(analyticsEvents.loginModalOpen, {
      source: "landing_query",
      next_path: nextPath,
    });
  }, [initialLoginModalOpen, nextPath]);

  const handleLoginModalOpen = useCallback(
    (targetNextPath: string = nextPath, source: string = "landing") => {
      setLoginNextPath(targetNextPath);
      setIsLoginModalOpen(true);
      trackEvent(analyticsEvents.loginModalOpen, {
        source,
        next_path: targetNextPath,
      });
    },
    [nextPath]
  );

  const handleLoginModalClose = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return (
    <>
      <LoginModal
        open={isLoginModalOpen}
        onClose={handleLoginModalClose}
        nextPath={loginNextPath}
        devLoginOptions={devLoginOptions}
      />

      <div className="min-h-screen bg-white text-[#111]">
        <nav className="border-b border-[#e5e5e5] px-6 py-4 md:px-12">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[#111]">
              {SITE_BRAND_NAME}
            </span>
            {isAuthenticated ? (
              <a
                href="/counseling-service"
                className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
                onClick={() =>
                  trackEvent(analyticsEvents.serviceEntryClick, {
                    source: "landing_nav",
                    service: "counseling-service",
                    authenticated: true,
                  })
                }
              >
                서비스 바로가기
              </a>
            ) : (
              <button
                type="button"
                className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-[13px] font-semibold text-[#111] transition-colors hover:border-[#111] hover:bg-[#fafafa]"
                onClick={() => handleLoginModalOpen(nextPath, "landing_nav")}
              >
                로그인
              </button>
            )}
          </div>
        </nav>

        <main className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-20">
          <section className="max-w-[860px]">
            <span className="inline-flex rounded-full border border-[#e5e5e5] px-3 py-1 text-[11px] font-semibold text-[#555]">
              YEON 서비스 허브
            </span>
            <h1 className="mt-4 text-[30px] font-black tracking-[-0.04em] text-[#111] md:text-[40px]">
              필요한 서비스를 바로 선택하세요
            </h1>
            <p className="mt-4 max-w-[720px] text-[14px] leading-[1.8] text-[#666] md:text-[15px]">
              상담 기록 워크스페이스, 공개형 타자연습, 플래시카드 학습을 같은
              톤으로 정리했습니다. 화려한 랜딩 대신 지금 바로 들어가서 사용할 수
              있는 서비스 중심 화면입니다.
            </p>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <article className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
                <h2 className="text-[15px] font-semibold text-[#111]">
                  바로 진입
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  타자연습과 카드학습은 공개형 흐름에 맞춰 로그인 전에도 바로
                  시작할 수 있습니다.
                </p>
              </article>
              <article className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
                <h2 className="text-[15px] font-semibold text-[#111]">
                  같은 정보 밀도
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  서비스 카드마다 상태, 대상, 진입 방식을 같은 구조로 보여줘 첫
                  화면에서 빠르게 비교할 수 있습니다.
                </p>
              </article>
              <article className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
                <h2 className="text-[15px] font-semibold text-[#111]">
                  업무형 서비스 분리
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  상담 기록 워크스페이스는 로그인 후 진입하는 운영 도구임을
                  메인에서도 분명하게 유지합니다.
                </p>
              </article>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-semibold text-[#111]">
                  서비스 목록
                </h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                  각 서비스의 현재 상태와 진입 방식을 확인하고 바로 이동하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const isLive = service.status === platformServiceStatuses.live;
                const requiresAuth =
                  service.accessPolicy ===
                  platformServiceAccessPolicies.authRequired;
                const canOpen = isLive && (!requiresAuth || isAuthenticated);
                const needsLogin = isLive && requiresAuth && !isAuthenticated;
                const entryHint =
                  serviceEntryHints[service.slug] ?? service.summary;
                const serviceLabel =
                  serviceLabels[service.slug] ?? service.slug;
                const cardBase =
                  "group flex min-w-0 flex-col rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-left transition-colors duration-200";
                const interactiveCard = "hover:border-[#111] hover:bg-white";
                const cardInner = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[11px] font-semibold text-[#555]">
                        {serviceLabel}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isLive
                            ? "bg-[#111] text-white"
                            : "border border-[#e5e5e5] bg-white text-[#777]"
                        }`}
                      >
                        {isLive ? "운영 중" : "준비 중"}
                      </span>
                    </div>
                    <div className="mt-5">
                      <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111]">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.8] text-[#666]">
                        {service.summary}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-[#e5e5e5] pt-4">
                      <p className="text-[12px] font-semibold text-[#555]">
                        {service.audience}
                      </p>
                      <p className="mt-2 text-[13px] leading-[1.7] text-[#666]">
                        {entryHint}
                      </p>
                    </div>
                  </>
                );

                if (canOpen) {
                  return (
                    <a
                      key={service.slug}
                      href={service.href}
                      className={`${cardBase} ${interactiveCard} no-underline`}
                      onClick={() =>
                        trackEvent(analyticsEvents.serviceEntryClick, {
                          source: "landing_card",
                          service: service.slug,
                          access_policy: service.accessPolicy,
                          authenticated: isAuthenticated,
                        })
                      }
                    >
                      {cardInner}
                    </a>
                  );
                }
                if (needsLogin) {
                  return (
                    <button
                      key={service.slug}
                      type="button"
                      className={`${cardBase} ${interactiveCard}`}
                      onClick={() => {
                        trackEvent(analyticsEvents.serviceEntryClick, {
                          source: "landing_card_login_gate",
                          service: service.slug,
                          access_policy: service.accessPolicy,
                          authenticated: isAuthenticated,
                        });
                        handleLoginModalOpen(
                          service.href,
                          `${service.slug}_card`
                        );
                      }}
                    >
                      {cardInner}
                    </button>
                  );
                }

                return (
                  <div
                    key={service.slug}
                    className={`${cardBase} bg-white opacity-60`}
                  >
                    {cardInner}
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <footer className="border-t border-[#e5e5e5] px-6 py-6 md:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
            <span className="text-[12px] text-[#888]">
              &copy; 2026 {SITE_BRAND_NAME}
            </span>
            <div className="flex gap-4">
              <a
                href="/privacy"
                className="text-[12px] text-[#666] no-underline hover:text-[#111]"
              >
                개인정보처리방침
              </a>
              <a
                href="/terms"
                className="text-[12px] text-[#666] no-underline hover:text-[#111]"
              >
                이용약관
              </a>
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="text-[12px] text-[#666] no-underline hover:text-[#111]"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
