"use client";

import {
  CARD_ROOM_RESULT,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import type { CardRoomCardDto, CardRoomRealtimeState } from "@yeon/race-shared";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

type CardRoomStudyPanelProps = {
  state: CardRoomRealtimeState | null;
  currentCard: CardRoomCardDto | null;
  isChecker: boolean;
  isMemorizer: boolean;
  shouldShowBack: boolean;
  canMoveNext: boolean;
  onReveal: () => void;
  onResult: (cardId: string, result: "OK" | "GIVE_UP" | "HINTED_OK") => void;
  onNext: () => void;
};

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
  const resultSummary = {
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

  return (
    <div className={SHARED_FEATURE_CLASS.panelCard}>
      {state?.status === CARD_ROOM_STATUS.FINISHED ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <h2 className="text-[28px] font-black tracking-[-0.05em]">
            학습 완료
          </h2>
          <p className="mt-3 text-[15px] font-semibold text-[#666]">
            OK {resultSummary.ok}개 · 포기 {resultSummary.giveUp}개
          </p>
        </div>
      ) : currentCard ? (
        <>
          <button
            type="button"
            disabled={!isChecker}
            onClick={onReveal}
            aria-live="polite"
            className="flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-5 text-center disabled:cursor-not-allowed"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#999]">
              {shouldShowBack ? "Back" : "Front"}
            </span>
            <span className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#111]">
              {shouldShowBack ? currentCard.backText : currentCard.frontText}
            </span>
            <span
              className={`mt-5 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
            >
              {isChecker
                ? "클릭해서 정답 공개"
                : "외우는 사람은 앞면만 보고 답변합니다."}
            </span>
          </button>
          <div className="mt-4 grid gap-3">
            {state?.status === CARD_ROOM_STATUS.ANSWERING ||
            state?.status === CARD_ROOM_STATUS.WAITING ||
            state?.status === CARD_ROOM_STATUS.REVEALED ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!isChecker || !currentCard}
                  onClick={() => onResult(currentCard.id, CARD_ROOM_RESULT.OK)}
                  className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333] disabled:border disabled:border-[#e5e5e5] disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
                >
                  OK
                </button>
                <button
                  type="button"
                  disabled={!isMemorizer || !currentCard}
                  onClick={() =>
                    onResult(currentCard.id, CARD_ROOM_RESULT.GIVE_UP)
                  }
                  className="h-12 rounded-xl border border-[#e5e5e5] bg-white text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111] disabled:text-[#ccc]"
                >
                  포기
                </button>
              </div>
            ) : null}
            {canMoveNext ? (
              <button
                type="button"
                onClick={onNext}
                className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333]"
              >
                {state && state.currentCardIndex >= state.cards.length - 1
                  ? "결과 보기"
                  : "다음 카드"}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-[14px] font-bold text-[#777]">
          카드방 상태를 기다리는 중...
        </div>
      )}
    </div>
  );
}
