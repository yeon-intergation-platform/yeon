"use client";

import {
  CARD_TEXT_MAX_LENGTH,
  CARD_REVIEW_DIFFICULTIES,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import { RECALL_GRADE_VERDICTS } from "@yeon/api-contract/recall";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonLink,
  YeonText,
  YeonView,
  type YeonKeyboardEvent,
  type YeonTextAreaElement,
} from "@yeon/ui";
import type { ReactNode } from "react";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { MarkdownContent } from "../card-service/components/markdown-content";
import { BaekjiServiceHeader } from "./baekji-service-header";
import { TYPING_SERVICE_HOME_CLASS as C } from "./typing-service-home.const";
import { TYPING_SERVICE_COMMON_CLASS as CC } from "./typing-service-common.const";
import {
  BAEKJI_SESSION_PHASES,
  type BaekjiSessionState,
} from "./use-baekji-session";

const COPY = {
  answer: "정답",
  average: "평균 점수",
  cardLink: "카드 원본 열기",
  complete: "백지 세션 완료",
  deck: "덱",
  error: "덱을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  feedback: "피드백",
  grade: "채점하기",
  grading: "채점 중...",
  gradeError: "채점에 실패했어요. 같은 요청으로 다시 시도할 수 있습니다.",
  guestError: "복습 결과를 저장하지 못했어요. 다시 선택해 주세요.",
  guestHint: "정답과 비교한 뒤 기억 난 정도를 선택하세요.",
  header: "백지",
  home: "백지 홈으로",
  intro: "질문 보고 답 쓰기",
  loading: "덱을 불러오는 중...",
  missed: "놓친 핵심",
  next: "다음",
  noDeck: "덱을 먼저 선택해 주세요.",
  empty:
    "질문과 답이 모두 있는 카드가 없어요. 카드 서비스에서 덱 내용을 확인해 주세요.",
  placeholder: "기억나는 대로 답을 입력하세요.",
  progress: "진행",
  question: "질문",
  reveal: "정답 보기",
  rewrite: "다시 쓰기",
  solved: "푼 카드",
  write: "답을 전부 기억으로 써보세요",
} as const;

const HOME_HREF = YEON_ROUTE_TEMPLATES.recallHome;

function Shell({ children }: { children: ReactNode }) {
  return (
    <YeonView className={C.root}>
      <BaekjiServiceHeader title={COPY.header} />
      <YeonView as="main" className={C.main}>
        <YeonView as="section" className={C.introSection}>
          {children}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

function HomeLink() {
  return (
    <YeonLink href={HOME_HREF} className={CC.panelGhostButton}>
      {COPY.home}
    </YeonLink>
  );
}

function StateMessage({ message }: { message: string }) {
  return (
    <Shell>
      <YeonView className="flex flex-col items-start gap-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {message}
        </YeonText>
        <HomeLink />
      </YeonView>
    </Shell>
  );
}

function Summary({ state }: { state: BaekjiSessionState }) {
  return (
    <Shell>
      <YeonView className="flex flex-col gap-6">
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className={C.introTitle}
        >
          {COPY.complete}
        </YeonText>
        <YeonView className="grid gap-3 sm:grid-cols-2">
          <SummaryValue
            label={COPY.solved}
            value={`${state.summary.solvedCount}장`}
          />
          <SummaryValue
            label={COPY.average}
            value={
              state.summary.averageScore === null
                ? "직접 평가 완료"
                : `${state.summary.averageScore}%`
            }
          />
        </YeonView>
        <HomeLink />
      </YeonView>
    </Shell>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white px-5 py-4">
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="block text-[13px] text-[#666]"
      >
        {label}
      </YeonText>
      <YeonText
        as="strong"
        variant="unstyled"
        tone="inherit"
        className="mt-1 block text-[28px] font-black text-[#111]"
      >
        {value}
      </YeonText>
    </YeonView>
  );
}

function GuestReview({ state }: { state: BaekjiSessionState }) {
  const isReviewPending = state.guestReviewMutation.isPending;
  const choices: Array<{ difficulty: CardReviewDifficulty; label: string }> = [
    { difficulty: CARD_REVIEW_DIFFICULTIES.hard, label: "거의 못 기억함" },
    { difficulty: CARD_REVIEW_DIFFICULTIES.good, label: "대부분 기억함" },
    { difficulty: CARD_REVIEW_DIFFICULTIES.easy, label: "정확히 기억함" },
  ];
  return (
    <YeonView className="flex flex-col gap-3">
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={CC.textBody14Neutral}
      >
        {COPY.guestHint}
      </YeonText>
      <YeonView className="flex flex-wrap gap-2">
        {choices.map(({ difficulty, label }) => (
          <YeonButton
            key={difficulty}
            type="button"
            variant={
              state.guestDifficulty === difficulty ? "primary" : "secondary"
            }
            disabled={isReviewPending}
            onClick={() => void state.reviewGuestAnswer(difficulty)}
          >
            {label}
          </YeonButton>
        ))}
      </YeonView>
      {state.guestReviewMutation.isError ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textError}
        >
          {COPY.guestError}
        </YeonText>
      ) : null}
    </YeonView>
  );
}

function GradeResult({ state }: { state: BaekjiSessionState }) {
  const result = state.gradeResult;
  if (!result) return <GuestReview state={state} />;
  return (
    <>
      <YeonView className="flex items-end gap-3">
        <YeonText
          as="strong"
          variant="unstyled"
          tone="inherit"
          className="text-[48px] font-black leading-none text-[#111]"
        >
          {result.score}%
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="mb-1 rounded-full border border-[#111] px-3 py-1 text-[13px] font-bold text-[#111]"
        >
          {result.verdict === RECALL_GRADE_VERDICTS.pass ? "통과" : "다시"}
        </YeonText>
      </YeonView>
      {result.missedPoints.length > 0 ? (
        <YeonView>
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className={CC.panelSubheading}
          >
            {COPY.missed}
          </YeonText>
          <YeonView as="ul" className="flex flex-col gap-1.5">
            {result.missedPoints.map((point, index) => (
              <YeonView as="li" key={`${point}-${index}`}>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={CC.textBody14Neutral}
                >
                  {point}
                </YeonText>
              </YeonView>
            ))}
          </YeonView>
        </YeonView>
      ) : null}
      {result.feedback ? (
        <YeonView>
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className={CC.panelSubheading}
          >
            {COPY.feedback}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={CC.textBody14Neutral}
          >
            {result.feedback}
          </YeonText>
        </YeonView>
      ) : null}
    </>
  );
}

function SessionCard({
  state,
  deckId,
}: {
  state: BaekjiSessionState;
  deckId: string;
}) {
  const isRevealed = state.phase === BAEKJI_SESSION_PHASES.revealed;
  const isGrading = state.gradeMutation.isPending;
  const canSubmit = Boolean(state.userAnswer.trim()) && !isGrading;
  const onKeyDown = (event: YeonKeyboardEvent<YeonTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void (state.isAuthenticated
        ? state.gradeAnswer()
        : state.revealGuestAnswer());
    }
  };
  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-5 md:p-6">
      <YeonView className="flex flex-wrap items-center gap-3 text-[12px] text-[#777]">
        <YeonText as="span" variant="unstyled" tone="inherit">
          {COPY.progress} {state.cardIndex + 1} / {state.cards.length}
        </YeonText>
        <YeonText as="span" variant="unstyled" tone="inherit">
          {COPY.deck} {state.detailQuery.data?.deck.title}
        </YeonText>
        {state.isAuthenticated ? (
          <YeonLink
            href={`https://card.yeon.world/card-service/decks/${encodeURIComponent(deckId)}`}
            className="font-semibold text-[#111] underline"
          >
            {COPY.cardLink}
          </YeonLink>
        ) : null}
      </YeonView>

      <YeonView className="mt-5">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[11px] font-extrabold text-[#777]"
        >
          {COPY.question}
        </YeonText>
        <MarkdownContent className="mt-1 text-[20px] font-bold leading-[1.5] text-[#111]">
          {state.currentCard?.frontText}
        </MarkdownContent>
      </YeonView>

      {isRevealed ? (
        <YeonView className="mt-6 flex flex-col gap-5">
          <GradeResult state={state} />
          <YeonView>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={CC.panelSubheading}
            >
              {COPY.answer}
            </YeonText>
            <MarkdownContent className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4 text-[15px] leading-[1.7] text-[#111]">
              {state.currentCard?.backText}
            </MarkdownContent>
          </YeonView>
          <YeonView className="flex flex-wrap gap-3">
            <YeonButton
              type="button"
              variant="primary"
              disabled={!state.isAuthenticated && !state.guestDifficulty}
              onClick={state.nextCard}
            >
              {COPY.next}
              <YeonIcon name="chevron-right" size={16} aria-hidden="true" />
            </YeonButton>
            {state.isAuthenticated ? (
              <YeonButton
                type="button"
                variant="secondary"
                onClick={state.resetForAttempt}
              >
                <YeonIcon name="rotate-cw" size={15} aria-hidden="true" />
                {COPY.rewrite}
              </YeonButton>
            ) : null}
          </YeonView>
        </YeonView>
      ) : (
        <YeonView className="mt-6 flex flex-col gap-4">
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className={CC.panelBodyTitle}
          >
            {COPY.write}
          </YeonText>
          <YeonField
            as="textarea"
            value={state.userAnswer}
            onChange={(event) => state.updateUserAnswer(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={isGrading}
            rows={5}
            maxLength={CARD_TEXT_MAX_LENGTH}
            spellCheck={false}
            aria-label="백지 답 입력 영역"
            className={CC.raceInputArea}
            placeholder={COPY.placeholder}
          />
          {state.gradeMutation.isError ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={CC.textError}
            >
              {COPY.gradeError}
            </YeonText>
          ) : null}
          <YeonView className="flex justify-end">
            <YeonButton
              type="button"
              variant="primary"
              disabled={!canSubmit}
              onClick={() =>
                void (state.isAuthenticated
                  ? state.gradeAnswer()
                  : state.revealGuestAnswer())
              }
            >
              {state.isAuthenticated
                ? isGrading
                  ? COPY.grading
                  : COPY.grade
                : COPY.reveal}
            </YeonButton>
          </YeonView>
        </YeonView>
      )}
    </YeonView>
  );
}

export function BaekjiSessionView({
  deckId,
  state,
}: {
  deckId: string | null;
  state: BaekjiSessionState;
}) {
  if (!deckId) return <StateMessage message={COPY.noDeck} />;
  if (state.detailQuery.isLoading)
    return <StateMessage message={COPY.loading} />;
  if (state.detailQuery.isError) return <StateMessage message={COPY.error} />;
  if (state.cards.length === 0) return <StateMessage message={COPY.empty} />;
  if (state.phase === BAEKJI_SESSION_PHASES.summary)
    return <Summary state={state} />;
  return (
    <Shell>
      <YeonView className="flex flex-col gap-6">
        <YeonView className={C.introCopy}>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className={C.introTitle}
          >
            {COPY.intro}
          </YeonText>
        </YeonView>
        <SessionCard state={state} deckId={deckId} />
      </YeonView>
    </Shell>
  );
}
