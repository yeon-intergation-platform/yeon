import {
  CARD_STUDY_MODES,
  type CardReviewDifficulty,
  type CardStudyMode,
} from "@yeon/api-contract/card-decks";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useEffect, useMemo, useState } from "react";
import {
  YeonFormStack as FormStack,
  YeonMobileHeaderBar as MobileHeaderBar,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
} from "@yeon/ui/native";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { deriveCardDeckPlayViewState } from "@yeon/ui/runtime/ports/card-deck";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import {
  getGuestCardStudyMode,
  getGuestDeckDetail,
} from "../../services/card-service/storage";
import { createMobileCardItemRepository } from "./runtime-adapters/card-item-repository";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getCardServiceErrorMessage } from "./error-message";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";
import {
  CARD_DECK_PLAY_OPERATION,
  CardDeckPlayInputError,
  getModeBadge,
  requirePlayDeckId,
} from "./card-deck-play-helpers";
import {
  CardDeckFlashcardPanel,
  CardDeckPlayModeControl,
  CardDeckReviewModePanel,
} from "./card-deck-play-mode-panels";

const CARD_SERVICE_ROUTE = YEON_ROUTE_TEMPLATES.cardHome as Href;

interface CardDeckPlayScreenProps {
  deckId?: string;
}

export function CardDeckPlayScreen({ deckId }: CardDeckPlayScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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

      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.getCardDeckDetail(targetDeckId, sessionToken);
      }

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
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deckDetail(
          mode === CARD_SERVICE_MODE.server,
          deckId
        )
      : ["card-service", "deck", "missing", mode],
  });

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
    onSuccess: async () => {
      if (deckId) {
        await queryClient.invalidateQueries({
          queryKey: cardServiceQueryKeys.deckDetail(
            mode === CARD_SERVICE_MODE.server,
            deckId
          ),
        });
      }
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
    if (currentIndex >= detailQuery.data.items.length) {
      setCurrentIndex(0);
      setAnswerVisible(false);
      setReviewAnswerVisible(false);
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
    setReviewAnswerVisible(false);
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
    setReviewAnswerVisible(false);
  }

  const currentCard = detailQuery.data?.items[currentIndex] ?? null;
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
  const canMoveNext = detail ? currentIndex < detail.items.length - 1 : false;

  function handleStudyModeChange(nextMode: CardStudyMode) {
    setStudyMode(nextMode);
    setReviewAnswerVisible(false);
    studyModeMutation.mutate(nextMode);
  }

  function moveToNextReviewCard() {
    if (!detailQuery.data || detailQuery.data.items.length === 0) {
      setReviewAnswerVisible(false);
      return;
    }

    setCurrentIndex((prev) =>
      prev + 1 >= detailQuery.data.items.length ? 0 : prev + 1
    );
    setAnswerVisible(false);
    setReviewAnswerVisible(false);
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

  if (isBooting) {
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
            isReviewModeReady
              ? CARD_SERVICE_TEXT.play.reviewSkipLabel
              : CARD_SERVICE_TEXT.play.homeLabel
          }
          rightLabel={
            isReviewModeReady
              ? CARD_SERVICE_TEXT.play.reviewSkipLabel
              : CARD_SERVICE_TEXT.play.homeLabel
          }
          onRightPress={() =>
            isReviewModeReady
              ? handleSkipReview()
              : router.replace(CARD_SERVICE_ROUTE)
          }
          subtitle={
            detail
              ? `${currentIndex + 1} / ${detail.items.length} · ${getModeBadge(mode)}`
              : getModeBadge(mode)
          }
          title={detail?.deck.title ?? CARD_SERVICE_TEXT.play.titleFallback}
        />

        {playState.kind === "loading" ? (
          <StateBlock
            loading
            message={CARD_SERVICE_TEXT.state.loading}
            title={CARD_SERVICE_TEXT.state.loadingTitle}
          />
        ) : playState.kind === "error" ? (
          <StateBlock
            message={playState.message}
            title={CARD_SERVICE_TEXT.state.errorTitle}
          />
        ) : !currentCard ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.play.emptyMessage}
            title={CARD_SERVICE_TEXT.play.emptyTitle}
          />
        ) : (
          <>
            <CardDeckPlayModeControl
              onChange={handleStudyModeChange}
              value={studyMode}
            />

            {studyMode === CARD_STUDY_MODES.review ? (
              <CardDeckReviewModePanel
                currentCard={currentCard}
                isAnswerVisible={isReviewAnswerVisible}
                isPending={reviewMutation.isPending}
                onRevealAnswer={() => setReviewAnswerVisible(true)}
                onReview={handleReview}
              />
            ) : (
              <CardDeckFlashcardPanel
                canMoveNext={canMoveNext}
                canMovePrev={canMovePrev}
                currentCard={currentCard}
                isAnswerVisible={isAnswerVisible}
                onFlip={() => setAnswerVisible((prev) => !prev)}
                onNext={moveNext}
                onPrev={movePrev}
              />
            )}
          </>
        )}
      </FormStack>
    </MobileScreen>
  );
}
