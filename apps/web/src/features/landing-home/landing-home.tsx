"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import { useCallback, useEffect, useState } from "react";
import type { DevLoginOption } from "@/lib/auth/dev-login-options";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CommonProductHeader } from "@/components/product-shell/product-header";
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

const COUNSELING_SERVICE_SLUG = "counseling-service";

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
  const [isCounselingServiceHidden, setIsCounselingServiceHidden] =
    useState(true);

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

  const visibleServices = isCounselingServiceHidden
    ? services.filter((service) => service.slug !== COUNSELING_SERVICE_SLUG)
    : services;
  const hasHiddenCounselingService = services.some(
    (service) => service.slug === COUNSELING_SERVICE_SLUG
  );
  const hiddenServiceCount = services.length - visibleServices.length;

  return (
    <>
      <LoginModal
        open={isLoginModalOpen}
        onClose={handleLoginModalClose}
        nextPath={loginNextPath}
        devLoginOptions={devLoginOptions}
      />

      <div className={SHARED_FEATURE_CLASS.pageSurface}>
        <CommonProductHeader
          activeService="home"
          rightExtras={
            !isAuthenticated ? (
              <button
                type="button"
                className={`rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 transition-colors hover:border-[#111] hover:bg-[#fafafa] ${SHARED_FEATURE_CLASS.text13Emphasis}`}
                onClick={() => handleLoginModalOpen(nextPath, "landing_nav")}
              >
                로그인
              </button>
            ) : null
          }
        />

        <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-12 md:py-20">
          <section className="max-w-[720px]">
            <h1 className="mt-4 text-balance break-keep text-[30px] font-black tracking-[-0.04em] text-[#111] md:text-[40px]">
              현재 {visibleServices.length}가지 서비스를 운영 중입니다.
            </h1>
            <p
              className={`mt-4 max-w-[720px] ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8] md:text-[15px]`}
            >
              필요한 서비스를 선택해 바로 이용해보세요.
            </p>
            {hasHiddenCounselingService ? (
              <button
                type="button"
                className="mt-5 inline-flex min-h-[44px] items-center rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-[13px] font-semibold text-[#555] transition-colors hover:border-[#111] hover:text-[#111]"
                aria-pressed={!isCounselingServiceHidden}
                aria-label={
                  isCounselingServiceHidden
                    ? "숨겨진 서비스 보기"
                    : "상담 기록 워크스페이스 숨기기"
                }
                onClick={() =>
                  setIsCounselingServiceHidden((hidden) => !hidden)
                }
              >
                {isCounselingServiceHidden
                  ? `숨겨진 서비스 ${hiddenServiceCount}개 보기`
                  : "상담 기록 워크스페이스 숨기기"}
              </button>
            ) : null}
          </section>

          <section className="mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleServices.map((service) => {
                const isLive = service.status === platformServiceStatuses.live;
                const requiresAuth =
                  service.accessPolicy ===
                  platformServiceAccessPolicies.authRequired;
                const canOpen = isLive && (!requiresAuth || isAuthenticated);
                const needsLogin = isLive && requiresAuth && !isAuthenticated;
                const cardBase =
                  "group flex min-w-0 flex-col rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-left shadow-sm transition-colors duration-200";
                const interactiveCard = "hover:border-[#111] hover:bg-white";
                const cardInner = (
                  <>
                    <div className="flex items-start justify-end gap-3">
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
                      <p
                        className={`mt-3 break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8]`}
                      >
                        {service.summary}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-[#e5e5e5] pt-5">
                      <span
                        className={`inline-flex items-center gap-1.5 ${SHARED_FEATURE_CLASS.text13Emphasis}`}
                      >
                        {canOpen
                          ? "바로 이동"
                          : needsLogin
                            ? "로그인 후 이동"
                            : "준비 중"}
                        {isLive ? <span aria-hidden="true">→</span> : null}
                      </span>
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
            <span className={SHARED_FEATURE_CLASS.text12Soft}>
              &copy; 2026 {SITE_BRAND_NAME}
            </span>
            <div className="flex items-center gap-3">
              <a
                href="/privacy"
                className={`${SHARED_FEATURE_CLASS.text12Neutral} no-underline hover:text-[#111]`}
              >
                개인정보처리방침
              </a>
              <span aria-hidden="true" className="text-[#aaa]">
                ·
              </span>
              <a
                href="/terms"
                className={`${SHARED_FEATURE_CLASS.text12Neutral} no-underline hover:text-[#111]`}
              >
                이용약관
              </a>
              <span aria-hidden="true" className="text-[#aaa]">
                ·
              </span>
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className={`${SHARED_FEATURE_CLASS.text12Neutral} underline decoration-[#e5e5e5] underline-offset-2 hover:text-[#111]`}
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
