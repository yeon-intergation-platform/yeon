import { BookOpen, CheckCircle2, ListTodo, RotateCcw } from "lucide-react";
import type { ReactElement } from "react";
import type {
  CardDeckDto,
  CardDeckItemDto,
  CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "@/features/card-service/card-service-common.const";
import { DeckPlayReviewModeCard } from "@/features/card-service/components";
import { resolveTodoServiceHref } from "@/lib/study-desk-links";
import {
  formatElapsedSeconds,
  formatRemainingSeconds,
} from "./focus-desk-format";
import {
  type FocusDeskSessionStatus,
  type FocusDeskSummary,
} from "./focus-desk-session";

function QueueCompletePanel({
  onFinish,
  remainingSeconds,
}: {
  onFinish: () => void;
  remainingSeconds: number;
}): ReactElement {
  return (
    <YeonSurface className="w-full max-w-[760px] border-[#111] p-6 text-center">
      <CheckCircle2
        aria-hidden="true"
        size={34}
        className="mx-auto text-[#111]"
      />
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="mt-4 text-[22px] font-black text-[#111]"
      >
        카드 큐를 모두 봤습니다.
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mx-auto mt-3 max-w-[520px] ${SHARED_FEATURE_CLASS.text13Neutral} leading-[1.8]`}
      >
        남은 {formatRemainingSeconds(remainingSeconds)} 동안 정리하거나 다시
        떠올려보세요. 타이머가 끝나면 자동으로 요약됩니다.
      </YeonText>
      <YeonView className="mx-auto mt-5 grid max-w-[620px] gap-2 text-left sm:grid-cols-3">
        {[
          ["1", "답을 보지 않고 핵심을 다시 말하기"],
          ["2", "헷갈린 포인트 하나만 고르기"],
          ["3", "Today에서 이어 할 행동만 남기기"],
        ].map(([step, label]) => (
          <YeonView
            key={step}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#111] text-[11px] font-black text-white"
            >
              {step}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 break-words text-[12px] font-bold leading-[1.6] text-[#111]"
            >
              {label}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>
      <YeonButton
        type="button"
        variant="primary"
        onClick={onFinish}
        className="mt-5 px-4 py-3 text-[14px]"
      >
        지금 요약 보기
      </YeonButton>
    </YeonSurface>
  );
}

function SummaryCard({
  onRestart,
  summary,
  todoTaskId,
  todoTitle,
}: {
  onRestart: () => void;
  summary: FocusDeskSummary;
  todoTaskId: string | null;
  todoTitle: string | null;
}): ReactElement {
  const todoReturnHref = resolveTodoServiceHref({ todoTaskId });

  return (
    <YeonSurface
      as="section"
      className={`w-full max-w-[760px] border-[#111] p-6 ${YEON_WEB_SHADOW_CLASS.cardSoft}`}
    >
      <YeonView className="flex items-center gap-2">
        <CheckCircle2 aria-hidden="true" size={20} />
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[20px] font-black tracking-[-0.03em] text-[#111]"
        >
          집중 세션 요약
        </YeonText>
      </YeonView>

      <YeonView className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["계획", `${summary.plannedMinutes}분`],
          ["실제", formatElapsedSeconds(summary.elapsedSeconds)],
          ["채점", `${summary.reviewed}장`],
          ["스킵", `${summary.skipped}장`],
        ].map(([label, value]) => (
          <YeonView
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12Soft}
            >
              {label}
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block text-[22px] font-black text-[#111]"
            >
              {value}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>

      <YeonView className="mt-4 grid gap-2 rounded-lg border border-[#e5e5e5] bg-white p-4 sm:grid-cols-3">
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          어려움 {summary.hard}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          보통 {summary.good}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          쉬움 {summary.easy}
        </YeonText>
      </YeonView>

      {todoTitle ? (
        <YeonView className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`break-words ${SHARED_FEATURE_CLASS.text13Emphasis}`}
          >
            연결된 할 일: {todoTitle}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}
          >
            완료 처리는 Today에서 직접 확인합니다.
          </YeonText>
        </YeonView>
      ) : null}

      <YeonView className="mt-6 flex flex-wrap gap-3">
        <YeonButton
          type="button"
          variant="primary"
          onClick={onRestart}
          className="gap-2 px-4 py-3 text-[14px]"
        >
          <RotateCcw aria-hidden="true" size={16} />
          같은 덱으로 다시 시작
        </YeonButton>
        <YeonLink
          href={todoReturnHref}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] font-bold text-[#111] no-underline hover:border-[#111]"
        >
          <ListTodo aria-hidden="true" size={16} />
          Today로 돌아가기
        </YeonLink>
      </YeonView>
    </YeonSurface>
  );
}

export function FocusDeskWorkspace({
  currentIndex,
  currentItem,
  hasPlannedCards,
  hasSessionCards,
  isAnswerVisible,
  isDetailError,
  isDetailPending,
  isDetailSuccess,
  isSaving,
  remainingSeconds,
  reviewErrorMessage,
  selectedDeck,
  selectedDeckId,
  sessionQueueLength,
  sessionStatus,
  summary,
  todoTaskId,
  todoTitle,
  visibleQueueLength,
  onFinish,
  onRestart,
  onRevealAnswer,
  onReview,
  onSkip,
}: {
  currentIndex: number;
  currentItem: CardDeckItemDto | null;
  hasPlannedCards: boolean;
  hasSessionCards: boolean;
  isAnswerVisible: boolean;
  isDetailError: boolean;
  isDetailPending: boolean;
  isDetailSuccess: boolean;
  isSaving: boolean;
  remainingSeconds: number;
  reviewErrorMessage: string | null;
  selectedDeck: CardDeckDto | null;
  selectedDeckId: string | null;
  sessionQueueLength: number;
  sessionStatus: FocusDeskSessionStatus;
  summary: FocusDeskSummary | null;
  todoTaskId: string | null;
  todoTitle: string | null;
  visibleQueueLength: number;
  onFinish: () => void;
  onRestart: () => void;
  onRevealAnswer: () => void;
  onReview: (difficulty: CardReviewDifficulty) => void;
  onSkip: () => void;
}): ReactElement {
  return (
    <YeonView className="flex min-w-0 flex-col items-center gap-5">
      {selectedDeck ? (
        <YeonView className="w-full max-w-[760px] rounded-lg border border-[#e5e5e5] bg-white p-4">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text12Soft}
          >
            선택된 덱
          </YeonText>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="mt-1 break-words text-[18px] font-black text-[#111]"
          >
            {selectedDeck.title}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text13Neutral}`}
          >
            이번 세션 큐 {visibleQueueLength}장 / 전체 {selectedDeck.itemCount}
            장
          </YeonText>
        </YeonView>
      ) : null}

      {selectedDeckId && isDetailPending ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text14Soft}
        >
          덱 상세를 불러오는 중...
        </YeonText>
      ) : null}

      {selectedDeckId && isDetailError ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.errorTextMd}
        >
          덱 상세를 불러오지 못했습니다.
        </YeonText>
      ) : null}

      {selectedDeckId && isDetailSuccess && !hasPlannedCards ? (
        <YeonSurface className="w-full max-w-[760px] border-[#e5e5e5] p-6 text-center">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text16Emphasis}
          >
            이 덱에는 진행할 카드가 없습니다.
          </YeonText>
          <YeonLink
            href={resolveYeonWebPath("cardDeckDetail", {
              deckId: selectedDeckId,
            })}
            className="mt-4 inline-flex rounded-lg bg-[#111] px-4 py-3 text-[14px] font-bold text-white no-underline"
          >
            덱에서 카드 추가하기
          </YeonLink>
        </YeonSurface>
      ) : null}

      {!selectedDeckId ? (
        <YeonSurface className="w-full max-w-[760px] border-[#e5e5e5] p-8 text-center">
          <BookOpen
            aria-hidden="true"
            size={34}
            className="mx-auto text-[#111]"
          />
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-4 text-[18px] font-black text-[#111]"
          >
            먼저 학습할 덱을 선택하세요.
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
          >
            {todoTitle
              ? "Todo에서 온 작업도 먼저 학습할 덱을 직접 골라야 시작됩니다."
              : "MoodDesk는 사용자가 고른 덱 안에서만 세션을 구성합니다."}
          </YeonText>
        </YeonSurface>
      ) : null}

      {sessionStatus === "running" && currentItem ? (
        <DeckPlayReviewModeCard
          currentIndex={currentIndex}
          isAnswerVisible={isAnswerVisible}
          isSaving={isSaving}
          item={currentItem}
          onRevealAnswer={onRevealAnswer}
          onReview={onReview}
          onSkip={onSkip}
          totalCount={sessionQueueLength}
        />
      ) : null}

      {sessionStatus === "running" && !currentItem && hasSessionCards ? (
        <QueueCompletePanel
          remainingSeconds={remainingSeconds}
          onFinish={onFinish}
        />
      ) : null}

      {sessionStatus === "finished" && summary ? (
        <SummaryCard
          summary={summary}
          todoTaskId={todoTaskId}
          todoTitle={todoTitle}
          onRestart={onRestart}
        />
      ) : null}

      {reviewErrorMessage ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.errorTextSm}
        >
          {reviewErrorMessage}
        </YeonText>
      ) : null}
    </YeonView>
  );
}
