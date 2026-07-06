"use client";
import { useMemo, useState, type ReactNode } from "react";
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
import { useYeonMutation, useYeonQuery } from "@yeon/ui/runtime/YeonQuery";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { loadServerCardDeckDetail } from "../card-service/card-service-fetch";
import { TypingServiceHeader } from "./typing-service-header";
import { TYPING_SERVICE_HOME_CLASS as C } from "./typing-service-home.const";
import { TYPING_SERVICE_COMMON_CLASS as CC } from "./typing-service-common.const";
import { RECALL_GRADE_VERDICT, type RecallGradeResponse } from "./recall-grade";
import {
  gradeRecallAnswer,
  RECALL_REVIEW_DIFFICULTY,
  reviewRecallCardSilently,
} from "./recall-service-fetch";

// 백지 세션. 카드 덱을 하나씩 진행: 질문(front)을 보여주고 답을 전부 기억으로 써낸 뒤
// Z.ai 의미 채점(핵심 내용 일치)으로 결과를 낸다. 원문(back)은 채점 전까지 숨긴다.

const RECALL_HOME_HREF = "/recall-service";

// 세션 진행 단계. enum 대신 as const + literal union.
const BAEKJI_SESSION_PHASE = {
  writing: "writing",
  graded: "graded",
  summary: "summary",
} as const;
type BaekjiSessionPhase =
  (typeof BAEKJI_SESSION_PHASE)[keyof typeof BAEKJI_SESSION_PHASE];

// 덱 상세가 미확정(undefined)일 때 쓰는 안정 참조. `?? []` 금지 규칙 회피 + 리렌더 안정.
const EMPTY_CARDS: readonly CardDeckItemDto[] = [];

const BAEKJI_SESSION_COPY = {
  headerTitle: "백지",
  introTitle: "질문 보고 답 쓰기",
  introDescription:
    "질문을 읽고 답을 전부 기억으로 써낸 뒤 채점하세요. 정답은 채점 후에 공개됩니다.",
  loading: "덱을 불러오는 중...",
  loadError: "덱을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  emptyDeck: "이 덱에는 카드가 없어요. 다른 덱을 골라 주세요.",
  noDeck: "덱을 먼저 선택해 주세요.",
  progressLabel: "진행",
  deckLabel: "덱",
  questionLabel: "질문",
  writePrompt: "답을 전부 기억으로 써보세요",
  inputPlaceholder: "기억나는 대로 답을 입력하세요.",
  inputAriaLabel: "백지 답 입력 영역",
  gradeButton: "채점하기",
  gradingButton: "채점 중...",
  gradeError: "채점에 실패했어요. 잠시 후 다시 시도해 주세요.",
  passBadge: "통과",
  retryBadge: "다시",
  scoreLabel: "점수",
  answerLabel: "정답",
  missedTitle: "놓친 핵심",
  feedbackTitle: "피드백",
  nextButton: "다음",
  rewriteButton: "다시 쓰기",
  summaryTitle: "백지 세션 완료",
  summarySolvedLabel: "푼 카드",
  summaryAverageLabel: "평균 점수",
  summaryUnit: "장",
  homeButton: "백지 홈으로",
} as const;

export function BaekjiSession({ deckId }: { deckId: string | null }) {
  const detailQuery = useYeonQuery({
    queryKey: ["recall", "deck-detail", deckId],
    queryFn: () => loadServerCardDeckDetail(deckId as string),
    enabled: deckId !== null,
  });

  const [phase, setPhase] = useState<BaekjiSessionPhase>(
    BAEKJI_SESSION_PHASE.writing
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradeResult, setGradeResult] = useState<RecallGradeResponse | null>(
    null
  );
  // 카드 index별 점수 스냅샷. "다시 쓰기" 재채점 시 덮어써 중복 집계를 막는다.
  const [scoreByCard, setScoreByCard] = useState<Record<number, number>>({});

  const gradeMutation = useYeonMutation({
    mutationFn: gradeRecallAnswer,
  });

  const items = detailQuery.data?.items;
  const cards: readonly CardDeckItemDto[] =
    items === undefined ? EMPTY_CARDS : items;
  const currentCard = cards[cardIndex] ?? null;

  const summary = useMemo(() => {
    const values = Object.values(scoreByCard);
    const solvedCount = values.length;
    const averageScore =
      solvedCount === 0
        ? 0
        : Math.round(
            values.reduce((sum, value) => sum + value, 0) / solvedCount
          );
    return { solvedCount, averageScore };
  }, [scoreByCard]);

  const resetForCard = () => {
    setUserAnswer("");
    setGradeResult(null);
    gradeMutation.reset();
    setPhase(BAEKJI_SESSION_PHASE.writing);
  };

  const handleGrade = async () => {
    if (
      userAnswer.trim().length === 0 ||
      currentCard === null ||
      deckId === null ||
      gradeMutation.isPending
    ) {
      return;
    }
    try {
      const result = await gradeMutation.mutateAsync({
        question: currentCard.frontText,
        answer: currentCard.backText,
        userAnswer,
      });
      setGradeResult(result);
      setScoreByCard((prev) => ({ ...prev, [cardIndex]: result.score }));
      setPhase(BAEKJI_SESSION_PHASE.graded);
      // SRS 복습 반영은 선택. 통과=good, 실패=hard. 실패해도 세션은 계속(조용히 로그).
      void reviewRecallCardSilently(
        deckId,
        currentCard.id,
        RECALL_REVIEW_DIFFICULTY[result.verdict]
      );
    } catch {
      // 에러 상태는 gradeMutation.isError로 표시한다.
    }
  };

  const handleNext = () => {
    const isLast = cardIndex >= cards.length - 1;
    if (isLast) {
      setPhase(BAEKJI_SESSION_PHASE.summary);
      return;
    }
    setCardIndex((index) => index + 1);
    resetForCard();
  };

  const handleRewrite = () => {
    resetForCard();
  };

  const handleInputKeyDown = (
    event: YeonKeyboardEvent<YeonTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleGrade();
    }
  };

  const shell = (children: ReactNode) => (
    <YeonView className={C.root}>
      <TypingServiceHeader
        active="home"
        title={BAEKJI_SESSION_COPY.headerTitle}
      />
      <YeonView as="main" className={C.main}>
        <YeonView as="section" className={C.introSection}>
          {children}
        </YeonView>
      </YeonView>
    </YeonView>
  );

  const homeLink = (
    <YeonLink href={RECALL_HOME_HREF} className={CC.panelGhostButton}>
      {BAEKJI_SESSION_COPY.homeButton}
    </YeonLink>
  );

  if (deckId === null) {
    return shell(
      <YeonView className="flex flex-col items-start gap-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {BAEKJI_SESSION_COPY.noDeck}
        </YeonText>
        {homeLink}
      </YeonView>
    );
  }

  if (detailQuery.isLoading) {
    return shell(
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={CC.textBody14Neutral}
      >
        {BAEKJI_SESSION_COPY.loading}
      </YeonText>
    );
  }

  if (detailQuery.isError) {
    return shell(
      <YeonView className="flex flex-col items-start gap-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textError}
        >
          {BAEKJI_SESSION_COPY.loadError}
        </YeonText>
        {homeLink}
      </YeonView>
    );
  }

  if (cards.length === 0) {
    return shell(
      <YeonView className="flex flex-col items-start gap-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {BAEKJI_SESSION_COPY.emptyDeck}
        </YeonText>
        {homeLink}
      </YeonView>
    );
  }

  if (phase === BAEKJI_SESSION_PHASE.summary) {
    return shell(
      <YeonView className="flex flex-col gap-6">
        <YeonView className={C.introCopy}>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className={C.introTitle}
          >
            {BAEKJI_SESSION_COPY.summaryTitle}
          </YeonText>
        </YeonView>
        <YeonView className="grid gap-3 sm:grid-cols-2">
          <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="block text-[13px] text-[#666]"
            >
              {BAEKJI_SESSION_COPY.summarySolvedLabel}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block text-[32px] font-black leading-none text-[#111]"
            >
              {summary.solvedCount}
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="ml-1 text-[14px] font-medium text-[#aaa]"
              >
                {BAEKJI_SESSION_COPY.summaryUnit}
              </YeonText>
            </YeonText>
          </YeonView>
          <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="block text-[13px] text-[#666]"
            >
              {BAEKJI_SESSION_COPY.summaryAverageLabel}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block text-[32px] font-black leading-none text-[#111]"
            >
              {summary.averageScore}%
            </YeonText>
          </YeonView>
        </YeonView>
        <YeonLink
          href={RECALL_HOME_HREF}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
        >
          <YeonIcon name="arrow-left" size={16} aria-hidden="true" />
          {BAEKJI_SESSION_COPY.homeButton}
        </YeonLink>
      </YeonView>
    );
  }

  const isGraded =
    phase === BAEKJI_SESSION_PHASE.graded && gradeResult !== null;
  // 뮤테이션 상태는 JSX 직접 접근 대신 변수로 승격한다(ViewState 경계 규칙).
  const isGrading = gradeMutation.isPending;
  const hasGradeError = gradeMutation.isError;
  const canGrade = userAnswer.trim().length > 0 && !isGrading;
  const gradeButtonLabel = isGrading
    ? BAEKJI_SESSION_COPY.gradingButton
    : BAEKJI_SESSION_COPY.gradeButton;

  return shell(
    <YeonView className="flex flex-col gap-6">
      <YeonView className={C.introCopy}>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className={C.introTitle}
        >
          {BAEKJI_SESSION_COPY.introTitle}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={C.introDescription}
        >
          {BAEKJI_SESSION_COPY.introDescription}
        </YeonText>
      </YeonView>

      <YeonView className="rounded-[20px] border border-[#e5e5e5] bg-white p-5 md:p-6">
        <YeonView className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-[#aaa]">
          <YeonText as="span" variant="unstyled" tone="inherit">
            {BAEKJI_SESSION_COPY.progressLabel} {cardIndex + 1} / {cards.length}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={CC.raceStatDivider}
          >
            ·
          </YeonText>
          <YeonText as="span" variant="unstyled" tone="inherit">
            {BAEKJI_SESSION_COPY.deckLabel} {detailQuery.data?.deck.title}
          </YeonText>
        </YeonView>

        {/* 질문(front)은 항상 크게 표시한다. */}
        <YeonView className="mt-5">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[11px] font-extrabold tracking-[0.06em] text-[#aaa]"
          >
            {BAEKJI_SESSION_COPY.questionLabel}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-1 whitespace-pre-wrap text-[20px] font-bold leading-[1.5] text-[#111]"
          >
            {currentCard?.frontText}
          </YeonText>
        </YeonView>

        {isGraded ? (
          <YeonView className="mt-6 flex flex-col gap-5">
            <YeonView className="flex items-end gap-4">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[56px] font-black leading-none tracking-[-0.03em] text-[#111]"
              >
                {gradeResult.score}%
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={
                  gradeResult.verdict === RECALL_GRADE_VERDICT.pass
                    ? "mb-1 rounded-full bg-[#111] px-3 py-1 text-[13px] font-bold text-white"
                    : "mb-1 rounded-full border border-[#111] px-3 py-1 text-[13px] font-bold text-[#111]"
                }
              >
                {gradeResult.verdict === RECALL_GRADE_VERDICT.pass
                  ? BAEKJI_SESSION_COPY.passBadge
                  : BAEKJI_SESSION_COPY.retryBadge}
              </YeonText>
            </YeonView>

            <YeonView>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.panelSubheading}
              >
                {BAEKJI_SESSION_COPY.answerLabel}
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="whitespace-pre-wrap rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4 text-[15px] leading-[1.7] text-[#111]"
              >
                {currentCard?.backText}
              </YeonText>
            </YeonView>

            {gradeResult.missedPoints.length > 0 && (
              <YeonView>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={CC.panelSubheading}
                >
                  {BAEKJI_SESSION_COPY.missedTitle}
                </YeonText>
                <YeonView as="ul" className="flex flex-col gap-1.5">
                  {gradeResult.missedPoints.map((point, index) => (
                    <YeonView
                      as="li"
                      key={`missed-${index}`}
                      className="flex gap-2 text-[14px] leading-[1.6] text-[#666]"
                    >
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        aria-hidden="true"
                        className="text-[#111]"
                      >
                        ·
                      </YeonText>
                      <YeonText as="span" variant="unstyled" tone="inherit">
                        {point}
                      </YeonText>
                    </YeonView>
                  ))}
                </YeonView>
              </YeonView>
            )}

            {gradeResult.feedback.length > 0 && (
              <YeonView>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={CC.panelSubheading}
                >
                  {BAEKJI_SESSION_COPY.feedbackTitle}
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={CC.textBody14Neutral}
                >
                  {gradeResult.feedback}
                </YeonText>
              </YeonView>
            )}

            <YeonView className="flex flex-wrap gap-3">
              <YeonButton
                type="button"
                variant="primary"
                size="md"
                className="gap-1.5"
                onClick={handleNext}
              >
                {BAEKJI_SESSION_COPY.nextButton}
                <YeonIcon name="chevron-right" size={16} aria-hidden="true" />
              </YeonButton>
              <YeonButton
                type="button"
                variant="secondary"
                size="md"
                className="gap-1.5"
                onClick={handleRewrite}
              >
                <YeonIcon name="rotate-cw" size={15} aria-hidden="true" />
                {BAEKJI_SESSION_COPY.rewriteButton}
              </YeonButton>
            </YeonView>
          </YeonView>
        ) : (
          <YeonView className="mt-6 flex flex-col gap-4">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={CC.panelBodyTitle}
            >
              {BAEKJI_SESSION_COPY.writePrompt}
            </YeonText>

            <YeonField
              as="textarea"
              value={userAnswer}
              onChange={(event) => setUserAnswer(event.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={5}
              spellCheck={false}
              aria-label={BAEKJI_SESSION_COPY.inputAriaLabel}
              className={CC.raceInputArea}
              placeholder={BAEKJI_SESSION_COPY.inputPlaceholder}
            />

            {hasGradeError && (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={CC.textError}
              >
                {BAEKJI_SESSION_COPY.gradeError}
              </YeonText>
            )}

            <YeonView className="flex items-center justify-end">
              <YeonButton
                type="button"
                variant="primary"
                size="md"
                disabled={!canGrade}
                onClick={handleGrade}
              >
                {gradeButtonLabel}
              </YeonButton>
            </YeonView>
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
