import {
  CARD_REVIEW_DIFFICULTIES,
  CARD_STUDY_MODES,
  type CardReviewDifficulty,
  type CardStudyMode,
} from "@yeon/api-contract/card-decks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StateBlock } from "../../components/ui/state-block";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import {
  getGuestCardStudyMode,
  getGuestDeckDetail,
  reviewGuestCard,
  setGuestCardStudyMode,
} from "../../services/card-service/storage";
import { colors } from "../../theme/colors";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";

const CARD_SERVICE_ROUTE = "/card-service" as Href;

interface CardDeckPlayScreenProps {
  deckId?: string;
}

function getModeBadge(mode: CardServiceMode): string {
  return mode === CARD_SERVICE_MODE.server
    ? CARD_SERVICE_TEXT.play.modeAuthenticatedLabel
    : CARD_SERVICE_TEXT.play.modeGuestLabel;
}

export function CardDeckPlayScreen({ deckId }: CardDeckPlayScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [studyMode, setStudyMode] = useState<CardStudyMode>(
    CARD_STUDY_MODES.flashcard
  );

  const detailQuery = useQuery({
    enabled: !isBooting && Boolean(deckId),
    queryFn: async () => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }

      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.getCardDeckDetail(deckId, sessionToken);
      }

      const guestDetail = await getGuestDeckDetail(deckId);
      if (!guestDetail) {
        throw new Error(CARD_SERVICE_TEXT.shared.notFoundMessage);
      }
      const studyMode = await getGuestCardStudyMode();
      return {
        ...guestDetail,
        studyMode,
      };
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deck(deckId, mode === CARD_SERVICE_MODE.server)
      : ["card-service", "deck", "missing", mode],
  });

  const studyModeMutation = useMutation({
    mutationFn: async (nextMode: CardStudyMode) => {
      if (!detailQuery.data || mode === CARD_SERVICE_MODE.guest) {
        await setGuestCardStudyMode(nextMode);
        return { studyMode: nextMode };
      }
      if (!sessionToken) {
        throw new Error(CARD_SERVICE_TEXT.detail.loginRequiredMessage);
      }
      return cardServiceApi.updateCardStudyPreference(
        { studyMode: nextMode },
        sessionToken
      );
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (params: {
      difficulty: CardReviewDifficulty;
      itemId: string;
    }) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.reviewCardDeckItem(
          deckId,
          params.itemId,
          { difficulty: params.difficulty },
          sessionToken
        );
      }

      return reviewGuestCard(params.itemId, params.difficulty);
    },
    onSuccess: async () => {
      if (deckId) {
        await queryClient.invalidateQueries({
          queryKey: cardServiceQueryKeys.deck(
            deckId,
            mode === CARD_SERVICE_MODE.server
          ),
        });
      }
      setCurrentIndex(0);
      setAnswerVisible(false);
    },
  });

  useEffect(() => {
    void bootstrapSession();
  }, []);

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }
    setStudyMode(detailQuery.data.studyMode);
    if (currentIndex >= detailQuery.data.items.length) {
      setCurrentIndex(0);
      setAnswerVisible(false);
    }
  }, [currentIndex, detailQuery.data]);

  async function bootstrapSession() {
    setBooting(true);
    const resolved = await resolveCardServiceSession();
    setMode(resolved.mode);
    setSessionToken(resolved.sessionToken);
    setBooting(false);
  }

  function moveNext() {
    if (!detailQuery.data || detailQuery.data.items.length === 0) {
      return;
    }
    if (currentIndex + 1 >= detailQuery.data.items.length) {
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setAnswerVisible(false);
  }

  function movePrev() {
    if (!detailQuery.data || detailQuery.data.items.length === 0) {
      return;
    }
    if (currentIndex <= 0) {
      return;
    }
    setCurrentIndex((prev) => prev - 1);
    setAnswerVisible(false);
  }

  const currentCard = detailQuery.data?.items[currentIndex] ?? null;
  const detail = detailQuery.data;
  const canMovePrev = currentIndex > 0;
  const canMoveNext = detail ? currentIndex < detail.items.length - 1 : false;

  function handleStudyModeChange(nextMode: CardStudyMode) {
    setStudyMode(nextMode);
    studyModeMutation.mutate(nextMode);
  }

  function handleReview(difficulty: CardReviewDifficulty) {
    if (!currentCard) {
      return;
    }
    reviewMutation.mutate({ difficulty, itemId: currentCard.id });
  }

  if (isBooting) {
    return (
      <View style={[styles.screen, styles.center]}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CARD_SERVICE_TEXT.shared.backLabel}
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>
              {CARD_SERVICE_TEXT.play.headerBackLabel}
            </Text>
          </Pressable>
          <View style={styles.titleBox}>
            <Text numberOfLines={1} style={styles.title}>
              {detail?.deck.title ?? CARD_SERVICE_TEXT.play.titleFallback}
            </Text>
            <Text style={styles.subtitle}>
              {detail ? `${currentIndex + 1} / ${detail.items.length}` : ""}
            </Text>
            <Text style={styles.subtitle}>{getModeBadge(mode)}</Text>
          </View>
          <Pressable
            accessibilityLabel={CARD_SERVICE_TEXT.play.homeLabel}
            accessibilityRole="button"
            onPress={() => router.replace(CARD_SERVICE_ROUTE)}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>
              {CARD_SERVICE_TEXT.play.homeLabel}
            </Text>
          </Pressable>
        </View>

        {detailQuery.isPending ? (
          <StateBlock
            loading
            message={CARD_SERVICE_TEXT.state.loading}
            title={CARD_SERVICE_TEXT.state.loadingTitle}
          />
        ) : detailQuery.isError ? (
          <StateBlock
            message={
              detailQuery.error instanceof Error
                ? detailQuery.error.message
                : CARD_SERVICE_TEXT.play.errorMessage
            }
            title={CARD_SERVICE_TEXT.state.errorTitle}
          />
        ) : !currentCard ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.play.emptyMessage}
            title={CARD_SERVICE_TEXT.play.emptyTitle}
          />
        ) : (
          <>
            <View style={styles.modeTabs}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  CARD_SERVICE_TEXT.play.studyModeFlashcardLabel
                }
                onPress={() =>
                  handleStudyModeChange(CARD_STUDY_MODES.flashcard)
                }
                style={[
                  styles.modeTab,
                  studyMode === CARD_STUDY_MODES.flashcard &&
                    styles.modeTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    studyMode === CARD_STUDY_MODES.flashcard &&
                      styles.modeTabTextActive,
                  ]}
                >
                  {CARD_SERVICE_TEXT.play.studyModeFlashcardLabel}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={CARD_SERVICE_TEXT.play.studyModeReviewLabel}
                onPress={() => handleStudyModeChange(CARD_STUDY_MODES.review)}
                style={[
                  styles.modeTab,
                  studyMode === CARD_STUDY_MODES.review && styles.modeTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    studyMode === CARD_STUDY_MODES.review &&
                      styles.modeTabTextActive,
                  ]}
                >
                  {CARD_SERVICE_TEXT.play.studyModeReviewLabel}
                </Text>
              </Pressable>
            </View>

            {studyMode === CARD_STUDY_MODES.review ? (
              <ReviewModeCard
                isSaving={reviewMutation.isPending}
                onReview={handleReview}
                backText={currentCard.backText}
                frontText={currentCard.frontText}
              />
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isAnswerVisible
                      ? CARD_SERVICE_TEXT.play.flipQuestionLabel
                      : CARD_SERVICE_TEXT.play.flipAnswerLabel
                  }
                  onPress={() => setAnswerVisible((prev) => !prev)}
                  style={styles.studyCard}
                >
                  <Text style={styles.cardLabel}>
                    {isAnswerVisible
                      ? CARD_SERVICE_TEXT.play.flipAnswerLabel
                      : CARD_SERVICE_TEXT.play.flipQuestionLabel}
                  </Text>
                  <ScrollView contentContainerStyle={styles.cardScrollContent}>
                    <Text style={styles.cardText}>
                      {isAnswerVisible
                        ? currentCard.backText
                        : currentCard.frontText}
                    </Text>
                  </ScrollView>
                  <Text style={styles.cardHint}>
                    {CARD_SERVICE_TEXT.play.flipHint}
                    {isAnswerVisible
                      ? CARD_SERVICE_TEXT.play.flipQuestionLabel
                      : CARD_SERVICE_TEXT.play.flipAnswerLabel}
                    {CARD_SERVICE_TEXT.play.flipHintPostfix}
                  </Text>
                </Pressable>

                <View style={styles.controls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={CARD_SERVICE_TEXT.play.prevLabel}
                    onPress={movePrev}
                    disabled={!canMovePrev}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      !canMovePrev && styles.disabledButton,
                      pressed && canMovePrev ? styles.pressedButton : null,
                    ]}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {CARD_SERVICE_TEXT.play.prevLabel}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={CARD_SERVICE_TEXT.play.nextLabel}
                    onPress={moveNext}
                    disabled={!canMoveNext}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      !canMoveNext && styles.disabledButton,
                      pressed && canMoveNext ? styles.pressedButton : null,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {CARD_SERVICE_TEXT.play.nextLabel}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function ReviewModeCard({
  backText,
  frontText,
  isSaving,
  onReview,
}: {
  backText: string;
  frontText: string;
  isSaving: boolean;
  onReview: (difficulty: CardReviewDifficulty) => void;
}) {
  return (
    <View style={styles.reviewCard}>
      <ScrollView contentContainerStyle={styles.reviewScrollContent}>
        <Text style={styles.cardLabel}>
          {CARD_SERVICE_TEXT.play.reviewModeQuestionLabel}
        </Text>
        <Text style={styles.reviewQuestion}>{frontText}</Text>
        <Text style={[styles.cardLabel, styles.reviewAnswerLabel]}>
          {CARD_SERVICE_TEXT.play.reviewModeAnswerLabel}
        </Text>
        <Text style={styles.reviewAnswer}>{backText}</Text>
      </ScrollView>
      <View style={styles.reviewButtons}>
        <ReviewButton
          disabled={isSaving}
          label={CARD_SERVICE_TEXT.play.reviewHardLabel}
          onPress={() => onReview(CARD_REVIEW_DIFFICULTIES.hard)}
          tone="hard"
        />
        <ReviewButton
          disabled={isSaving}
          label={CARD_SERVICE_TEXT.play.reviewGoodLabel}
          onPress={() => onReview(CARD_REVIEW_DIFFICULTIES.good)}
          tone="good"
        />
        <ReviewButton
          disabled={isSaving}
          label={CARD_SERVICE_TEXT.play.reviewEasyLabel}
          onPress={() => onReview(CARD_REVIEW_DIFFICULTIES.easy)}
          tone="easy"
        />
      </View>
    </View>
  );
}

function ReviewButton({
  disabled,
  label,
  onPress,
  tone,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  tone: "hard" | "good" | "easy";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.reviewButton,
        styles[`reviewButton_${tone}`],
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={styles.reviewButtonText}>
        {disabled ? CARD_SERVICE_TEXT.play.reviewSavingLabel : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 18,
    textAlign: "center",
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 34,
    marginTop: 20,
    textAlign: "left",
  },
  center: {
    gap: 14,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  pressedButton: {
    opacity: 0.9,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },
  headerButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "300",
  },
  modeTab: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modeTabActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  modeTabText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  modeTabTextActive: {
    color: colors.white,
  },
  modeTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 14,
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  reviewAnswer: {
    backgroundColor: colors.black,
    borderRadius: 16,
    color: colors.white,
    fontSize: 16,
    lineHeight: 28,
    marginTop: 8,
    padding: 18,
  },
  reviewAnswerLabel: {
    marginTop: 24,
  },
  reviewButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 54,
  },
  reviewButton_easy: {
    backgroundColor: "#49ad4f",
  },
  reviewButton_good: {
    backgroundColor: "#1f8fe5",
  },
  reviewButton_hard: {
    backgroundColor: colors.black,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  reviewButtons: {
    gap: 10,
    marginTop: 14,
  },
  reviewCard: {
    borderColor: colors.borderStrong,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    padding: 18,
  },
  reviewQuestion: {
    backgroundColor: "#FAFAFA",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 28,
    marginTop: 8,
    padding: 18,
  },
  reviewScrollContent: {
    paddingBottom: 8,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  studyCard: {
    borderColor: colors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: 24,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
  },
});
