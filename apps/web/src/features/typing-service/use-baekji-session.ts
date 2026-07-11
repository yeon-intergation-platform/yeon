"use client";

import type {
  CardDeckItemDto,
  CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import type { RecallGradeResponse } from "@yeon/api-contract/recall";
import {
  createCardRecallSessionIdentity,
  createRecallIdempotencyKey,
  partitionCardDeckItemsForRecall,
  shouldApplyCardRecallResponse,
  summarizeCardRecallCompletions,
  useYeonCardItemRepository,
  useYeonCardRecallRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import { useYeonMutation as useMutation } from "@yeon/ui/runtime/YeonQuery";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCardServiceAuth } from "../card-service/auth-context";
import { useDeckDetail } from "../card-service/hooks/use-deck-detail";

export const BAEKJI_SESSION_PHASES = {
  writing: "writing",
  revealed: "revealed",
  summary: "summary",
} as const;

export type BaekjiSessionPhase =
  (typeof BAEKJI_SESSION_PHASES)[keyof typeof BAEKJI_SESSION_PHASES];

const EMPTY_CARDS: readonly CardDeckItemDto[] = [];

type Completion = { score: number | null };

export function useBaekjiSession(deckId: string | null) {
  const { isAuthenticated } = useCardServiceAuth();
  const recallRepository = useYeonCardRecallRepository();
  const itemRepository = useYeonCardItemRepository();
  const detailQuery = useDeckDetail(deckId ?? "");
  const [phase, setPhase] = useState<BaekjiSessionPhase>(
    BAEKJI_SESSION_PHASES.writing
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradeResult, setGradeResult] = useState<RecallGradeResponse | null>(
    null
  );
  const [guestDifficulty, setGuestDifficulty] =
    useState<CardReviewDifficulty | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(
    createRecallIdempotencyKey
  );
  const [completionByCard, setCompletionByCard] = useState<
    Record<string, Completion>
  >({});

  const allCards = detailQuery.data?.items ?? EMPTY_CARDS;
  const cards = useMemo(
    () => partitionCardDeckItemsForRecall(allCards).eligibleItems,
    [allCards]
  );
  const currentCard = cards[cardIndex] ?? null;
  const sessionIdentity = useMemo(
    () => createCardRecallSessionIdentity(deckId, cards),
    [cards, deckId]
  );
  const sessionIdentityRef = useRef(sessionIdentity);
  sessionIdentityRef.current = sessionIdentity;

  const gradeMutation = useMutation({
    mutationFn: async (input: {
      answer: string;
      cardId: string;
      deckId: string;
      requestKey: string;
    }) => {
      return recallRepository.createAttempt(input.deckId, input.cardId, {
        userAnswer: input.answer,
        idempotencyKey: input.requestKey,
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
    setPhase(BAEKJI_SESSION_PHASES.writing);
    setCardIndex(0);
    setUserAnswer("");
    setGradeResult(null);
    setGuestDifficulty(null);
    setIdempotencyKey(createRecallIdempotencyKey());
    setCompletionByCard({});
    mutationResetRef.current.grade();
    mutationResetRef.current.guest();
  }, [sessionIdentity]);

  const summary = useMemo(
    () => summarizeCardRecallCompletions(completionByCard),
    [completionByCard]
  );

  function resetForAttempt() {
    setUserAnswer("");
    setGradeResult(null);
    setGuestDifficulty(null);
    setIdempotencyKey(createRecallIdempotencyKey());
    gradeMutation.reset();
    guestReviewMutation.reset();
    setPhase(BAEKJI_SESSION_PHASES.writing);
  }

  function updateUserAnswer(value: string) {
    if (gradeMutation.isPending) return;
    if (gradeMutation.isError) {
      setIdempotencyKey(createRecallIdempotencyKey());
      gradeMutation.reset();
    }
    setUserAnswer(value);
  }

  async function gradeAnswer() {
    const answer = userAnswer.trim();
    const card = currentCard;
    const submittedDeckId = deckId;
    if (
      !isAuthenticated ||
      !card ||
      !submittedDeckId ||
      !answer ||
      gradeMutation.isPending
    ) {
      return;
    }
    const submittedSessionIdentity = sessionIdentityRef.current;
    try {
      const result = await gradeMutation.mutateAsync({
        answer,
        cardId: card.id,
        deckId: submittedDeckId,
        requestKey: idempotencyKey,
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
      setCompletionByCard((previous) => ({
        ...previous,
        [card.id]: { score: result.score },
      }));
      setPhase(BAEKJI_SESSION_PHASES.revealed);
    } catch {
      // Mutation error state renders the retryable failure. The request key stays stable.
    }
  }

  function revealGuestAnswer() {
    if (!isAuthenticated && currentCard && userAnswer.trim()) {
      setPhase(BAEKJI_SESSION_PHASES.revealed);
    }
  }

  async function reviewGuestAnswer(difficulty: CardReviewDifficulty) {
    const card = currentCard;
    const submittedDeckId = deckId;
    if (
      isAuthenticated ||
      !card ||
      !submittedDeckId ||
      guestReviewMutation.isPending
    ) {
      return;
    }
    const submittedSessionIdentity = sessionIdentityRef.current;
    try {
      await guestReviewMutation.mutateAsync({
        cardId: card.id,
        deckId: submittedDeckId,
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
      setCompletionByCard((previous) => ({
        ...previous,
        [card.id]: { score: null },
      }));
    } catch {
      // Mutation error state keeps the revealed answer and lets the user retry.
    }
  }

  function nextCard() {
    if (!isAuthenticated && !guestDifficulty) return;
    if (cardIndex >= cards.length - 1) {
      setPhase(BAEKJI_SESSION_PHASES.summary);
      return;
    }
    setCardIndex((index) => index + 1);
    resetForAttempt();
  }

  return {
    cards,
    cardIndex,
    currentCard,
    detailQuery,
    gradeAnswer,
    gradeMutation,
    gradeResult,
    guestDifficulty,
    guestReviewMutation,
    isAuthenticated,
    nextCard,
    phase,
    resetForAttempt,
    revealGuestAnswer,
    reviewGuestAnswer,
    updateUserAnswer,
    summary,
    userAnswer,
  };
}

export type BaekjiSessionState = ReturnType<typeof useBaekjiSession>;
