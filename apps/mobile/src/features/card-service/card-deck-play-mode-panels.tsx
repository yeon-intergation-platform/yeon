import {
  CARD_REVIEW_DIFFICULTIES,
  CARD_STUDY_MODES,
  type CardDeckItemDto,
  type CardReviewDifficulty,
  type CardStudyMode,
} from "@yeon/api-contract/card-decks";
import {
  YeonCardNavigationControls as CardNavigationControls,
  YeonReviewPanel as ReviewPanel,
  YeonSegmentedControl as SegmentedControl,
  YeonStudyCard as StudyCard,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { CardMarkdown } from "./card-markdown";

interface CardDeckPlayModeControlProps {
  onChange: (mode: CardStudyMode) => void;
  value: CardStudyMode;
}

export function CardDeckPlayModeControl({
  onChange,
  value,
}: CardDeckPlayModeControlProps) {
  return (
    <SegmentedControl
      onValueChange={onChange}
      options={[
        {
          label: CARD_SERVICE_TEXT.play.studyModeFlashcardLabel,
          value: CARD_STUDY_MODES.flashcard,
        },
        {
          label: CARD_SERVICE_TEXT.play.studyModeReviewLabel,
          value: CARD_STUDY_MODES.review,
        },
      ]}
      value={value}
    />
  );
}

interface CardDeckReviewModePanelProps {
  currentCard: CardDeckItemDto;
  isPending: boolean;
  isAnswerVisible: boolean;
  onRevealAnswer: () => void;
  onReview: (difficulty: CardReviewDifficulty) => void;
}

export function CardDeckReviewModePanel({
  currentCard,
  isAnswerVisible,
  isPending,
  onRevealAnswer,
  onReview,
}: CardDeckReviewModePanelProps) {
  const savingLabel = CARD_SERVICE_TEXT.play.reviewSavingLabel;
  return (
    <ReviewPanel
      actions={[
        {
          disabled: isPending,
          label: isPending
            ? savingLabel
            : CARD_SERVICE_TEXT.play.reviewHardLabel,
          onPress: () => onReview(CARD_REVIEW_DIFFICULTIES.hard),
          tone: "primary",
        },
        {
          disabled: isPending,
          label: isPending
            ? savingLabel
            : CARD_SERVICE_TEXT.play.reviewGoodLabel,
          onPress: () => onReview(CARD_REVIEW_DIFFICULTIES.good),
        },
        {
          disabled: isPending,
          label: isPending
            ? savingLabel
            : CARD_SERVICE_TEXT.play.reviewEasyLabel,
          onPress: () => onReview(CARD_REVIEW_DIFFICULTIES.easy),
        },
      ]}
      answerLabel={CARD_SERVICE_TEXT.play.reviewModeAnswerLabel}
      answerText={
        <CardMarkdown source={currentCard.backText} tone="inverted" />
      }
      answerVisible={isAnswerVisible}
      onRevealAnswer={onRevealAnswer}
      questionLabel={CARD_SERVICE_TEXT.play.reviewModeQuestionLabel}
      questionText={<CardMarkdown source={currentCard.frontText} />}
      revealActionLabel={CARD_SERVICE_TEXT.play.reviewRevealAnswerLabel}
    />
  );
}

interface CardDeckFlashcardPanelProps {
  canMoveNext: boolean;
  canMovePrev: boolean;
  currentCard: CardDeckItemDto;
  isAnswerVisible: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function CardDeckFlashcardPanel({
  canMoveNext,
  canMovePrev,
  currentCard,
  isAnswerVisible,
  onFlip,
  onNext,
  onPrev,
}: CardDeckFlashcardPanelProps) {
  const nextFaceLabel = isAnswerVisible
    ? CARD_SERVICE_TEXT.play.flipQuestionLabel
    : CARD_SERVICE_TEXT.play.flipAnswerLabel;
  const currentFaceLabel = isAnswerVisible
    ? CARD_SERVICE_TEXT.play.flipAnswerLabel
    : CARD_SERVICE_TEXT.play.flipQuestionLabel;

  return (
    <>
      <StudyCard
        accessibilityLabel={nextFaceLabel}
        body={
          <CardMarkdown
            source={
              isAnswerVisible ? currentCard.backText : currentCard.frontText
            }
          />
        }
        hint={`${CARD_SERVICE_TEXT.play.flipHint}${nextFaceLabel}${CARD_SERVICE_TEXT.play.flipHintPostfix}`}
        label={currentFaceLabel}
        onPress={onFlip}
      />

      <CardNavigationControls
        canMoveNext={canMoveNext}
        canMovePrev={canMovePrev}
        nextLabel={CARD_SERVICE_TEXT.play.nextLabel}
        onNext={onNext}
        onPrev={onPrev}
        prevLabel={CARD_SERVICE_TEXT.play.prevLabel}
      />
    </>
  );
}
