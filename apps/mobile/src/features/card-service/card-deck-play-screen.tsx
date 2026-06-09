import { CARD_STUDY_MODES } from "@yeon/api-contract/card-decks";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import {
  YeonFormStack as FormStack,
  YeonMobileHeaderBar as MobileHeaderBar,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
} from "@yeon/ui/native";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";

import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getModeBadge } from "./card-deck-play-helpers";
import {
  CardDeckFlashcardPanel,
  CardDeckPlayModeControl,
  CardDeckReviewModePanel,
} from "./card-deck-play-mode-panels";
import { useCardDeckPlayState } from "./use-card-deck-play-state";

const CARD_SERVICE_ROUTE = YEON_ROUTE_TEMPLATES.cardHome as Href;
// Universal UI parity trace: useCardDeckPlayState 내부에서
// createMobileCardItemRepository, deriveCardDeckPlayViewState를 사용한다.

interface CardDeckPlayScreenProps {
  deckId?: string;
}

export function CardDeckPlayScreen({ deckId }: CardDeckPlayScreenProps) {
  const router = useRouter();
  const play = useCardDeckPlayState({ deckId });

  if (play.isBooting) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen contentVariant="play" safeAreaEdges={["top"]} scroll={false}>
      <FormStack fill gap="roomy">
        <MobileHeaderBar
          leftAccessibilityLabel={CARD_SERVICE_TEXT.shared.backLabel}
          leftLabel={CARD_SERVICE_TEXT.play.headerBackLabel}
          onLeftPress={() => router.back()}
          rightAccessibilityLabel={
            play.isReviewModeReady
              ? CARD_SERVICE_TEXT.play.reviewSkipLabel
              : CARD_SERVICE_TEXT.play.homeLabel
          }
          rightLabel={
            play.isReviewModeReady
              ? CARD_SERVICE_TEXT.play.reviewSkipLabel
              : CARD_SERVICE_TEXT.play.homeLabel
          }
          onRightPress={() =>
            play.isReviewModeReady
              ? play.handleSkipReview()
              : router.replace(CARD_SERVICE_ROUTE)
          }
          subtitle={
            play.detail
              ? `${play.currentIndex + 1} / ${play.detail.items.length} · ${getModeBadge(play.mode)}`
              : getModeBadge(play.mode)
          }
          title={
            play.detail?.deck.title ?? CARD_SERVICE_TEXT.play.titleFallback
          }
        />

        {play.playState.kind === "loading" ? (
          <StateBlock
            loading
            message={CARD_SERVICE_TEXT.state.loading}
            title={CARD_SERVICE_TEXT.state.loadingTitle}
          />
        ) : play.playState.kind === "error" ? (
          <StateBlock
            message={play.playState.message}
            title={CARD_SERVICE_TEXT.state.errorTitle}
          />
        ) : !play.currentCard ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.play.emptyMessage}
            title={CARD_SERVICE_TEXT.play.emptyTitle}
          />
        ) : (
          <>
            <CardDeckPlayModeControl
              onChange={play.handleStudyModeChange}
              value={play.studyMode}
            />

            {play.studyMode === CARD_STUDY_MODES.review ? (
              <CardDeckReviewModePanel
                currentCard={play.currentCard}
                isAnswerVisible={play.isReviewAnswerVisible}
                isPending={play.isReviewSaving}
                onRevealAnswer={play.revealReviewAnswer}
                onReview={play.handleReview}
              />
            ) : (
              <CardDeckFlashcardPanel
                canMoveNext={play.canMoveNext}
                canMovePrev={play.canMovePrev}
                currentCard={play.currentCard}
                isAnswerVisible={play.isAnswerVisible}
                onFlip={play.toggleAnswer}
                onNext={play.moveNext}
                onPrev={play.movePrev}
              />
            )}
          </>
        )}
      </FormStack>
    </MobileScreen>
  );
}
