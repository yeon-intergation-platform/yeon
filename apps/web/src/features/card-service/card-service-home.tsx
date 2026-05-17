"use client";

import Link from "next/link";
import { useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  CommonProductHeader,
  ProductHeaderSettingsButton,
} from "@/components/product-shell/product-header";
import { TypingProfileCard } from "@/features/typing-service/typing-profile-card";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";

import { useIsAuthenticated } from "./auth-context";
import { CardServiceSettingsDialog, CreateDeckDialog } from "./components";
import { useDeckList } from "./hooks";
import { CARD_SERVICE_HOME_CLASS } from "./card-service-home.const";

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
    <div className={CARD_SERVICE_HOME_CLASS.root}>
      <CommonProductHeader
        activeService="card"
        settingsControl={
          <ProductHeaderSettingsButton
            onClick={() => setSettingsOpen(true)}
            aria-label="카드 설정"
          />
        }
      />

      <main className={CARD_SERVICE_HOME_CLASS.main}>
        <section className={CARD_SERVICE_HOME_CLASS.introSection}>
          <div className={CARD_SERVICE_HOME_CLASS.introCopy}>
            <h1 className={CARD_SERVICE_HOME_CLASS.introTitle}>
              바로 시작하는 카드공부
            </h1>
            <p className={CARD_SERVICE_HOME_CLASS.introDescription}>
              카드를 넘기기 전에 먼저 떠올리고, 친구와 함께 답을 확인해보세요.
              혼자 복습하거나 카드방에서 함께 공부할 수 있어요.
            </p>
          </div>
        </section>

        <section className={CARD_SERVICE_HOME_CLASS.boardSection}>
          <div className={CARD_SERVICE_HOME_CLASS.profilePanel}>
            <h2 className={CARD_SERVICE_HOME_CLASS.sectionTitle}>내 프로필</h2>
            <div className={CARD_SERVICE_HOME_CLASS.sectionBody}>
              <TypingProfileCard
                profile={profile}
                onNicknameChange={(nickname) => updateProfile({ nickname })}
                onCharacterChange={(characterId) =>
                  updateProfile({ characterId })
                }
                locale={settings.locale}
              />
            </div>
          </div>

          <div className={CARD_SERVICE_HOME_CLASS.actionPanel}>
            <h2 className={CARD_SERVICE_HOME_CLASS.sectionTitle}>
              오늘의 시작
            </h2>
            <div className={CARD_SERVICE_HOME_CLASS.ctaWrap}>
              <Link
                href="/card-service/rooms"
                className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaPrimary}`}
                onClick={() => trackHomeClick("rooms")}
              >
                <span className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}>
                  카드방 입장
                </span>
                <span className={CARD_SERVICE_HOME_CLASS.ctaTextSecondary}>
                  친구와 역할을 나눠 채팅으로 암기 답변을 검증해요.
                </span>
              </Link>

              {isDeckStateLoading ? (
                <button
                  type="button"
                  disabled
                  className={CARD_SERVICE_HOME_CLASS.ctaLoading}
                >
                  <span className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}>
                    덱 확인 중
                  </span>
                  <span
                    className={CARD_SERVICE_HOME_CLASS.ctaTextSecondaryGray}
                  >
                    저장된 덱이 있는지 확인하고 있어요.
                  </span>
                </button>
              ) : shouldShowDeckListAction ? (
                <Link
                  href="/card-service/decks"
                  className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaDefault}`}
                  onClick={() => trackHomeClick("decks")}
                >
                  <span className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}>
                    내 덱 보기
                  </span>
                  <span
                    className={CARD_SERVICE_HOME_CLASS.ctaTextSecondaryMuted}
                  >
                    {decksQuery.isError
                      ? "덱 목록에서 저장된 카드를 다시 확인해요."
                      : "기존 덱을 열어 카드를 추가하거나 혼자 복습해요."}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openCreate}
                  className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaDefault}`}
                >
                  <span className={CARD_SERVICE_HOME_CLASS.ctaTextPrimary}>
                    새 덱 만들기
                  </span>
                  <span
                    className={CARD_SERVICE_HOME_CLASS.ctaTextSecondaryMuted}
                  >
                    카드방에서 사용할 앞면/뒷면 덱을 먼저 준비해요.
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {isCreateOpen ? (
        <CreateDeckDialog onClose={() => setCreateOpen(false)} />
      ) : null}

      {isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}
    </div>
  );
}
