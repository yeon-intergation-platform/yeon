"use client";
import {
  CARD_ROOM_RESULT,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import type { CardRoomCardDto, CardRoomRealtimeState } from "@yeon/race-shared";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { MarkdownContent } from "./components/markdown-content";

type CardRoomStudyPanelStateProps = {
  state: CardRoomRealtimeState | null;
  currentCard: CardRoomCardDto | null;
};

type CardRoomStudyPanelPermissionProps = {
  isChecker: boolean;
  isMemorizer: boolean;
  shouldShowBack: boolean;
  canMoveNext: boolean;
};

type CardRoomStudyPanelActionProps = {
  onReveal: () => void;
  onResult: (cardId: string, result: "OK" | "GIVE_UP" | "HINTED_OK") => void;
  onNext: () => void;
};

type CardRoomStudyPanelProps = CardRoomStudyPanelStateProps &
  CardRoomStudyPanelPermissionProps &
  CardRoomStudyPanelActionProps;

type CardRoomResultSummary = {
  ok: number;
  giveUp: number;
};

function getCardRoomResultSummary(
  state: CardRoomRealtimeState | null
): CardRoomResultSummary {
  return {
    ok:
      state?.results.filter(
        (result) =>
          result.result === CARD_ROOM_RESULT.OK ||
          result.result === CARD_ROOM_RESULT.HINTED_OK
      ).length ?? 0,
    giveUp:
      state?.results.filter(
        (result) => result.result === CARD_ROOM_RESULT.GIVE_UP
      ).length ?? 0,
  };
}

function CardRoomWaitingPanel({ state }: { state: CardRoomRealtimeState }) {
  const memorizerCount = state.participants.filter(
    (participant) => participant.role === "MEMORIZER"
  ).length;
  const checkerCount = state.participants.filter(
    (participant) => participant.role === "CHECKER"
  ).length;

  return (
    <YeonView className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[24px] font-black tracking-[-0.05em]"
      >
        학습 대기실
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-3 max-w-[360px] text-[14px] font-semibold leading-6 text-[#666]"
      >
        역할을 정하고 모두 준비하면 방장이 학습을 시작합니다. 새로고침해도 이
        방과 카드 목록은 유지됩니다.
      </YeonText>
      <YeonView className="mt-5 grid gap-2 text-[13px] font-bold text-[#666]">
        <YeonText as="span" variant="unstyled" tone="inherit">
          외우는 사람 {memorizerCount}명
        </YeonText>
        <YeonText as="span" variant="unstyled" tone="inherit">
          봐주는 사람 {checkerCount}명
        </YeonText>
        <YeonText as="span" variant="unstyled" tone="inherit">
          카드 {state.cards.length}장
        </YeonText>
      </YeonView>
    </YeonView>
  );
}

function CardRoomClosedPanel() {
  return (
    <YeonView className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[28px] font-black tracking-[-0.05em]"
      >
        방 종료
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[15px] font-semibold text-[#666]"
      >
        방장이 카드방을 종료했습니다.
      </YeonText>
    </YeonView>
  );
}

function CardRoomFinishedPanel({
  resultSummary,
}: {
  resultSummary: CardRoomResultSummary;
}) {
  return (
    <YeonView className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[28px] font-black tracking-[-0.05em]"
      >
        학습 완료
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[15px] font-semibold text-[#666]"
      >
        OK {resultSummary.ok}개 · 포기 {resultSummary.giveUp}개
      </YeonText>
    </YeonView>
  );
}

function CardRoomCurrentCardPanel({
  state,
  currentCard,
  isChecker,
  isMemorizer,
  shouldShowBack,
  canMoveNext,
  onReveal,
  onResult,
  onNext,
}: CardRoomStudyPanelProps & { currentCard: CardRoomCardDto }) {
  const nextButtonLabel =
    state && state.currentCardIndex >= state.cards.length - 1
      ? "결과 보기"
      : "다음 카드";
  const canRecordResult =
    state?.status === CARD_ROOM_STATUS.IN_PROGRESS &&
    state.currentCardResult === null;

  return (
    <>
      <YeonButton
        type="button"
        disabled={!isChecker}
        onClick={onReveal}
        aria-live="polite"
        variant="secondary"
        size="xl"
        className="min-h-[250px] w-full flex-col rounded-2xl bg-[#fafafa] px-5 text-center"
      >
        <YeonText
          as="span"
          variant="caption"
          tone="muted"
          className="font-bold uppercase tracking-[0.18em]"
        >
          {shouldShowBack ? "Back" : "Front"}
        </YeonText>
        <YeonView className="mt-5 w-full text-[#111]">
          <MarkdownContent className="text-[26px] font-black leading-tight tracking-[-0.04em]">
            {shouldShowBack ? currentCard.backText : currentCard.frontText}
          </MarkdownContent>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={`mt-5 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          {isChecker
            ? "클릭해서 정답 공개"
            : "외우는 사람은 앞면만 보고 답변합니다."}
        </YeonText>
      </YeonButton>
      <YeonView className="mt-4 grid gap-3">
        {canRecordResult ? (
          <YeonView className="grid gap-3 sm:grid-cols-2">
            <YeonButton
              type="button"
              disabled={!isChecker}
              onClick={() => onResult(currentCard.id, CARD_ROOM_RESULT.OK)}
              variant="primary"
              size="lg"
              className="h-12 rounded-xl text-[14px]"
            >
              OK
            </YeonButton>
            <YeonButton
              type="button"
              disabled={!isMemorizer}
              onClick={() => onResult(currentCard.id, CARD_ROOM_RESULT.GIVE_UP)}
              variant="secondary"
              size="lg"
              className="h-12 rounded-xl text-[14px]"
            >
              포기
            </YeonButton>
          </YeonView>
        ) : null}
        {canMoveNext ? (
          <YeonButton
            type="button"
            onClick={onNext}
            variant="primary"
            size="lg"
            className="h-12 rounded-xl text-[14px]"
          >
            {nextButtonLabel}
          </YeonButton>
        ) : null}
      </YeonView>
    </>
  );
}

function CardRoomPendingStatePanel() {
  return (
    <YeonView className="flex min-h-[280px] items-center justify-center text-[14px] font-bold text-[#666]">
      카드방 상태를 기다리는 중...
    </YeonView>
  );
}

export function CardRoomStudyPanel({
  state,
  currentCard,
  isChecker,
  isMemorizer,
  shouldShowBack,
  canMoveNext,
  onReveal,
  onResult,
  onNext,
}: CardRoomStudyPanelProps) {
  const resultSummary = getCardRoomResultSummary(state);

  return (
    <YeonView className={SHARED_FEATURE_CLASS.panelCard}>
      {state?.status === CARD_ROOM_STATUS.WAITING ? (
        <CardRoomWaitingPanel state={state} />
      ) : state?.status === CARD_ROOM_STATUS.CLOSED ? (
        <CardRoomClosedPanel />
      ) : state?.status === CARD_ROOM_STATUS.FINISHED ? (
        <CardRoomFinishedPanel resultSummary={resultSummary} />
      ) : currentCard ? (
        <CardRoomCurrentCardPanel
          state={state}
          currentCard={currentCard}
          isChecker={isChecker}
          isMemorizer={isMemorizer}
          shouldShowBack={shouldShowBack}
          canMoveNext={canMoveNext}
          onReveal={onReveal}
          onResult={onResult}
          onNext={onNext}
        />
      ) : (
        <CardRoomPendingStatePanel />
      )}
    </YeonView>
  );
}
