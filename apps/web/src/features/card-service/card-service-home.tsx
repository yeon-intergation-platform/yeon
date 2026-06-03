"use client";
import { useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  YeonButton,
  YeonView,
  YeonText,
  YeonProductHeaderActionButton,
  YeonLink,
} from "@yeon/ui";
import { YeonServiceHelpDialog } from "@yeon/ui";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import {
  TypingProfileCard,
  TypingProfileCardSkeleton,
} from "@/features/typing-service/typing-profile-card";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { useIsAuthenticated } from "./auth-context";
import { CardServiceSettingsDialog, CreateDeckDialog } from "./components";
import { useDeckList } from "./hooks";
import { CARD_SERVICE_HOME_CLASS } from "./card-service-home.const";
import {
  CARD_SERVICE_FAQS,
  CARD_SERVICE_FEATURES,
  CARD_SERVICE_SEO_HEADING,
  CARD_SERVICE_SEO_INTRO,
} from "./card-service-content";

export function CardServiceHome() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const decksQuery = useDeckList();
  const hasDecks = (decksQuery.data?.length ?? 0) > 0;
  const isDeckStateLoading = decksQuery.isPending;
  const shouldShowDeckListAction = decksQuery.isError || hasDecks;

  const trackHomeClick = (target: string) => {
    trackEvent(analyticsEvents.cardDeckOpen, {
      source: "card_room_home",
      target,
      authenticated: isAuthenticated,
      has_profile: loaded,
      character_id: profile.characterId,
    });
  };

  const openCreate = () => {
    setCreateOpen(true);
    trackEvent(analyticsEvents.cardDeckCreateOpen, {
      source: "card_room_home",
      authenticated: isAuthenticated,
      character_id: profile.characterId,
    });
  };

  return (
    <YeonView className={CARD_SERVICE_HOME_CLASS.root}>
      <CommonProductHeader
        activeService="card"
        settingsControl={
          <>
            <YeonServiceHelpDialog
              content={{
                title: CARD_SERVICE_SEO_HEADING,
                intro: CARD_SERVICE_SEO_INTRO,
                features: CARD_SERVICE_FEATURES,
                faqs: CARD_SERVICE_FAQS,
              }}
            />
            <YeonProductHeaderActionButton
              onClick={() => setSettingsOpen(true)}
              aria-label="카드 설정"
            />
          </>
        }
      />

      <YeonView as="main" className={CARD_SERVICE_HOME_CLASS.main}>
        <YeonView as="section" className={CARD_SERVICE_HOME_CLASS.introSection}>
          <YeonView className={CARD_SERVICE_HOME_CLASS.introCopy}>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={`${CARD_SERVICE_HOME_CLASS.introTitle} break-keep`}
            >
              바로 시작하는 카드공부
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`${CARD_SERVICE_HOME_CLASS.introDescription} break-keep`}
            >
              카드를 넘기기 전에 먼저 떠올리고, 친구와 함께 답을 확인해보세요.
              혼자 복습하거나 카드방에서 함께 공부할 수 있어요.
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonView as="section" className={CARD_SERVICE_HOME_CLASS.boardSection}>
          <YeonView className={CARD_SERVICE_HOME_CLASS.profilePanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={CARD_SERVICE_HOME_CLASS.sectionTitle}
            >
              내 프로필
            </YeonText>
            <YeonView className={CARD_SERVICE_HOME_CLASS.sectionBody}>
              {loaded ? (
                <TypingProfileCard
                  profile={profile}
                  onNicknameChange={(nickname) => updateProfile({ nickname })}
                  onCharacterChange={(characterId) =>
                    updateProfile({ characterId })
                  }
                  locale={settings.locale}
                />
              ) : (
                <TypingProfileCardSkeleton />
              )}
            </YeonView>
          </YeonView>

          <YeonView className={CARD_SERVICE_HOME_CLASS.actionPanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={CARD_SERVICE_HOME_CLASS.sectionTitle}
            >
              오늘의 시작
            </YeonText>
            <YeonView className={CARD_SERVICE_HOME_CLASS.ctaWrap}>
              <YeonLink
                href={resolveYeonWebPath("cardRoomList")}
                className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaPrimary}`}
                onClick={() => trackHomeClick("rooms")}
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}
                >
                  카드방 입장
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={`${CARD_SERVICE_HOME_CLASS.ctaTextSecondary} break-keep`}
                >
                  친구와 역할을 나눠 채팅으로 암기 답변을 검증해요.
                </YeonText>
              </YeonLink>

              {isDeckStateLoading ? (
                <YeonButton
                  type="button"
                  disabled
                  variant="secondary"
                  className={CARD_SERVICE_HOME_CLASS.ctaLoading}
                >
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}
                  >
                    덱 확인 중
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={`${CARD_SERVICE_HOME_CLASS.ctaTextSecondaryGray} break-keep`}
                  >
                    저장된 덱이 있는지 확인하고 있어요.
                  </YeonText>
                </YeonButton>
              ) : shouldShowDeckListAction ? (
                <YeonLink
                  href="/card-service/decks"
                  className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaDefault}`}
                  onClick={() => trackHomeClick("decks")}
                >
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}
                  >
                    내 덱 보기
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={`${CARD_SERVICE_HOME_CLASS.ctaTextSecondaryMuted} break-keep`}
                  >
                    {decksQuery.isError
                      ? "덱 목록에서 저장된 카드를 다시 확인해요."
                      : "기존 덱을 열어 카드를 추가하거나 혼자 복습해요."}
                  </YeonText>
                </YeonLink>
              ) : (
                <YeonButton
                  type="button"
                  onClick={openCreate}
                  variant="secondary"
                  className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaDefault}`}
                >
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}
                  >
                    새 덱 만들기
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={`${CARD_SERVICE_HOME_CLASS.ctaTextSecondaryMuted} break-keep`}
                  >
                    카드방에서 사용할 앞면/뒷면 덱을 먼저 준비해요.
                  </YeonText>
                </YeonButton>
              )}
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonView>

      {isCreateOpen ? (
        <CreateDeckDialog onClose={() => setCreateOpen(false)} />
      ) : null}

      {isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}
    </YeonView>
  );
}
