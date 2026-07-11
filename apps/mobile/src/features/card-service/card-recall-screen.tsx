import {
  CARD_REVIEW_DIFFICULTIES,
  CARD_TEXT_MAX_LENGTH,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import {
  RECALL_GRADE_VERDICTS,
  type RecallGradeResponse,
} from "@yeon/api-contract/recall";
import {
  createRecallIdempotencyKey,
  partitionCardDeckItemsForRecall,
} from "@yeon/ui/runtime/ports/card-deck";
import {
  YeonActionButton as ActionButton,
  YeonFormStack as FormStack,
  YeonMobileHeaderBar as MobileHeaderBar,
  YeonMobileScreen as MobileScreen,
  YeonSectionCard as SectionCard,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  useYeonMutation as useMutation,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { createMobileCardItemRepository } from "./runtime-adapters/card-item-repository";
import { createMobileCardRecallRepository } from "./runtime-adapters/card-recall-repository";
import { CardMarkdown } from "./card-markdown";
import {
  createCardRecallSessionIdentity,
  shouldApplyCardRecallResponse,
  summarizeCardRecallCompletions,
  type CardRecallCompletionByCardId,
} from "./card-recall-session-state";
import { CARD_SERVICE_MODE } from "./card-service-session";
import { useCardDeckDetailQuery } from "./use-card-deck-detail-query";
import { useCardServiceResolvedSession } from "./use-card-service-resolved-session";

const PHASES = {
  writing: "writing",
  revealed: "revealed",
  summary: "summary",
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export function CardRecallScreen({ deckId }: { deckId?: string }) {
  const router = useRouter();
  const { isBooting, mode, sessionToken } = useCardServiceResolvedSession();
  const isAuthenticated =
    mode === CARD_SERVICE_MODE.server && Boolean(sessionToken);
  const itemRepository = useMemo(
    () =>
      createMobileCardItemRepository({
        isSignedIn: isAuthenticated,
        sessionToken,
      }),
    [isAuthenticated, sessionToken]
  );
  const recallRepository = useMemo(
    () =>
      sessionToken ? createMobileCardRecallRepository(sessionToken) : null,
    [sessionToken]
  );
  const { detail, detailState, listItems } = useCardDeckDetailQuery({
    deckId,
    isBooting,
    isServerMode: isAuthenticated,
    itemRepository,
  });
  const [phase, setPhase] = useState<Phase>(PHASES.writing);
  const [cardIndex, setCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradeResult, setGradeResult] = useState<RecallGradeResponse | null>(
    null
  );
  const [guestDifficulty, setGuestDifficulty] =
    useState<CardReviewDifficulty | null>(null);
  const [requestKey, setRequestKey] = useState(createRecallIdempotencyKey);
  const [completionByCardId, setCompletionByCardId] =
    useState<CardRecallCompletionByCardId>({});
  const recallItems = useMemo(
    () => partitionCardDeckItemsForRecall(listItems).eligibleItems,
    [listItems]
  );
  const currentCard = recallItems[cardIndex] ?? null;
  const sessionIdentity = useMemo(
    () => createCardRecallSessionIdentity(deckId, recallItems),
    [deckId, recallItems]
  );
  const sessionIdentityRef = useRef(sessionIdentity);
  sessionIdentityRef.current = sessionIdentity;

  const gradeMutation = useMutation({
    mutationFn: async (input: {
      answer: string;
      cardId: string;
      deckId: string;
      idempotencyKey: string;
    }) => {
      if (!recallRepository) {
        throw new Error("채점할 카드를 찾을 수 없습니다.");
      }
      return recallRepository.createAttempt(input.deckId, input.cardId, {
        idempotencyKey: input.idempotencyKey,
        userAnswer: input.answer,
      });
    },
  });
  const guestReviewMutation = useMutation({
    mutationFn: async (input: {
      cardId: string;
      deckId: string;
      difficulty: CardReviewDifficulty;
    }) => {
      return itemRepository.reviewCard(
        input.deckId,
        input.cardId,
        input.difficulty
      );
    },
  });
  const mutationResetRef = useRef({
    grade: gradeMutation.reset,
    guest: guestReviewMutation.reset,
  });
  mutationResetRef.current = {
    grade: gradeMutation.reset,
    guest: guestReviewMutation.reset,
  };

  useEffect(() => {
    setPhase(PHASES.writing);
    setCardIndex(0);
    setUserAnswer("");
    setGradeResult(null);
    setGuestDifficulty(null);
    setRequestKey(createRecallIdempotencyKey());
    setCompletionByCardId({});
    mutationResetRef.current.grade();
    mutationResetRef.current.guest();
  }, [sessionIdentity]);

  const summary = useMemo(
    () => summarizeCardRecallCompletions(completionByCardId),
    [completionByCardId]
  );

  async function submitAnswer() {
    const answer = userAnswer.trim();
    const card = currentCard;
    if (!answer || !card || !deckId) return;
    if (!isAuthenticated) {
      setPhase(PHASES.revealed);
      return;
    }
    const submittedSessionIdentity = sessionIdentityRef.current;
    try {
      const result = await gradeMutation.mutateAsync({
        answer,
        cardId: card.id,
        deckId,
        idempotencyKey: requestKey,
      });
      if (
        !shouldApplyCardRecallResponse(
          submittedSessionIdentity,
          sessionIdentityRef.current
        )
      ) {
        return;
      }
      setGradeResult(result);
      setCompletionByCardId((previous) => ({
        ...previous,
        [card.id]: { score: result.score },
      }));
      setPhase(PHASES.revealed);
    } catch {
      // Stable requestKey makes retry idempotent.
    }
  }

  function updateUserAnswer(value: string) {
    if (gradeMutation.isPending) return;
    if (gradeMutation.isError) {
      setRequestKey(createRecallIdempotencyKey());
      gradeMutation.reset();
    }
    setUserAnswer(value);
  }

  async function reviewGuest(difficulty: CardReviewDifficulty) {
    const card = currentCard;
    if (!card || !deckId) return;
    const submittedSessionIdentity = sessionIdentityRef.current;
    try {
      await guestReviewMutation.mutateAsync({
        cardId: card.id,
        deckId,
        difficulty,
      });
      if (
        !shouldApplyCardRecallResponse(
          submittedSessionIdentity,
          sessionIdentityRef.current
        )
      ) {
        return;
      }
      setGuestDifficulty(difficulty);
      setCompletionByCardId((previous) => ({
        ...previous,
        [card.id]: { score: null },
      }));
    } catch {
      // Keep answer visible so the same local review can be retried.
    }
  }

  function resetAttempt() {
    setUserAnswer("");
    setGradeResult(null);
    setGuestDifficulty(null);
    setRequestKey(createRecallIdempotencyKey());
    gradeMutation.reset();
    guestReviewMutation.reset();
    setPhase(PHASES.writing);
  }

  function nextCard() {
    if (!isAuthenticated && !guestDifficulty) return;
    if (cardIndex >= recallItems.length - 1) {
      setPhase(PHASES.summary);
      return;
    }
    setCardIndex((index) => index + 1);
    resetAttempt();
  }

  if (isBooting || detailState.kind === "loading") {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          loading
          title="백지 복습 준비 중"
          message="카드를 불러오고 있습니다."
        />
      </MobileScreen>
    );
  }
  if (detailState.kind === "error" || !deckId) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          title="카드를 불러오지 못했어요"
          message="덱 화면으로 돌아가 다시 시도해 주세요."
        />
      </MobileScreen>
    );
  }
  if (detailState.kind === "ready" && detailState.isEmpty) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          title="학습할 카드가 없어요"
          message="덱에 질문과 답 카드를 먼저 추가해 주세요."
        />
      </MobileScreen>
    );
  }
  if (detailState.kind === "ready" && recallItems.length === 0) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          title="백지로 학습할 카드가 없어요"
          message="질문과 답이 모두 있는 카드를 덱에 추가해 주세요."
        />
      </MobileScreen>
    );
  }
  if (phase === PHASES.summary) {
    return (
      <MobileScreen contentVariant="card">
        <FormStack gap="roomy">
          <MobileHeaderBar
            leftLabel="← 덱으로"
            onLeftPress={() => router.back()}
            title="백지 복습 완료"
          />
          <SectionCard>
            <YeonText style={{ fontSize: 28, fontWeight: "800" }}>
              {summary.solvedCount}장 완료
            </YeonText>
            <YeonText style={{ fontSize: 14, lineHeight: 20 }}>
              질문을 보고 기억에서 꺼낸 카드 수입니다.
            </YeonText>
            <YeonText style={{ fontSize: 18, fontWeight: "800" }}>
              평균 점수:{" "}
              {summary.averageScore === null
                ? "직접 평가 완료"
                : `${summary.averageScore}%`}
            </YeonText>
          </SectionCard>
          <ActionButton
            label="덱으로 돌아가기"
            onPress={() => router.back()}
            variant="dark"
          />
        </FormStack>
      </MobileScreen>
    );
  }

  const isRevealed = phase === PHASES.revealed;
  return (
    <MobileScreen contentVariant="card">
      <FormStack gap="roomy">
        <MobileHeaderBar
          leftLabel="← 덱으로"
          onLeftPress={() => router.back()}
          subtitle={`${cardIndex + 1} / ${recallItems.length} · ${isAuthenticated ? "AI 채점" : "직접 평가"}`}
          title={detail?.deck.title ?? "백지 복습"}
        />
        <SectionCard>
          <FormStack>
            <YeonText style={{ fontSize: 12, fontWeight: "700" }}>
              질문
            </YeonText>
            {currentCard ? (
              <CardMarkdown source={currentCard.frontText} />
            ) : null}
            {!isRevealed ? (
              <>
                <TextField
                  label="기억나는 답"
                  maxLength={CARD_TEXT_MAX_LENGTH}
                  multiline
                  multilineMinHeight={150}
                  onChangeText={updateUserAnswer}
                  placeholder="답을 보지 않고 기억나는 내용을 적어보세요."
                  showCounter
                  value={userAnswer}
                />
                {gradeMutation.isError ? (
                  <YeonText style={{ color: "#D92D20", fontSize: 13 }}>
                    채점하지 못했습니다. 같은 요청으로 다시 시도해 주세요.
                  </YeonText>
                ) : null}
                <ActionButton
                  disabled={!userAnswer.trim() || gradeMutation.isPending}
                  label={
                    isAuthenticated
                      ? gradeMutation.isPending
                        ? "채점 중..."
                        : "채점하기"
                      : "정답 보기"
                  }
                  onPress={() => void submitAnswer()}
                  variant="dark"
                />
              </>
            ) : (
              <>
                {gradeResult ? (
                  <FormStack gap="compact">
                    <YeonText style={{ fontSize: 34, fontWeight: "900" }}>
                      {gradeResult.score}% ·{" "}
                      {gradeResult.verdict === RECALL_GRADE_VERDICTS.pass
                        ? "통과"
                        : "다시"}
                    </YeonText>
                    {gradeResult.feedback ? (
                      <YeonText>{gradeResult.feedback}</YeonText>
                    ) : null}
                    {gradeResult.missedPoints.length > 0 ? (
                      <YeonView style={{ gap: 4 }}>
                        <YeonText style={{ fontSize: 13, fontWeight: "800" }}>
                          놓친 핵심
                        </YeonText>
                        {gradeResult.missedPoints.map((point, index) => (
                          <YeonText
                            key={`${point}-${index}`}
                            style={{ fontSize: 14, lineHeight: 20 }}
                          >
                            • {point}
                          </YeonText>
                        ))}
                      </YeonView>
                    ) : null}
                  </FormStack>
                ) : null}
                <YeonView style={{ gap: 8 }}>
                  <YeonText style={{ fontSize: 12, fontWeight: "700" }}>
                    정답
                  </YeonText>
                  {currentCard ? (
                    <CardMarkdown source={currentCard.backText} />
                  ) : null}
                </YeonView>
                {!isAuthenticated ? (
                  <FormStack gap="compact">
                    <YeonText style={{ fontSize: 13 }}>
                      정답과 비교해 기억 난 정도를 선택하세요.
                    </YeonText>
                    {[
                      [CARD_REVIEW_DIFFICULTIES.hard, "거의 못 기억함"],
                      [CARD_REVIEW_DIFFICULTIES.good, "대부분 기억함"],
                      [CARD_REVIEW_DIFFICULTIES.easy, "정확히 기억함"],
                    ].map(([difficulty, label]) => (
                      <ActionButton
                        key={difficulty}
                        disabled={guestReviewMutation.isPending}
                        label={label}
                        onPress={() =>
                          void reviewGuest(difficulty as CardReviewDifficulty)
                        }
                        variant={
                          guestDifficulty === difficulty ? "dark" : "secondary"
                        }
                      />
                    ))}
                    {guestReviewMutation.isError ? (
                      <YeonText style={{ color: "#D92D20", fontSize: 13 }}>
                        복습 결과를 저장하지 못했습니다.
                      </YeonText>
                    ) : null}
                  </FormStack>
                ) : null}
                <ActionButton
                  disabled={!isAuthenticated && !guestDifficulty}
                  label="다음 카드"
                  onPress={nextCard}
                  variant="dark"
                />
                {isAuthenticated ? (
                  <ActionButton
                    label="다시 쓰기"
                    onPress={resetAttempt}
                    variant="secondary"
                  />
                ) : null}
              </>
            )}
          </FormStack>
        </SectionCard>
      </FormStack>
    </MobileScreen>
  );
}
