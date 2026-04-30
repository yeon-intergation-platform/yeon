import { ApiClientError } from "@yeon/api-client";
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

import { ActionButton } from "../../components/ui/action-button";
import { StateBlock } from "../../components/ui/state-block";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import {
  clearPrimaryAuthSessionToken,
  readPrimaryAuthSessionToken,
} from "../../services/primary-auth/storage";
import { colors } from "../../theme/colors";

const CARD_SERVICE_ROUTE = "/card-service" as Href;

interface CardDeckPlayScreenProps {
  deckId?: string;
}

export function CardDeckPlayScreen({ deckId }: CardDeckPlayScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<
    "booting" | "signed_out" | "signed_in"
  >("booting");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [studyMode, setStudyMode] = useState<CardStudyMode>(
    CARD_STUDY_MODES.flashcard,
  );

  const detailQuery = useQuery({
    enabled:
      authStatus === "signed_in" && Boolean(sessionToken) && Boolean(deckId),
    queryFn: async () =>
      cardServiceApi.getCardDeckDetail(deckId!, sessionToken!),
    queryKey: deckId
      ? cardServiceQueryKeys.deck(deckId, sessionToken)
      : ["card-service", "deck", "missing"],
  });

  const studyModeMutation = useMutation({
    mutationFn: async (nextMode: CardStudyMode) => {
      if (!sessionToken) {
        throw new Error("로그인이 필요합니다.");
      }
      return cardServiceApi.updateCardStudyPreference(
        { studyMode: nextMode },
        sessionToken,
      );
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (params: {
      difficulty: CardReviewDifficulty;
      itemId: string;
    }) => {
      if (!deckId || !sessionToken) {
        throw new Error("로그인이 필요합니다.");
      }
      return cardServiceApi.reviewCardDeckItem(
        deckId,
        params.itemId,
        { difficulty: params.difficulty },
        sessionToken,
      );
    },
    onSuccess: async () => {
      if (deckId) {
        await queryClient.invalidateQueries({
          queryKey: cardServiceQueryKeys.deck(deckId, sessionToken),
        });
      }
      moveNext();
    },
  });

  useEffect(() => {
    void bootstrapAuth();
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

  async function bootstrapAuth() {
    try {
      const storedToken = await readPrimaryAuthSessionToken();
      if (!storedToken) {
        setAuthStatus("signed_out");
        return;
      }

      const response = await cardServiceApi.getAuthSession(storedToken);
      if (!response.authenticated) {
        await clearPrimaryAuthSessionToken();
        setSessionToken(null);
        setAuthStatus("signed_out");
        return;
      }

      setSessionToken(storedToken);
      setAuthStatus("signed_in");
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 403)
      ) {
        await clearPrimaryAuthSessionToken();
      }
      setSessionToken(null);
      setAuthStatus("signed_out");
    }
  }

  function moveNext() {
    if (!detailQuery.data || detailQuery.data.items.length === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % detailQuery.data.items.length);
    setAnswerVisible(false);
  }

  function movePrev() {
    if (!detailQuery.data || detailQuery.data.items.length === 0) {
      return;
    }
    setCurrentIndex((prev) =>
      prev === 0 ? detailQuery.data.items.length - 1 : prev - 1,
    );
    setAnswerVisible(false);
  }

  const currentCard = detailQuery.data?.items[currentIndex] ?? null;

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

  if (authStatus === "booting") {
    return (
      <View style={[styles.screen, styles.center]}>
        <StateBlock loading message="세션을 확인하고 있습니다." title="로딩" />
      </View>
    );
  }

  if (authStatus === "signed_out") {
    return (
      <View style={[styles.screen, styles.center]}>
        <StateBlock
          message="카드 서비스를 먼저 로그인한 뒤 다시 열어주세요."
          title="로그인이 필요합니다"
        />
        <ActionButton
          label="카드 서비스로 이동"
          onPress={() => router.replace(CARD_SERVICE_ROUTE)}
        />
      </View>
    );
  }

  const detail = detailQuery.data;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>←</Text>
          </Pressable>
          <View style={styles.titleBox}>
            <Text numberOfLines={1} style={styles.title}>
              {detail?.deck.title ?? "학습"}
            </Text>
            <Text style={styles.subtitle}>
              {detail ? `${currentIndex + 1} / ${detail.items.length}` : ""}
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {detailQuery.isPending ? (
          <StateBlock
            loading
            message="학습 카드를 불러오는 중입니다."
            title="로딩"
          />
        ) : detailQuery.isError ? (
          <StateBlock
            message={
              detailQuery.error instanceof Error
                ? detailQuery.error.message
                : "학습 카드를 불러오지 못했습니다."
            }
            title="오류"
          />
        ) : !currentCard ? (
          <StateBlock message="학습할 카드가 없습니다." title="빈 덱" />
        ) : (
          <>
            <View style={styles.modeTabs}>
              <Pressable
                accessibilityRole="button"
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
                  플래시카드
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
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
                  복습 모드
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
                  onPress={() => setAnswerVisible((prev) => !prev)}
                  style={styles.studyCard}
                >
                  <Text style={styles.cardLabel}>
                    {isAnswerVisible ? "답변" : "질문"}
                  </Text>
                  <ScrollView contentContainerStyle={styles.cardScrollContent}>
                    <Text style={styles.cardText}>
                      {isAnswerVisible
                        ? currentCard.backText
                        : currentCard.frontText}
                    </Text>
                  </ScrollView>
                  <Text style={styles.cardHint}>
                    탭해서 {isAnswerVisible ? "질문" : "답변"} 보기
                  </Text>
                </Pressable>

                <View style={styles.controls}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={movePrev}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>이전</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={moveNext}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>다음 카드</Text>
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
        <Text style={styles.cardLabel}>문제</Text>
        <Text style={styles.reviewQuestion}>{frontText}</Text>
        <Text style={[styles.cardLabel, styles.reviewAnswerLabel]}>정답</Text>
        <Text style={styles.reviewAnswer}>{backText}</Text>
      </ScrollView>
      <View style={styles.reviewButtons}>
        <ReviewButton
          disabled={isSaving}
          label="어려움 · 1일 후"
          onPress={() => onReview(CARD_REVIEW_DIFFICULTIES.hard)}
          tone="hard"
        />
        <ReviewButton
          disabled={isSaving}
          label="좋음 · 3일 후"
          onPress={() => onReview(CARD_REVIEW_DIFFICULTIES.good)}
          tone="good"
        />
        <ReviewButton
          disabled={isSaving}
          label="쉬움 · 4일 후"
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
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.reviewButton,
        styles[`reviewButton_${tone}`],
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={styles.reviewButtonText}>
        {disabled ? "저장 중..." : label}
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
    fontSize: 32,
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
    minHeight: 58,
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
    fontSize: 18,
    lineHeight: 28,
    marginTop: 10,
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
    backgroundColor: "#ff6b45",
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
    fontSize: 18,
    lineHeight: 28,
    marginTop: 10,
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
    minHeight: 58,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  studyCard: {
    borderColor: colors.borderStrong,
    borderRadius: 24,
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
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
  },
});
