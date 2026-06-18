"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonText,
  YeonView,
  type YeonClipboardEvent,
  type YeonTextAreaElement,
  type YeonElement,
} from "@yeon/ui";
import {
  clearYeonInterval,
  clearYeonTimeout,
  getYeonNow,
  getYeonRandom,
  scheduleYeonInterval,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_SPEED_STYLE,
  clampRaceProgress,
  countTypingMetricUnits,
  resolveTypingSpeedStyle,
  toWpmFromCpm,
  type TypingRaceSnapshot,
} from "@yeon/race-shared";
import {
  mountTypingRaceEngine,
  type TypingRaceEngineController,
} from "@yeon/typing-race-engine";
import { findCharacter, toEnginePlayerCharacter } from "./characters";
import { useTypingProfile } from "./use-typing-profile";
import {
  createTranslator,
  useSelectedTypingDeck,
  useTypingDeckPassages,
  useTypingSettings,
  type TypingDeckPassageOption,
  type TypingLocale,
} from "./use-typing-settings";
import { TypingServiceHeader } from "./typing-service-header";
import { getTypingUiText } from "./typing-service-i18n";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  calculateAccuracy,
  calculateTypingSpeedMetrics,
  getProgress,
} from "./race-metrics";
import {
  applyTypingInputClamp,
  getLockedInputLength,
} from "./typing-input-utils";

const BENCHMARK_LANES = [
  {
    id: "benchmark-1",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 0.4,
    accent: TYPING_RACE_LANE_ACCENTS[1],
  },
  {
    id: "benchmark-2",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 0.7,
    accent: TYPING_RACE_LANE_ACCENTS[2],
  },
  {
    id: "benchmark-3",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 1.1,
    accent: TYPING_RACE_LANE_ACCENTS[3],
  },
] as const;

function getFallbackPassage(locale: TypingLocale): TypingDeckPassageOption {
  const text = getTypingUiText(locale).race;
  return {
    id: "fallback-empty",
    title: text.fallbackPassageTitle,
    prompt: text.fallbackPassagePrompt,
  };
}

function pickInitialPassage(
  passages: readonly TypingDeckPassageOption[],
  locale: TypingLocale
) {
  return passages[0] ?? getFallbackPassage(locale);
}

function pickNextPassage(
  passages: readonly TypingDeckPassageOption[],
  locale: TypingLocale,
  currentId?: string
) {
  const candidates = passages.length > 0 ? passages : [];
  if (candidates.length === 0) return getFallbackPassage(locale);
  if (candidates.length === 1) return candidates[0]!;
  const available = currentId
    ? candidates.filter((passage) => passage.id !== currentId)
    : candidates;
  return (
    available[Math.floor(getYeonRandom() * available.length)] ?? candidates[0]!
  );
}

type BenchmarkNoiseTimingState = {
  nextChangeAt: number;
  prevEffectiveSec: number;
  pauseAt: number | null;
  pausedUntil: number | null;
};

type BenchmarkNoiseProgressState = {
  noise: number;
  accChars: number;
  finishedCpm: number | null;
  giveUpAt: number | null;
};

type BenchmarkNoiseState = BenchmarkNoiseTimingState &
  BenchmarkNoiseProgressState;

function createBenchmarkNoiseStates(): BenchmarkNoiseState[] {
  return BENCHMARK_LANES.map(() => ({
    noise: 1.0,
    nextChangeAt: 0,
    accChars: 0,
    prevEffectiveSec: 0,
    finishedCpm: null,
    giveUpAt: getYeonRandom() < 1 / 25 ? 0.25 + getYeonRandom() * 0.45 : null,
    pauseAt: getYeonRandom() < 1 / 20 ? 0.2 + getYeonRandom() * 0.6 : null,
    pausedUntil: null,
  }));
}

export type TypingRaceSoloScreenProps = {
  practiceDeckId?: string | null;
  offlineReason?: string | null;
  retryLabel?: string;
  onRetryMultiplayer?: () => void;
};

export function TypingRaceSoloScreen({
  practiceDeckId,
  offlineReason,
  retryLabel,
  onRetryMultiplayer,
}: TypingRaceSoloScreenProps) {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const text = getTypingUiText(settings.locale);
  const raceText = text.race;
  const deckState = useSelectedTypingDeck(settings.locale);
  const activeDeckId = practiceDeckId ?? deckState.selectedDeck.id;
  const activeDeckTitle =
    practiceDeckId === null || practiceDeckId === undefined
      ? deckState.selectedDeck.title
      : (deckState.decks.find((deck) => deck.id === practiceDeckId)?.title ??
        raceText.selectedPracticeDeck);
  const {
    passages,
    loading: passagesLoading,
    error: passagesError,
  } = useTypingDeckPassages(activeDeckId, settings.locale);
  const activeLanguageTag =
    practiceDeckId === null || practiceDeckId === undefined
      ? deckState.selectedDeck.languageTag
      : (deckState.decks.find((deck) => deck.id === practiceDeckId)
          ?.languageTag ?? deckState.selectedDeck.languageTag);
  const speedStyle = resolveTypingSpeedStyle(activeLanguageTag);
  const t = createTranslator(settings.locale);
  const [passage, setPassage] = useState<TypingDeckPassageOption>(() =>
    pickInitialPassage(passages, settings.locale)
  );
  const [input, setInput] = useState("");
  const [countdownRemaining, setCountdownRemaining] = useState<number>(
    TYPING_RACE_DEFAULTS.countdownSeconds
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const engineContainerRef = useRef<YeonElement | null>(null);
  const engineControllerRef = useRef<TypingRaceEngineController | null>(null);
  const textareaRef = useRef<YeonTextAreaElement | null>(null);
  const hasTrackedTypingStartRef = useRef(false);
  const benchmarkNoiseRef = useRef<BenchmarkNoiseState[]>(
    createBenchmarkNoiseStates()
  );
  const startedTrackedRef = useRef(false);
  const completedTrackedRef = useRef(false);

  useEffect(() => {
    if (input.length > 0) return;
    setPassage((current) =>
      passages.some((candidate) => candidate.id === current.id)
        ? current
        : pickInitialPassage(passages, settings.locale)
    );
  }, [input.length, passages, settings.locale]);

  const promptChars = useMemo(
    () => Array.from(passage.prompt),
    [passage.prompt]
  );
  const inputChars = useMemo(() => Array.from(input), [input]);
  const lockedLength = useMemo(
    () => getLockedInputLength(promptChars, inputChars),
    [inputChars, promptChars]
  );

  const progress = useMemo(
    () => getProgress(passage.prompt, input),
    [passage.prompt, input]
  );
  const accuracy = useMemo(
    () => calculateAccuracy(passage.prompt, input),
    [passage.prompt, input]
  );
  const speedMetrics = useMemo(
    () => calculateTypingSpeedMetrics(input, elapsedSeconds, activeLanguageTag),
    [activeLanguageTag, elapsedSeconds, input]
  );
  const { cpm, wpm, displaySpeed, displayUnit } = speedMetrics;
  const completed = input === passage.prompt;

  const raceStage = completed
    ? TYPING_RACE_STAGE.FINISHED
    : countdownRemaining > 0
      ? TYPING_RACE_STAGE.COUNTDOWN
      : TYPING_RACE_STAGE.LIVE;

  const mismatches = useMemo(() => {
    return promptChars.reduce<number[]>((acc, char, idx) => {
      if (inputChars[idx] !== undefined && inputChars[idx] !== char)
        acc.push(idx);
      return acc;
    }, []);
  }, [inputChars, promptChars]);

  useEffect(() => {
    if (countdownRemaining <= 0 || completed) return;
    const timeout = scheduleYeonTimeout(() => {
      setCountdownRemaining((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearYeonTimeout(timeout);
  }, [completed, countdownRemaining]);

  useEffect(() => {
    if (countdownRemaining !== 0 || startedAt || completed) return;
    setStartedAt(getYeonNow());
    if (!startedTrackedRef.current) {
      startedTrackedRef.current = true;
      trackEvent(analyticsEvents.typingPracticeStart, {
        deck_id: activeDeckId,
        deck_title: activeDeckTitle,
        language_tag: activeLanguageTag,
        source: practiceDeckId
          ? "practice_deck"
          : offlineReason
            ? "play_fallback"
            : "solo_play",
      });
    }
    textareaRef.current?.focus();
  }, [completed, countdownRemaining, startedAt]);

  useEffect(() => {
    if (!completed || completedTrackedRef.current) {
      return;
    }

    completedTrackedRef.current = true;
    trackEvent(analyticsEvents.typingPracticeComplete, {
      deck_id: activeDeckId,
      deck_title: activeDeckTitle,
      language_tag: activeLanguageTag,
      accuracy,
      cpm,
      wpm,
      elapsed_seconds: Number(elapsedSeconds.toFixed(1)),
      prompt_length: passage.prompt.length,
    });
  }, [
    accuracy,
    activeDeckId,
    activeDeckTitle,
    activeLanguageTag,
    completed,
    cpm,
    elapsedSeconds,
    passage.prompt.length,
    wpm,
  ]);

  useEffect(() => {
    if (!startedAt || completed) return;
    const interval = scheduleYeonInterval(() => {
      setElapsedSeconds((getYeonNow() - startedAt) / 1000);
    }, 100);
    return () => clearYeonInterval(interval);
  }, [completed, startedAt]);

  useEffect(() => {
    if (hasTrackedTypingStartRef.current) {
      return;
    }

    if (!startedAt || input.length === 0) {
      return;
    }

    hasTrackedTypingStartRef.current = true;
    trackEvent("typing_start", {
      source: practiceDeckId ? "typing_practice" : "typing_play",
      deck_id: activeDeckId,
      deck_title: activeDeckTitle,
      language: settings.locale,
    });
  }, [
    activeDeckId,
    activeDeckTitle,
    input.length,
    practiceDeckId,
    settings.locale,
    startedAt,
  ]);

  useEffect(() => {
    let active = true;
    if (!engineContainerRef.current) return;
    // Avoid starting with the default character before profile hydration.
    if (!profileLoaded) return;

    const mountPromise = mountTypingRaceEngine({
      container: engineContainerRef.current,
      playerCharacter: toEnginePlayerCharacter(
        findCharacter(profile.characterId)
      ),
    });
    mountPromise.then((controller) => {
      if (!active) return;
      engineControllerRef.current = controller;
    });

    return () => {
      active = false;
      engineControllerRef.current = null;
      mountPromise
        .then((controller) => {
          controller.destroy();
        })
        .catch(() => {
          /* ignore */
        });
    };
  }, [profile.characterId, profileLoaded]);

  const snapshot = useMemo<TypingRaceSnapshot>(() => {
    const promptLength = Math.max(1, promptChars.length);
    const promptTypingUnits = Math.max(
      1,
      countTypingMetricUnits(passage.prompt, speedStyle)
    );
    const averageUnitsPerChar = promptTypingUnits / promptLength;

    const benchmarkLanes = BENCHMARK_LANES.map((lane, index) => {
      const effectiveSeconds =
        raceStage === TYPING_RACE_STAGE.COUNTDOWN
          ? 0
          : Math.max(0, elapsedSeconds - lane.startDelay);

      const noiseState = benchmarkNoiseRef.current[index]!;
      if (effectiveSeconds > 0 && effectiveSeconds >= noiseState.nextChangeAt) {
        noiseState.noise = 0.6 + getYeonRandom() * 0.8;
        noiseState.nextChangeAt =
          effectiveSeconds + 0.3 + getYeonRandom() * 1.2;
      }

      const progressRatio = noiseState.accChars / promptLength;
      const alreadyGaveUp =
        noiseState.giveUpAt !== null && progressRatio >= noiseState.giveUpAt;

      if (
        noiseState.pauseAt !== null &&
        progressRatio >= noiseState.pauseAt &&
        noiseState.pausedUntil === null
      ) {
        noiseState.pausedUntil = effectiveSeconds + 2;
        noiseState.pauseAt = null;
      }
      const isPausing =
        noiseState.pausedUntil !== null &&
        effectiveSeconds < noiseState.pausedUntil;

      if (effectiveSeconds > 0 && !alreadyGaveUp && !isPausing) {
        const delta = effectiveSeconds - noiseState.prevEffectiveSec;
        if (delta > 0) {
          noiseState.accChars +=
            delta *
            (lane.cpm / averageUnitsPerChar / 60) *
            lane.multiplier *
            noiseState.noise;
        }
      }
      noiseState.prevEffectiveSec = effectiveSeconds;
      const simulatedChars = noiseState.accChars;
      const laneProgress = clampRaceProgress(
        (simulatedChars / promptLength) * 100
      );

      if (
        laneProgress >= 100 &&
        noiseState.finishedCpm === null &&
        effectiveSeconds > 0
      ) {
        noiseState.finishedCpm = Math.round(
          ((simulatedChars * averageUnitsPerChar) / effectiveSeconds) * 60
        );
      }

      const laneCpm = noiseState.finishedCpm ?? 0;
      const laneWpm =
        speedStyle === TYPING_SPEED_STYLE.KO_JASO ? 0 : toWpmFromCpm(laneCpm);

      return {
        id: lane.id,
        label: raceText.opponent,
        accent: lane.accent,
        role: TYPING_RACE_LANE_ROLE.BENCHMARK,
        progress: laneProgress,
        cpm: laneCpm,
        wpm: laneWpm,
        displaySpeed:
          speedStyle === TYPING_SPEED_STYLE.KO_JASO ? laneCpm : laneWpm,
      };
    });

    return {
      stage: raceStage,
      countdownRemaining,
      headline: "",
      subheadline: "",
      roundLabel: passage.title,
      speedUnit: displayUnit,
      lanes: [
        {
          id: "local-player",
          label: profile.nickname,
          accent: TYPING_RACE_LANE_ACCENTS[0],
          role: TYPING_RACE_LANE_ROLE.LOCAL,
          progress,
          cpm,
          wpm,
          displaySpeed,
        },
        ...benchmarkLanes,
      ],
    };
  }, [
    countdownRemaining,
    cpm,
    displaySpeed,
    displayUnit,
    elapsedSeconds,
    passage.title,
    passage.prompt,
    profile.nickname,
    progress,
    raceText.opponent,
    promptChars.length,
    raceStage,
    speedStyle,
    wpm,
  ]);

  useEffect(() => {
    engineControllerRef.current?.setSnapshot(snapshot);
  }, [snapshot]);

  const handleRestart = () => {
    benchmarkNoiseRef.current = createBenchmarkNoiseStates();
    startedTrackedRef.current = false;
    completedTrackedRef.current = false;
    setPassage((current) =>
      pickNextPassage(passages, settings.locale, current.id)
    );
    setInput("");
    setCountdownRemaining(TYPING_RACE_DEFAULTS.countdownSeconds);
    setStartedAt(null);
    setElapsedSeconds(0);
  };

  const handleInputChange = (nextRawValue: string) => {
    const { nextInput } = applyTypingInputClamp(
      nextRawValue,
      promptChars,
      input
    );
    setInput(nextInput);
  };

  const handleClipboardBlock = (
    event: YeonClipboardEvent<YeonTextAreaElement>
  ) => {
    event.preventDefault();
  };

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="race"
        title={text.header.raceTitle}
        controls={
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.subtleInfoMono}
          >
            {activeDeckTitle} · {passage.title}
          </YeonText>
        }
      />

      {offlineReason && (
        <YeonView className="border-b border-[#e5e5e5] bg-[#fafafa] px-6 py-2 text-[12px] text-[#666]">
          <YeonView className="flex items-center justify-between px-6 md:px-10">
            <YeonText as="span" variant="unstyled" tone="inherit">
              {offlineReason}
            </YeonText>
            {onRetryMultiplayer && (
              <YeonButton
                type="button"
                onClick={onRetryMultiplayer}
                variant="secondary"
                size="sm"
                className="rounded px-2 py-0.5 text-[11px]"
              >
                {retryLabel ?? t("reconnect")}
              </YeonButton>
            )}
          </YeonView>
        </YeonView>
      )}

      {(deckState.loading ||
        passagesLoading ||
        deckState.error ||
        passagesError) && (
        <YeonView
          className={`border-b border-[#e5e5e5] bg-[#fafafa] px-6 py-2 ${SHARED_FEATURE_CLASS.text12Subtle}`}
        >
          <YeonView>
            {deckState.loading || passagesLoading
              ? raceText.loadingPracticeDeck
              : (deckState.error ?? passagesError)}
          </YeonView>
        </YeonView>
      )}

      <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceViewportPadding}>
        <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceEngineFrame}>
          <YeonView
            ref={engineContainerRef}
            className={TYPING_SERVICE_COMMON_CLASS.raceEngineCanvas}
          />
        </YeonView>

        <YeonView
          className={`${TYPING_SERVICE_COMMON_CLASS.raceStatRowBase} flex-wrap gap-x-6 gap-y-2`}
        >
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {speedStyle === TYPING_SPEED_STYLE.KO_JASO
              ? raceText.typingUnits
              : "WPM"}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
          >
            {displaySpeed}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {displayUnit}
          </YeonText>
          {speedStyle !== TYPING_SPEED_STYLE.KO_JASO && (
            <>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
              >
                ·
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[13px] text-[#666]"
              >
                CPM
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
              >
                {cpm}
              </YeonText>
            </>
          )}
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
          >
            ·
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {raceText.accuracy}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
          >
            {accuracy}%
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
          >
            ·
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {raceText.progress}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
          >
            {progress}%
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}
          >
            ·
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {raceText.time}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
          >
            {elapsedSeconds.toFixed(1)}s
          </YeonText>
        </YeonView>

        {completed && (
          <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceResultCard}>
            <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceStatValueRow}>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
              >
                {t("result")}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={TYPING_SERVICE_COMMON_CLASS.metricValue}
                >
                  {displaySpeed}
                </YeonText>{" "}
                {displayUnit}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={TYPING_SERVICE_COMMON_CLASS.metricValue}
                >
                  {accuracy}
                </YeonText>{" "}
                {t("accuracy")}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={TYPING_SERVICE_COMMON_CLASS.metricValue}
                >
                  {elapsedSeconds.toFixed(1)}
                </YeonText>
                s
              </YeonText>
            </YeonView>
            <YeonButton
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleRestart}
            >
              <YeonIcon name="rotate-cw" size={13} />
              {t("restart")}
            </YeonButton>
          </YeonView>
        )}

        {!completed && (
          <YeonView className={TYPING_SERVICE_COMMON_CLASS.sectionBodyGap3}>
            <YeonView
              className={TYPING_SERVICE_COMMON_CLASS.racePromptTextPanel}
            >
              {promptChars.map((char, index) => {
                const typed = inputChars[index];
                const isCurrent = index === inputChars.length;
                const isMismatch = mismatches.includes(index);
                const isMatched = typed === char;
                const isLocked = index < lockedLength;

                return (
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    key={`${passage.id}-${index}`}
                    className={
                      isMismatch
                        ? TYPING_SERVICE_COMMON_CLASS.racePromptMismatchChar
                        : isMatched || isLocked
                          ? TYPING_SERVICE_COMMON_CLASS.racePromptMatchedChar
                          : isCurrent
                            ? "border-b-2 border-[#111] bg-white text-[#111]"
                            : TYPING_SERVICE_COMMON_CLASS.racePromptPendingChar
                    }
                  >
                    {char}
                  </YeonText>
                );
              })}
            </YeonView>

            <YeonField
              as="textarea"
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onCopy={handleClipboardBlock}
              onCut={handleClipboardBlock}
              onPaste={handleClipboardBlock}
              disabled={countdownRemaining > 0}
              rows={3}
              spellCheck={false}
              aria-label={t("typingInputLabel")}
              className={TYPING_SERVICE_COMMON_CLASS.raceInputArea}
              placeholder={
                countdownRemaining > 0
                  ? `${countdownRemaining}${t("startingIn")}`
                  : t("typeHere")
              }
            />
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
