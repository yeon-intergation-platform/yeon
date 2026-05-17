"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent } from "react";
import { RotateCcw } from "lucide-react";
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
} from "./use-typing-settings";
import { TypingServiceHeader } from "./typing-service-header";
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
    label: "Guest",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 0.4,
    accent: TYPING_RACE_LANE_ACCENTS[1],
  },
  {
    id: "benchmark-2",
    label: "Guest",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 0.7,
    accent: TYPING_RACE_LANE_ACCENTS[2],
  },
  {
    id: "benchmark-3",
    label: "Guest",
    cpm: 270,
    multiplier: 1.0,
    startDelay: 1.1,
    accent: TYPING_RACE_LANE_ACCENTS[3],
  },
] as const;

function pickNextPassage(
  passages: readonly TypingDeckPassageOption[],
  currentId?: string
) {
  const candidates = passages.length > 0 ? passages : [];
  if (candidates.length === 0) {
    return {
      id: "fallback-empty",
      title: "기본 문장",
      prompt:
        "오늘도 한 문장씩 정확하게 입력하면 손끝의 리듬이 조금씩 살아납니다.",
    } satisfies TypingDeckPassageOption;
  }
  if (candidates.length === 1) return candidates[0]!;
  const available = currentId
    ? candidates.filter((passage) => passage.id !== currentId)
    : candidates;
  return (
    available[Math.floor(Math.random() * available.length)] ?? candidates[0]!
  );
}

type BenchmarkNoiseState = {
  noise: number;
  nextChangeAt: number;
  accChars: number;
  prevEffectiveSec: number;
  finishedCpm: number | null;
  giveUpAt: number | null;
  pauseAt: number | null;
  pausedUntil: number | null;
};

function createBenchmarkNoiseStates(): BenchmarkNoiseState[] {
  return BENCHMARK_LANES.map(() => ({
    noise: 1.0,
    nextChangeAt: 0,
    accChars: 0,
    prevEffectiveSec: 0,
    finishedCpm: null,
    giveUpAt: Math.random() < 1 / 25 ? 0.25 + Math.random() * 0.45 : null,
    pauseAt: Math.random() < 1 / 20 ? 0.2 + Math.random() * 0.6 : null,
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
  const deckState = useSelectedTypingDeck(settings.locale);
  const activeDeckId = practiceDeckId ?? deckState.selectedDeck.id;
  const activeDeckTitle =
    practiceDeckId === null || practiceDeckId === undefined
      ? deckState.selectedDeck.title
      : (deckState.decks.find((deck) => deck.id === practiceDeckId)?.title ??
        "선택한 연습 덱");
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
    pickNextPassage(passages)
  );
  const [input, setInput] = useState("");
  const [countdownRemaining, setCountdownRemaining] = useState<number>(
    TYPING_RACE_DEFAULTS.countdownSeconds
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const engineContainerRef = useRef<HTMLDivElement | null>(null);
  const engineControllerRef = useRef<TypingRaceEngineController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
        : pickNextPassage(passages, current.id)
    );
  }, [input.length, passages]);

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
    const timeout = window.setTimeout(() => {
      setCountdownRemaining((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [completed, countdownRemaining]);

  useEffect(() => {
    if (countdownRemaining !== 0 || startedAt || completed) return;
    setStartedAt(Date.now());
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
    const interval = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000);
    }, 100);
    return () => window.clearInterval(interval);
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
    // 프로필 hydrate 전에 마운트하면 default 캐릭터로 잘못 시작 → 깜빡임 방지.
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
        noiseState.noise = 0.6 + Math.random() * 0.8;
        noiseState.nextChangeAt = effectiveSeconds + 0.3 + Math.random() * 1.2;
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
        label: lane.label,
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
    setPassage((current) => pickNextPassage(passages, current.id));
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

  const handleClipboardBlock = (event: ClipboardEvent) => {
    event.preventDefault();
  };

  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="race"
        title="YEON 레이스"
        controls={
          <span className={TYPING_SERVICE_COMMON_CLASS.subtleInfoMono}>
            {activeDeckTitle} · {passage.title}
          </span>
        }
      />

      {offlineReason && (
        <div className="border-b border-[#fcd34d] bg-[#fef3c7] px-6 py-2 text-[12px] text-[#92400e]">
          <div className="flex items-center justify-between px-6 md:px-10">
            <span>{offlineReason}</span>
            {onRetryMultiplayer && (
              <button
                type="button"
                onClick={onRetryMultiplayer}
                className="rounded border border-[#f59e0b] px-2 py-0.5 text-[11px] font-medium text-[#92400e] hover:bg-[#fde68a]"
              >
                {retryLabel ?? "재연결"}
              </button>
            )}
          </div>
        </div>
      )}

      {(deckState.loading ||
        passagesLoading ||
        deckState.error ||
        passagesError) && (
        <div
          className={`border-b border-[#e5e5e5] bg-[#fafafa] px-6 py-2 ${SHARED_FEATURE_CLASS.text12Subtle}`}
        >
          <div>
            {deckState.loading || passagesLoading
              ? "선택한 연습 덱을 불러오는 중..."
              : (deckState.error ?? passagesError)}
          </div>
        </div>
      )}

      <div className={TYPING_SERVICE_COMMON_CLASS.raceViewportPadding}>
        <div className={TYPING_SERVICE_COMMON_CLASS.raceEngineFrame}>
          <div
            ref={engineContainerRef}
            className={TYPING_SERVICE_COMMON_CLASS.raceEngineCanvas}
          />
        </div>

        <div className={TYPING_SERVICE_COMMON_CLASS.raceStatRowBase}>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
            {speedStyle === TYPING_SPEED_STYLE.KO_JASO ? "타수" : "WPM"}
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
            {displaySpeed}
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
            {displayUnit}
          </span>
          {speedStyle !== TYPING_SPEED_STYLE.KO_JASO && (
            <>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>
                ·
              </span>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
                CPM
              </span>
              <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
                {cpm}
              </span>
            </>
          )}
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>acc</span>
          <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
            {accuracy}%
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
            progress
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
            {progress}%
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatDivider}>·</span>
          <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
            time
          </span>
          <span className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}>
            {elapsedSeconds.toFixed(1)}s
          </span>
        </div>

        {completed && (
          <div className={TYPING_SERVICE_COMMON_CLASS.raceResultCard}>
            <div className={TYPING_SERVICE_COMMON_CLASS.raceStatValueRow}>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}>
                {t("result")}
              </span>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
                <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                  {displaySpeed}
                </span>{" "}
                {displayUnit}
              </span>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
                <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                  {accuracy}
                </span>{" "}
                {t("accuracy")}
              </span>
              <span className={TYPING_SERVICE_COMMON_CLASS.raceResultValue}>
                <span className={TYPING_SERVICE_COMMON_CLASS.metricValue}>
                  {elapsedSeconds.toFixed(1)}
                </span>
                s
              </span>
            </div>
            <button
              type="button"
              className={SHARED_FEATURE_CLASS.smallInlineActionButton}
              onClick={handleRestart}
            >
              <RotateCcw size={13} />
              {t("restart")}
            </button>
          </div>
        )}

        {!completed && (
          <div className={TYPING_SERVICE_COMMON_CLASS.sectionBodyGap3}>
            <div className={TYPING_SERVICE_COMMON_CLASS.racePromptTextPanel}>
              {promptChars.map((char, index) => {
                const typed = inputChars[index];
                const isCurrent = index === inputChars.length;
                const isMismatch = mismatches.includes(index);
                const isMatched = typed === char;
                const isLocked = index < lockedLength;

                return (
                  <span
                    key={`${passage.id}-${index}`}
                    className={
                      isMismatch
                        ? TYPING_SERVICE_COMMON_CLASS.racePromptMismatchChar
                        : isMatched || isLocked
                          ? TYPING_SERVICE_COMMON_CLASS.racePromptMatchedChar
                          : isCurrent
                            ? TYPING_SERVICE_COMMON_CLASS.racePromptCurrentChar
                            : TYPING_SERVICE_COMMON_CLASS.racePromptPendingChar
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            <textarea
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
          </div>
        )}
      </div>
    </div>
  );
}
