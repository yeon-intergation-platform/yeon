"use client";
import { YeonButton, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import Image from "next/image";
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

type FrameBreakForeground = {
  src: string;
  width: number;
  height: number;
  alt: string;
  bottomClassName: string;
};

type FrameBreakArtwork = {
  order: string;
  foreground?: FrameBreakForeground;
};

const LANDING_CARD_BACKGROUND_SRC =
  "/images/landing/baekji-frame-break-background.webp";

const FRAME_BREAK_ARTWORK_BY_SERVICE: Readonly<
  Record<string, FrameBreakArtwork>
> = {
  "typing-service": {
    order: "1",
    foreground: {
      src: "/images/landing/typing-frame-break-foreground-v10.webp",
      width: 1830,
      height: 792,
      alt: "키보드 앞에서 전등을 켜고 타자 연습 중인 캐릭터",
      bottomClassName: "-bottom-8",
    },
  },
  "recall-service": {
    order: "2",
    foreground: {
      src: "/images/landing/baekji-frame-break-foreground.webp",
      width: 1454,
      height: 630,
      alt: "노트를 보며 백지 학습 내용을 떠올리는 캐릭터",
      bottomClassName: "-bottom-2",
    },
  },
  "card-service": {
    order: "3",
    foreground: {
      src: "/images/landing/card-deck-frame-break-foreground.webp",
      width: 1448,
      height: 632,
      alt: "플래시카드를 넘기며 복습하는 캐릭터",
      bottomClassName: "-bottom-2",
    },
  },
  community: {
    order: "4",
    foreground: {
      src: "/images/landing/community-frame-break-foreground-v2.webp",
      width: 1482,
      height: 967,
      alt: "대화와 공지를 주고받는 커뮤니티 캐릭터와 말풍선",
      bottomClassName: "-bottom-4",
    },
  },
  "todo-service": {
    order: "5",
    foreground: {
      src: "/images/landing/today-frame-break-foreground-v1.webp",
      width: 1536,
      height: 1024,
      alt: "오늘 할 일을 보드에 정리하는 캐릭터",
      bottomClassName: "-bottom-4",
    },
  },
  "discord-ai": { order: "6" },
  news: {
    order: "7",
    foreground: {
      src: "/images/landing/news-frame-break-foreground-v1.webp",
      width: 1446,
      height: 675,
      alt: "YEON 뉴스를 읽으며 소식을 확인하는 캐릭터",
      bottomClassName: "-bottom-2",
    },
  },
  "game-service": { order: "8" },
  "owner-portfolio": { order: "9" },
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
            <YeonView className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleServices.map((service) => {
                const isLive = service.status === platformServiceStatuses.live;
                const inDevelopment = service.inDevelopment === true;
                const requiresAuth =
                  service.accessPolicy ===
                  platformServiceAccessPolicies.authRequired;
                const canOpen =
                  isLive &&
                  !inDevelopment &&
                  (!requiresAuth || isAuthenticated);
                const needsLogin =
                  isLive && !inDevelopment && requiresAuth && !isAuthenticated;
                const frameBreakArtwork =
                  FRAME_BREAK_ARTWORK_BY_SERVICE[service.slug];
                const hasFrameBreakArtwork = frameBreakArtwork !== undefined;
                const cardBase = hasFrameBreakArtwork
                  ? "group relative flex min-w-0 flex-col !items-stretch !justify-start rounded-2xl border border-[#e5e5e5] bg-white !p-0 text-left !font-normal shadow-sm transition-colors duration-200"
                  : "group flex min-w-0 flex-col rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6 text-left shadow-sm transition-colors duration-200";
                const interactiveCard = "hover:border-[#111] hover:bg-white";
                const statusBadge = (
                  <YeonView
                    as="span"
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isLive && !inDevelopment
                        ? hasFrameBreakArtwork
                          ? "border border-[#ddd6fe] bg-[#f5f3ff] text-[#5b21b6]"
                          : "border border-[#e5e5e5] bg-[#f5f5f5] text-[#333]"
                        : "border border-[#e5e5e5] bg-white text-[#999]"
                    }`}
                  >
                    {isLive && !inDevelopment ? (
                      <YeonView
                        as="span"
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          hasFrameBreakArtwork
                            ? "bg-[#7c3aed]"
                            : "bg-emerald-500"
                        }`}
                      />
                    ) : null}
                    {inDevelopment ? "개발 중" : isLive ? "운영 중" : "준비 중"}
                  </YeonView>
                );
                const actionLabel = canOpen
                  ? "바로 이동"
                  : needsLogin
                    ? "로그인 후 이동"
                    : inDevelopment
                      ? "개발 중"
                      : "준비 중";
                const standardCardInner = (
                  <>
                    <YeonView className="flex items-start justify-between gap-3">
                      <YeonText
                        as="h3"
                        variant="unstyled"
                        tone="inherit"
                        className="min-w-0 text-[19px] font-bold tracking-[-0.03em] text-[#111]"
                      >
                        {inDevelopment
                          ? `${service.title} (개발중)`
                          : service.title}
                      </YeonText>
                      {statusBadge}
                    </YeonView>
                    <YeonText
                      variant="unstyled"
                      tone="inherit"
                      className={`mt-4 break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.75]`}
                    >
                      {service.summary}
                    </YeonText>
                    <YeonView className="mt-4 flex items-center justify-start border-t border-[#e5e5e5] pt-4">
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className={`inline-flex items-center gap-1.5 ${
                          isLive && !inDevelopment
                            ? SHARED_FEATURE_CLASS.text13Emphasis
                            : SHARED_FEATURE_CLASS.text13EmphasisSubtle
                        }`}
                      >
                        {actionLabel}
                        {isLive && !inDevelopment ? (
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
                const frameBreakCardInner = frameBreakArtwork ? (
                  <>
                    <YeonView className="relative overflow-hidden rounded-t-2xl">
                      <YeonView
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 z-10 h-24 bg-white"
                      />
                      <YeonView className="relative z-50 flex h-24 items-start justify-between gap-3 px-5 pb-8 pt-3">
                        <YeonView className="relative z-50 flex min-w-0 items-center gap-3 bg-white pr-3">
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            aria-hidden="true"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111] text-[15px] font-bold text-white"
                          >
                            {frameBreakArtwork.order}
                          </YeonText>
                          <YeonText
                            as="h3"
                            variant="unstyled"
                            tone="inherit"
                            className="truncate text-[18px] font-bold tracking-[-0.03em] text-[#111]"
                          >
                            {service.title}
                          </YeonText>
                        </YeonView>
                        <YeonView className="relative z-50">
                          {statusBadge}
                        </YeonView>
                      </YeonView>

                      <YeonView className="relative z-20 h-48 overflow-hidden sm:h-52">
                        <YeonView className="absolute inset-0 overflow-hidden">
                          <Image
                            src={LANDING_CARD_BACKGROUND_SRC}
                            alt=""
                            fill
                            loading="eager"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </YeonView>
                      </YeonView>
                      {frameBreakArtwork.foreground ? (
                        <Image
                          src={frameBreakArtwork.foreground.src}
                          alt={frameBreakArtwork.foreground.alt}
                          width={frameBreakArtwork.foreground.width}
                          height={frameBreakArtwork.foreground.height}
                          loading="eager"
                          sizes="(min-width: 1024px) 46vw, (min-width: 640px) 70vw, 170vw"
                          className={`pointer-events-none absolute left-1/2 z-40 h-auto w-[min(170%,35rem)] max-w-none -translate-x-1/2 drop-shadow-[0_12px_16px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none ${frameBreakArtwork.foreground.bottomClassName}`}
                        />
                      ) : null}
                    </YeonView>

                    <YeonView className="relative z-30 mt-auto rounded-b-2xl bg-white px-5 py-4">
                      <YeonText
                        variant="unstyled"
                        tone="inherit"
                        className={`break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.7]`}
                      >
                        {service.summary}
                      </YeonText>
                      <YeonView className="mt-4 flex items-center justify-end border-t border-[#e5e5e5] pt-4">
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className={`inline-flex items-center gap-2 ${
                            isLive && !inDevelopment
                              ? SHARED_FEATURE_CLASS.text13Emphasis
                              : SHARED_FEATURE_CLASS.text13EmphasisSubtle
                          }`}
                        >
                          {actionLabel}
                          {isLive && !inDevelopment ? (
                            <YeonText
                              as="span"
                              variant="unstyled"
                              tone="inherit"
                              aria-hidden="true"
                              className="text-base transition-transform duration-200 group-hover:translate-x-0.5"
                            >
                              →
                            </YeonText>
                          ) : null}
                        </YeonText>
                      </YeonView>
                    </YeonView>
                  </>
                ) : null;
                const cardInner = frameBreakCardInner ?? standardCardInner;

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
