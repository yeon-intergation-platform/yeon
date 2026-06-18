"use client";
import { YeonButton, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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

  const visibleServices = services;

  return (
    <>
      <LoginModal
        open={isLoginModalOpen}
        onClose={handleLoginModalClose}
        nextPath={loginNextPath}
        devLoginOptions={devLoginOptions}
      />

      <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
        <CommonProductHeader
          activeService="home"
          rightExtras={
            !isAuthenticated ? (
              <YeonButton
                type="button"
                variant="secondary"
                className={`rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 transition-colors hover:border-[#111] hover:bg-[#fafafa] ${SHARED_FEATURE_CLASS.text13Emphasis}`}
                onClick={() => handleLoginModalOpen(nextPath, "landing_nav")}
              >
                로그인
              </YeonButton>
            ) : null
          }
        />

        <YeonView
          as="main"
          className="mx-auto max-w-[1400px] px-6 py-8 md:px-12 md:py-12"
        >
          <YeonView as="section" className="max-w-[720px]">
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="text-balance break-keep text-[30px] font-black tracking-[-0.04em] text-[#111] md:text-[40px]"
            >
              현재 {visibleServices.length}가지 서비스를 운영 중입니다.
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={`mt-4 max-w-[720px] ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8] md:text-[15px]`}
            >
              필요한 서비스를 선택해 바로 이용해보세요.
            </YeonText>
          </YeonView>

          <YeonView as="section" className="mt-8">
            <YeonView className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <YeonView className="flex items-start justify-end gap-3">
                      <YeonView
                        as="span"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isLive
                            ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                            : "border border-[#e5e5e5] bg-[#fafafa] text-[#aaa]"
                        }`}
                      >
                        {isLive ? (
                          <YeonView
                            as="span"
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                          />
                        ) : null}
                        {isLive ? "운영 중" : "준비 중"}
                      </YeonView>
                    </YeonView>
                    <YeonView className="mt-4">
                      <YeonText
                        as="h3"
                        variant="unstyled"
                        tone="inherit"
                        className="text-[20px] font-semibold tracking-[-0.03em] text-[#111]"
                      >
                        {service.title}
                      </YeonText>
                      <YeonText
                        variant="unstyled"
                        tone="inherit"
                        className={`mt-3 break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8]`}
                      >
                        {service.summary}
                      </YeonText>
                    </YeonView>
                    <YeonView className="mt-5 flex items-center border-t border-[#e5e5e5] pt-4">
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className={`inline-flex items-center gap-1.5 ${
                          isLive
                            ? SHARED_FEATURE_CLASS.text13Emphasis
                            : SHARED_FEATURE_CLASS.text13EmphasisSubtle
                        }`}
                      >
                        {canOpen
                          ? "바로 이동"
                          : needsLogin
                            ? "로그인 후 이동"
                            : "준비 중"}
                        {isLive ? (
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            →
                          </YeonText>
                        ) : null}
                      </YeonText>
                    </YeonView>
                  </>
                );

                if (canOpen) {
                  const handleEntryClick = () =>
                    trackEvent(analyticsEvents.serviceEntryClick, {
                      source: "landing_card",
                      service: service.slug,
                      access_policy: service.accessPolicy,
                      authenticated: isAuthenticated,
                    });
                  // 정적 호스팅(public/*.html) 진입은 클라이언트 라우팅 대상이 아니므로 일반 anchor로 연다.
                  if (service.publicHref.endsWith(".html")) {
                    return (
                      <a
                        key={service.slug}
                        href={service.publicHref}
                        className={`${cardBase} ${interactiveCard} no-underline`}
                        onClick={handleEntryClick}
                      >
                        {cardInner}
                      </a>
                    );
                  }
                  return (
                    <YeonLink
                      key={service.slug}
                      href={service.publicHref}
                      className={`${cardBase} ${interactiveCard} no-underline`}
                      onClick={handleEntryClick}
                    >
                      {cardInner}
                    </YeonLink>
                  );
                }
                if (needsLogin) {
                  return (
                    <YeonButton
                      key={service.slug}
                      type="button"
                      variant="secondary"
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
                    </YeonButton>
                  );
                }

                return (
                  <YeonView
                    key={service.slug}
                    className={`${cardBase} bg-white opacity-60`}
                  >
                    {cardInner}
                  </YeonView>
                );
              })}
            </YeonView>
          </YeonView>
        </YeonView>

        <YeonView
          as="footer"
          className="border-t border-[#e5e5e5] px-6 py-6 md:px-12"
        >
          <YeonView className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12Soft}
            >
              &copy; 2026 {SITE_BRAND_NAME}
            </YeonText>
            <YeonView className="flex items-center gap-3">
              <YeonLink
                href="/privacy"
                className={`${SHARED_FEATURE_CLASS.text12Neutral} no-underline hover:text-[#111]`}
              >
                개인정보처리방침
              </YeonLink>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                aria-hidden="true"
                className="text-[#aaa]"
              >
                ·
              </YeonText>
              <YeonLink
                href="/terms"
                className={`${SHARED_FEATURE_CLASS.text12Neutral} no-underline hover:text-[#111]`}
              >
                이용약관
              </YeonLink>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                aria-hidden="true"
                className="text-[#aaa]"
              >
                ·
              </YeonText>
              <YeonLink
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className={`${SHARED_FEATURE_CLASS.text12Neutral} underline decoration-[#e5e5e5] underline-offset-2 hover:text-[#111]`}
              >
                {SITE_SUPPORT_EMAIL}
              </YeonLink>
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonView>
    </>
  );
}
