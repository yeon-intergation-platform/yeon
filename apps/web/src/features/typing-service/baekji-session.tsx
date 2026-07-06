"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import {
  clearYeonInterval,
  getYeonNow,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { TypingServiceHeader } from "./typing-service-header";
import { TYPING_SERVICE_HOME_CLASS as C } from "./typing-service-home.const";
import { TYPING_SERVICE_COMMON_CLASS as CC } from "./typing-service-common.const";
import { calculateAccuracy, calculateTypingSpeedMetrics } from "./race-metrics";
import { getTypingUiText } from "./typing-service-i18n";
import {
  useSelectedTypingDeck,
  useTypingDeckPassages,
  useTypingSettings,
  type TypingDeckPassageOption,
  type TypingLocale,
} from "./use-typing-settings";

// 안 보고 쓰기(blank) 통과 기준 정확도. 이 값 이상이면 "통과", 미만이면 "다시".
const BAEKJI_PASS_ACCURACY = 90 as const;

// 세션 진행 단계. enum 대신 as const + literal union.
const BAEKJI_SESSION_PHASE = {
  writing: "writing",
  graded: "graded",
  summary: "summary",
} as const;
type BaekjiSessionPhase =
  (typeof BAEKJI_SESSION_PHASE)[keyof typeof BAEKJI_SESSION_PHASE];

// 채점 결과 글자 diff 분류. 입력과 원문을 위치별로 비교한다.
const BAEKJI_DIFF_KIND = {
  matched: "matched",
  wrong: "wrong",
  missing: "missing",
} as const;
type BaekjiDiffKind = (typeof BAEKJI_DIFF_KIND)[keyof typeof BAEKJI_DIFF_KIND];

const BAEKJI_DIFF_CLASS: Record<BaekjiDiffKind, string> = {
  matched: "text-[#111]",
  wrong: "bg-[#111] text-white",
  missing: "border-b-2 border-[#aaa] text-[#aaa]",
};

// 백지 세션 한국어 문구. 반복 비교/표시되는 raw 문자열을 상수로 승격.
const BAEKJI_SESSION_COPY = {
  headerTitle: "백지",
  introTitle: "안 보고 쓰기",
  introDescription:
    "원문은 보이지 않습니다. 힌트만 보고 기억으로 문장을 써낸 뒤 채점하세요.",
  loading: "문장을 불러오는 중...",
  loadError: "일부 문장을 불러오지 못해 기본 문장으로 진행합니다.",
  empty: "쓸 문장이 없어요. 백지 홈에서 덱을 먼저 선택해 주세요.",
  progressLabel: "진행",
  deckLabel: "덱",
  charCountLabel: "글자 수",
  firstCharLabel: "첫 글자",
  charCountUnit: "자",
  writePrompt: "이 문장을 기억으로 써보세요",
  inputPlaceholder: "기억나는 대로 입력하세요. 원문은 보이지 않아요.",
  inputAriaLabel: "백지 입력 영역",
  gradeButton: "채점하기",
  passBadge: "통과",
  retryBadge: "다시",
  accuracyLabel: "정확도",
  speedLabel: "속도",
  timeLabel: "시간",
  diffTitle: "입력 vs 원문",
  nextButton: "다음 문장",
  rewriteButton: "다시 쓰기",
  summaryTitle: "백지 세션 완료",
  summarySolvedLabel: "푼 문장",
  summaryAverageLabel: "평균 정확도",
  summaryUnit: "문장",
  homeButton: "백지 홈으로",
} as const;

const RECALL_HOME_HREF = "/recall-service";

type BaekjiGradeResult = {
  prompt: string;
  input: string;
  accuracy: number;
  passed: boolean;
  displaySpeed: number;
  displayUnit: string;
  elapsedSeconds: number;
};

function getFallbackPassage(locale: TypingLocale): TypingDeckPassageOption {
  const raceText = getTypingUiText(locale).race;
  return {
    id: "baekji-fallback",
    title: raceText.fallbackPassageTitle,
    prompt: raceText.fallbackPassagePrompt,
  };
}

type BaekjiDiffCell = { char: string; kind: BaekjiDiffKind; key: string };

// 원문 기준으로 위치별 정오를 만들고, 원문보다 길게 친 초과 입력은 오답으로 덧붙인다.
function buildDiffCells(prompt: string, input: string): BaekjiDiffCell[] {
  const promptChars = Array.from(prompt);
  const inputChars = Array.from(input);
  const cells = promptChars.map((char, index) => {
    const typed = inputChars[index];
    const kind: BaekjiDiffKind =
      typed === undefined
        ? BAEKJI_DIFF_KIND.missing
        : typed === char
          ? BAEKJI_DIFF_KIND.matched
          : BAEKJI_DIFF_KIND.wrong;
    return { char, kind, key: `p-${index}` };
  });
  const overflow = inputChars.slice(promptChars.length).map((char, index) => ({
    char,
    kind: BAEKJI_DIFF_KIND.wrong,
    key: `o-${index}`,
  }));
  return [...cells, ...overflow];
}

export function BaekjiSession() {
  const { settings } = useTypingSettings();
  const locale = settings.locale;
  const deckState = useSelectedTypingDeck(locale);
  const activeDeckId = deckState.selectedDeck.id;
  const activeLanguageTag = deckState.selectedDeck.languageTag;
  const {
    passages,
    loading: passagesLoading,
    error: passagesError,
  } = useTypingDeckPassages(activeDeckId, locale);

  const [phase, setPhase] = useState<BaekjiSessionPhase>(
    BAEKJI_SESSION_PHASE.writing
  );
  const [passageIndex, setPassageIndex] = useState(0);
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gradeResult, setGradeResult] = useState<BaekjiGradeResult | null>(
    null
  );
  // 문장 index별 최고 정확도 스냅샷. "다시 쓰기" 재채점 시 덮어써 중복 집계를 막는다.
  const [accuracyByPassage, setAccuracyByPassage] = useState<
    Record<number, number>
  >({});

  const startedAtRef = useRef<number | null>(null);

  const isBootstrapping =
    !deckState.loaded || deckState.loading || passagesLoading;

  const currentPassage =
    passages[passageIndex] ?? passages[0] ?? getFallbackPassage(locale);
  const promptChars = useMemo(
    () => Array.from(currentPassage.prompt),
    [currentPassage.prompt]
  );

  // 첫 입력 순간부터 경과시간 측정: startedAt(상태) + interval.
  useEffect(() => {
    if (phase !== BAEKJI_SESSION_PHASE.writing || startedAt === null) return;
    const interval = scheduleYeonInterval(() => {
      setElapsedSeconds((getYeonNow() - startedAt) / 1000);
    }, 100);
    return () => clearYeonInterval(interval);
  }, [phase, startedAt]);

  const resetForPassage = () => {
    setInput("");
    setStartedAt(null);
    startedAtRef.current = null;
    setElapsedSeconds(0);
    setGradeResult(null);
    setPhase(BAEKJI_SESSION_PHASE.writing);
  };

  const handleInputChange = (nextValue: string) => {
    setInput(nextValue);
    if (startedAtRef.current === null && nextValue.length > 0) {
      const now = getYeonNow();
      startedAtRef.current = now;
      setStartedAt(now);
    }
  };

  const handleGrade = () => {
    if (input.trim().length === 0) return;
    const prompt = currentPassage.prompt;
    const finalElapsed =
      startedAtRef.current !== null
        ? (getYeonNow() - startedAtRef.current) / 1000
        : 0;
    const accuracy = calculateAccuracy(prompt, input);
    const speed = calculateTypingSpeedMetrics(
      input,
      finalElapsed,
      activeLanguageTag
    );
    setGradeResult({
      prompt,
      input,
      accuracy,
      passed: accuracy >= BAEKJI_PASS_ACCURACY,
      displaySpeed: speed.displaySpeed,
      displayUnit: speed.displayUnit,
      elapsedSeconds: finalElapsed,
    });
    setAccuracyByPassage((prev) => ({ ...prev, [passageIndex]: accuracy }));
    setElapsedSeconds(finalElapsed);
    setPhase(BAEKJI_SESSION_PHASE.graded);
    // TODO(백지 SRS): Spring typing_baekji 진도/간격반복 저장 연결
  };

  const handleNext = () => {
    const isLast = passageIndex >= passages.length - 1;
    if (isLast) {
      setPhase(BAEKJI_SESSION_PHASE.summary);
      return;
    }
    setPassageIndex((index) => index + 1);
    resetForPassage();
  };

  const handleRewrite = () => {
    resetForPassage();
  };

  const handleInputKeyDown = (
    event: YeonKeyboardEvent<YeonTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleGrade();
    }
  };

  const summary = useMemo(() => {
    const values = Object.values(accuracyByPassage);
    const solvedCount = values.length;
    const averageAccuracy =
      solvedCount === 0
        ? 0
        : Math.round(
            values.reduce((sum, value) => sum + value, 0) / solvedCount
          );
    return { solvedCount, averageAccuracy };
  }, [accuracyByPassage]);

  const diffCells = useMemo(
    () =>
      gradeResult ? buildDiffCells(gradeResult.prompt, gradeResult.input) : [],
    [gradeResult]
  );

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

  if (isBootstrapping) {
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

  if (passages.length === 0) {
    return shell(
      <YeonView className="flex flex-col items-start gap-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {BAEKJI_SESSION_COPY.empty}
        </YeonText>
        <YeonLink href={RECALL_HOME_HREF} className={CC.panelGhostButton}>
          {BAEKJI_SESSION_COPY.homeButton}
        </YeonLink>
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
              {summary.averageAccuracy}%
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
  const canGrade = input.trim().length > 0;

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

      {passagesError && (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textError}
        >
          {BAEKJI_SESSION_COPY.loadError}
        </YeonText>
      )}

      <YeonView className="rounded-[20px] border border-[#e5e5e5] bg-white p-5 md:p-6">
        <YeonView className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-[#aaa]">
          <YeonText as="span" variant="unstyled" tone="inherit">
            {BAEKJI_SESSION_COPY.progressLabel} {passageIndex + 1} /{" "}
            {passages.length}
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
            {BAEKJI_SESSION_COPY.deckLabel} {deckState.selectedDeck.title}
          </YeonText>
        </YeonView>

        {isGraded ? (
          <YeonView className="mt-5 flex flex-col gap-5">
            <YeonView className="flex items-end gap-4">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[56px] font-black leading-none tracking-[-0.03em] text-[#111]"
              >
                {gradeResult.accuracy}%
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={
                  gradeResult.passed
                    ? "mb-1 rounded-full bg-[#111] px-3 py-1 text-[13px] font-bold text-white"
                    : "mb-1 rounded-full border border-[#111] px-3 py-1 text-[13px] font-bold text-[#111]"
                }
              >
                {gradeResult.passed
                  ? BAEKJI_SESSION_COPY.passBadge
                  : BAEKJI_SESSION_COPY.retryBadge}
              </YeonText>
            </YeonView>

            <YeonView className={CC.raceStatRowCompact}>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.raceStatLabel}
              >
                {BAEKJI_SESSION_COPY.speedLabel}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.raceResultValue}
              >
                {gradeResult.displaySpeed} {gradeResult.displayUnit}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.raceStatDivider}
              >
                ·
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.raceStatLabel}
              >
                {BAEKJI_SESSION_COPY.timeLabel}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.raceResultValue}
              >
                {gradeResult.elapsedSeconds.toFixed(1)}s
              </YeonText>
            </YeonView>

            <YeonView>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.panelSubheading}
              >
                {BAEKJI_SESSION_COPY.diffTitle}
              </YeonText>
              <YeonView className={CC.racePromptTextPanel}>
                {diffCells.map((cell) => (
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    key={cell.key}
                    className={BAEKJI_DIFF_CLASS[cell.kind]}
                  >
                    {cell.char}
                  </YeonText>
                ))}
              </YeonView>
            </YeonView>

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
          <YeonView className="mt-5 flex flex-col gap-4">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={CC.panelBodyTitle}
            >
              {BAEKJI_SESSION_COPY.writePrompt}
            </YeonText>

            <YeonView className="flex flex-wrap gap-3">
              <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-2">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[12px] text-[#aaa]"
                >
                  {BAEKJI_SESSION_COPY.charCountLabel}
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="ml-2 font-mono text-[14px] font-bold text-[#111]"
                >
                  {promptChars.length}
                  {BAEKJI_SESSION_COPY.charCountUnit}
                </YeonText>
              </YeonView>
              {promptChars.length > 0 && (
                <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-2">
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[12px] text-[#aaa]"
                  >
                    {BAEKJI_SESSION_COPY.firstCharLabel}
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="ml-2 font-mono text-[14px] font-bold text-[#111]"
                  >
                    {promptChars[0]}
                  </YeonText>
                </YeonView>
              )}
            </YeonView>

            <YeonField
              as="textarea"
              value={input}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={4}
              spellCheck={false}
              aria-label={BAEKJI_SESSION_COPY.inputAriaLabel}
              className={CC.raceInputArea}
              placeholder={BAEKJI_SESSION_COPY.inputPlaceholder}
            />

            <YeonView className="flex items-center justify-between">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={CC.subtleInfoMono}
              >
                {elapsedSeconds.toFixed(1)}s
              </YeonText>
              <YeonButton
                type="button"
                variant="primary"
                size="md"
                disabled={!canGrade}
                onClick={handleGrade}
              >
                {BAEKJI_SESSION_COPY.gradeButton}
              </YeonButton>
            </YeonView>
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
