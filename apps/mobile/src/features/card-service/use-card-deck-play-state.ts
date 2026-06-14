import {
  CARD_STUDY_MODES,
  type CardDeckDetailResponse,
  type CardReviewDifficulty,
  type CardStudyMode,
} from "@yeon/api-contract/card-decks";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
} from "@yeon/ui/native";
import {
  deriveCardDeckPlayViewState,
  sortCardDeckItemsForPlay,
} from "@yeon/ui/runtime/ports/card-deck";
import { useEffect, useMemo, useState } from "react";

import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import {
  getGuestCardStudyMode,
  getGuestDeckDetail,
} from "../../services/card-service/storage";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";
import {
  CARD_DECK_PLAY_OPERATION,
  CardDeckPlayInputError,
  requirePlayDeckId,
} from "./card-deck-play-helpers";
import { getCardServiceErrorMessage } from "./error-message";
import { createMobileCardItemRepository } from "./runtime-adapters/card-item-repository";

async function loadGuestCardDeckPlayDetail(
  targetDeckId: string
): Promise<CardDeckDetailResponse> {
  const guestDetail = await getGuestDeckDetail(targetDeckId);
  if (!guestDetail) {
    throw new CardDeckPlayInputError(
      `${CARD_DECK_PLAY_OPERATION.guestDetail}를 실행할 수 없습니다. 비회원 저장소에서 덱을 찾지 못했습니다. deckId=${targetDeckId}`
    );
  }
  const studyMode = await getGuestCardStudyMode();
  return {
    ...guestDetail,
    studyMode,
  };
}

function createCardDeckPlayDetailReader(
  mode: CardServiceMode,
  sessionToken: string | null
): {
  read: (targetDeckId: string) => Promise<CardDeckDetailResponse>;
} {
  if (mode === CARD_SERVICE_MODE.server && sessionToken) {
    return {
      read: (targetDeckId) =>
        cardServiceApi.getCardDeckDetail(targetDeckId, sessionToken),
    };
  }

  return {
    read: loadGuestCardDeckPlayDetail,
  };
}

interface UseCardDeckPlayStateParams {
  deckId?: string;
}

export function useCardDeckPlayState({ deckId }: UseCardDeckPlayStateParams) {
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [isReviewAnswerVisible, setReviewAnswerVisible] = useState(false);
  const [studyMode, setStudyMode] = useState<CardStudyMode>(
    CARD_STUDY_MODES.flashcard
  );

  const detailQuery = useQuery({
    enabled: !isBooting && Boolean(deckId),
    queryFn: async () => {
      const targetDeckId = requirePlayDeckId(
        deckId,
        CARD_DECK_PLAY_OPERATION.detail
      );

      return createCardDeckPlayDetailReader(mode, sessionToken).read(
        targetDeckId
      );
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deckDetail(
          mode === CARD_SERVICE_MODE.server,
          deckId
        )
      : ["card-service", "deck", "missing", mode],
  });

  // 복습 채점·refetch와 무관하게 항상 같은 순서를 보여주도록 web/mobile 공용 SSOT로 안정 정렬한다.
  // (서버 기본 정렬은 next_review_at 기준이라 채점하면 순서가 흔들려 다음 카드가 꼬인다.)
  const playItems = useMemo(
    () =>
      detailQuery.data ? sortCardDeckItemsForPlay(detailQuery.data.items) : [],
    [detailQuery.data]
  );

  // 게스트/서버 분기는 repository 어댑터가 흡수한다(웹과 동일 포트 인터페이스).
  const itemRepository = useMemo(
    () => createMobileCardItemRepository({ mode, sessionToken }),
    [mode, sessionToken]
  );

  const studyModeMutation = useMutation({
    mutationFn: (nextMode: CardStudyMode) =>
      itemRepository.updateStudyPreference(nextMode),
  });

  const reviewMutation = useMutation({
    mutationFn: async (params: {
      difficulty: CardReviewDifficulty;
      itemId: string;
    }) => {
      const targetDeckId = requirePlayDeckId(
        deckId,
        CARD_DECK_PLAY_OPERATION.review
      );
      return itemRepository.reviewCard(
        targetDeckId,
        params.itemId,
        params.difficulty
      );
    },
    // 복습 채점은 스케줄 메타데이터만 바꾸고 표시되지 않는다. play 중 deckDetail refetch는
    // 무거운 카드 본문 재렌더로 flicker를 유발하므로 생략한다(덱 재진입 시 자연 갱신).
    onSuccess: () => {
      moveToNextReviewCard();
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
    if (currentIndex >= playItems.length) {
      resetCurrentCardVisibility();
      setCurrentIndex(0);
    }
  }, [currentIndex, detailQuery.data, playItems.length]);

  async function bootstrapSession() {
    setBooting(true);
    const resolved = await resolveCardServiceSession();
    setMode(resolved.mode);
    setSessionToken(resolved.sessionToken);
    setBooting(false);
  }

  function resetCurrentCardVisibility() {
    setAnswerVisible(false);
    setReviewAnswerVisible(false);
  }

  function moveNext() {
    if (playItems.length === 0) {
      return;
    }
    if (currentIndex + 1 >= playItems.length) {
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    resetCurrentCardVisibility();
  }

  function movePrev() {
    if (playItems.length === 0) {
      return;
    }
    if (currentIndex <= 0) {
      return;
    }
    setCurrentIndex((prev) => prev - 1);
    resetCurrentCardVisibility();
  }

  const currentCard = playItems[currentIndex] ?? null;
  const detail = detailQuery.data;
  // 로딩/에러 분기는 web/mobile 공용 SSOT에서 파생한다(empty는 currentCard 가드 유지).
  const playState = deriveCardDeckPlayViewState(
    {
      isPending: detailQuery.isPending,
      isError: detailQuery.isError,
      data: detailQuery.data,
    },
    {
      errorMessage: getCardServiceErrorMessage(
        detailQuery.error,
        CARD_SERVICE_TEXT.play.errorMessage
      ),
    }
  );
  const canMovePrev = currentIndex > 0;
  const canMoveNext = currentIndex < playItems.length - 1;

  function handleStudyModeChange(nextMode: CardStudyMode) {
    setStudyMode(nextMode);
    setReviewAnswerVisible(false);
    studyModeMutation.mutate(nextMode);
  }

  function moveToNextReviewCard() {
    if (playItems.length === 0) {
      setReviewAnswerVisible(false);
      return;
    }

    setCurrentIndex((prev) => (prev + 1 >= playItems.length ? 0 : prev + 1));
    resetCurrentCardVisibility();
  }

  function handleSkipReview() {
    if (reviewMutation.isPending) {
      return;
    }

    moveToNextReviewCard();
  }

  function handleReview(difficulty: CardReviewDifficulty) {
    if (!currentCard) {
      return;
    }
    reviewMutation.mutate({ difficulty, itemId: currentCard.id });
  }

  const isReviewModeReady =
    studyMode === CARD_STUDY_MODES.review && Boolean(currentCard);

  return {
    canMoveNext,
    canMovePrev,
    currentCard,
    currentIndex,
    detail,
    handleReview,
    handleSkipReview,
    handleStudyModeChange,
    isAnswerVisible,
    isBooting,
    isReviewAnswerVisible,
    isReviewModeReady,
    isReviewSaving: reviewMutation.isPending,
    mode,
    moveNext,
    movePrev,
    playState,
    revealReviewAnswer: () => setReviewAnswerVisible(true),
    studyMode,
    toggleAnswer: () => setAnswerVisible((prev) => !prev),
  };
}
