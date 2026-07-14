"use client";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { ProductPageHeader } from "@/components/product-shell/product-page-header";
import {
  TypingProfileCard,
  TypingProfileCardSkeleton,
} from "@/features/typing-service/typing-profile-card";
import {
  YeonButton,
  YeonLink,
  YeonProductHeaderActionButton,
  YeonServiceHelpDialog,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { CARD_SERVICE_HOME_CLASS } from "./card-service-home.const";
import {
  CARD_SERVICE_FAQS,
  CARD_SERVICE_FEATURES,
  CARD_SERVICE_SEO_HEADING,
  CARD_SERVICE_SEO_INTRO,
} from "./card-service-content";
import {
  CARD_SERVICE_HOME_DECK_ACTION,
  type CardServiceHomeState,
} from "./use-card-service-home-state";

type CardServiceHomePartsProps = {
  home: CardServiceHomeState;
};

export function CardServiceHomeHeader({ home }: CardServiceHomePartsProps) {
  return (
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
            onClick={home.openSettings}
            aria-label="카드 설정"
          />
        </>
      }
    />
  );
}

export function CardServiceHomeIntroSection() {
  return (
    <YeonView className={CARD_SERVICE_HOME_CLASS.introSection}>
      <ProductPageHeader
        title="바로 시작하는 카드공부"
        description="카드를 넘기기 전에 먼저 떠올리고, 친구와 함께 답을 확인해보세요. 혼자 복습하거나 카드방에서 함께 공부할 수 있어요."
      />
    </YeonView>
  );
}

export function CardServiceHomeBoardSection({
  home,
}: CardServiceHomePartsProps) {
  return (
    <YeonView as="section" className={CARD_SERVICE_HOME_CLASS.boardSection}>
      <CardServiceHomeProfilePanel home={home} />
      <CardServiceHomeActionPanel home={home} />
    </YeonView>
  );
}

function CardServiceHomeProfilePanel({ home }: CardServiceHomePartsProps) {
  return (
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
        {home.profileLoaded ? (
          <TypingProfileCard
            profile={home.profile}
            onNicknameChange={home.profileActions.onNicknameChange}
            onCharacterChange={home.profileActions.onCharacterChange}
            locale={home.locale}
          />
        ) : (
          <TypingProfileCardSkeleton />
        )}
      </YeonView>
    </YeonView>
  );
}

function CardServiceHomeActionPanel({ home }: CardServiceHomePartsProps) {
  return (
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
        <CardServiceHomeRoomAction home={home} />
        <CardServiceHomeDeckAction home={home} />
      </YeonView>
    </YeonView>
  );
}

function CardServiceHomeRoomAction({ home }: CardServiceHomePartsProps) {
  return (
    <YeonLink
      href={resolveYeonWebPath("cardRoomList")}
      className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaPrimary}`}
      onClick={() => home.trackHomeClick("rooms")}
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
  );
}

function CardServiceHomeDeckAction({ home }: CardServiceHomePartsProps) {
  if (home.deckAction === CARD_SERVICE_HOME_DECK_ACTION.loading) {
    return <CardServiceHomeDeckLoadingAction />;
  }

  if (home.deckAction === CARD_SERVICE_HOME_DECK_ACTION.list) {
    return <CardServiceHomeDeckListAction home={home} />;
  }

  return <CardServiceHomeDeckCreateAction home={home} />;
}

function CardServiceHomeDeckLoadingAction() {
  return (
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
  );
}

function CardServiceHomeDeckListAction({ home }: CardServiceHomePartsProps) {
  return (
    <YeonLink
      href="/card-service/decks"
      className={`${CARD_SERVICE_HOME_CLASS.ctaBase} ${CARD_SERVICE_HOME_CLASS.ctaDefault}`}
      onClick={() => home.trackHomeClick("decks")}
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
        {home.isDeckListError
          ? "덱 목록에서 저장된 카드를 다시 확인해요."
          : "기존 덱을 열어 카드를 추가하거나 혼자 복습해요."}
      </YeonText>
    </YeonLink>
  );
}

function CardServiceHomeDeckCreateAction({ home }: CardServiceHomePartsProps) {
  return (
    <YeonButton
      type="button"
      onClick={home.openCreate}
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
  );
}
