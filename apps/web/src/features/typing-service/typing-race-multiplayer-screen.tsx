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
  YeonProgressBar,
  type YeonClipboardEvent,
  type YeonTextAreaElement,
  type YeonElement,
} from "@yeon/ui";
import {
  clearYeonInterval,
  getYeonNow,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  canShowTypingRoomResults,
  resolveTypingSpeedStyle,
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_SPEED_STYLE,
  type TypingRaceLaneSnapshot,
  type TypingRaceSnapshot,
} from "@yeon/race-shared";
import {
  mountTypingRaceEngine,
  type TypingRaceEngineController,
} from "@yeon/typing-race-engine";
import { findCharacter, toEnginePlayerCharacter } from "./characters";
import { useTypingProfile } from "./use-typing-profile";
import { createTranslator, useTypingSettings } from "./use-typing-settings";
import { TypingServiceHeader } from "./typing-service-header";
import { getTypingUiText } from "./typing-service-i18n";
import type { UseRaceRoomResult } from "./use-race-room";
import {
  getLockedInputLength,
  normalizeTypingInput,
} from "./typing-input-utils";
import {
  calculateAccuracy,
  calculateTypingSpeedMetrics,
  getProgress,
} from "./race-metrics";
export type TypingRaceMultiplayerScreenProps = {
  race: UseRaceRoomResult;
  onRestart?: () => void;
};

export function TypingRaceMultiplayerScreen({
  race,
  onRestart,
}: TypingRaceMultiplayerScreenProps) {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const t = createTranslator(settings.locale);
  const text = getTypingUiText(settings.locale);
  const raceText = text.race;

  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  const engineContainerRef = useRef<YeonElement | null>(null);
  const engineControllerRef = useRef<TypingRaceEngineController | null>(null);
  const textareaRef = useRef<YeonTextAreaElement | null>(null);

  const prompt = race.prompt ?? "";
  const speedSource = race.roomSnapshot?.language ?? settings.locale;
  const speedStyle = resolveTypingSpeedStyle(speedSource);
  const promptChars = useMemo(() => Array.from(prompt), [prompt]);
  const inputChars = useMemo(() => Array.from(input), [input]);
  const lockedLength = useMemo(
    () => getLockedInputLength(promptChars, inputChars),
    [inputChars, promptChars]
  );

  const progress = useMemo(() => getProgress(prompt, input), [prompt, input]);
  const accuracy = useMemo(
    () => calculateAccuracy(prompt, input),
    [prompt, input]
  );
  const speedMetrics = useMemo(
    () => calculateTypingSpeedMetrics(input, elapsedSeconds, speedSource),
    [elapsedSeconds, input, speedSource]
  );
  const { cpm, wpm, displaySpeed, displayUnit, typedUnitCount } = speedMetrics;
  const completed = input.length > 0 && input === prompt;

  const mismatches = useMemo(() => {
    return promptChars.reduce<number[]>((acc, char, idx) => {
      if (inputChars[idx] !== undefined && inputChars[idx] !== char)
        acc.push(idx);
      return acc;
    }, []);
  }, [inputChars, promptChars]);

  useEffect(() => {
    if (race.stage !== TYPING_RACE_STAGE.LIVE || startedAt || completed) return;
    setStartedAt(getYeonNow());
    textareaRef.current?.focus();
  }, [race.stage, startedAt, completed]);

  useEffect(() => {
    if (!startedAt || completed) return;
    const interval = scheduleYeonInterval(() => {
      setElapsedSeconds((getYeonNow() - startedAt) / 1000);
    }, 100);
    return () => clearYeonInterval(interval);
  }, [completed, startedAt]);

  const lastSentProgressRef = useRef(0);
  const sendProgress = race.sendProgress;
  const sendFinish = race.sendFinish;
  const stage = race.stage;
  useEffect(() => {
    if (stage !== TYPING_RACE_STAGE.LIVE) return;
    const now = getYeonNow();
    if (now - lastSentProgressRef.current < 500 && !completed) return;
    lastSentProgressRef.current = now;
    sendProgress({
      progress,
      cpm,
      wpm,
      accuracy,
      mistakeCount,
      elapsedTimeMs: Math.round(elapsedSeconds * 1000),
      typedUnitCount,
    });
  }, [
    accuracy,
    completed,
    cpm,
    elapsedSeconds,
    mistakeCount,
    progress,
    sendProgress,
    stage,
    typedUnitCount,
    wpm,
  ]);

  const finishSentRef = useRef(false);
  useEffect(() => {
    if (!completed || finishSentRef.current) return;
    finishSentRef.current = true;
    sendFinish({
      progress: 100,
      cpm,
      wpm,
      accuracy,
      mistakeCount,
      elapsedTimeMs: Math.round(elapsedSeconds * 1000),
      typedUnitCount,
      finishedAt: getYeonNow(),
    });
  }, [
    accuracy,
    completed,
    cpm,
    elapsedSeconds,
    mistakeCount,
    sendFinish,
    typedUnitCount,
    wpm,
  ]);

  useEffect(() => {
    if (race.stage !== TYPING_RACE_STAGE.COUNTDOWN) return;
    setInput("");
    setStartedAt(null);
    setElapsedSeconds(0);
    setMistakeCount(0);
    finishSentRef.current = false;
    lastSentProgressRef.current = 0;
  }, [prompt, race.roomId, race.stage]);

  useEffect(() => {
    let active = true;
    if (!engineContainerRef.current) return;
    // Wait for profile hydration to avoid mounting with the fallback character.
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

  const displaySnapshot = useMemo<TypingRaceSnapshot | null>(() => {
    if (!race.snapshot) return null;
    const lanes: TypingRaceLaneSnapshot[] = race.snapshot.lanes.map((lane) => {
      if (lane.id === race.mySeat) {
        return {
          ...lane,
          label: profile.nickname,
          accent: TYPING_RACE_LANE_ACCENTS[0],
          role: TYPING_RACE_LANE_ROLE.LOCAL,
          progress,
          cpm,
          wpm,
          displaySpeed,
        };
      }
      return lane;
    });
    return { ...race.snapshot, lanes, speedUnit: displayUnit };
  }, [
    race.snapshot,
    race.mySeat,
    profile.nickname,
    progress,
    cpm,
    wpm,
    displaySpeed,
    displayUnit,
  ]);

  useEffect(() => {
    if (!displaySnapshot) return;
    engineControllerRef.current?.setSnapshot(displaySnapshot);
  }, [displaySnapshot]);

  const resetRaceState = () => {
    setInput("");
    setStartedAt(null);
    setElapsedSeconds(0);
    setMistakeCount(0);
    finishSentRef.current = false;
    lastSentProgressRef.current = 0;
  };

  const handleRestart = () => {
    resetRaceState();
    if (onRestart) {
      onRestart();
      return;
    }
    race.rejoin();
  };

  const handleInputChange = (nextRawValue: string) => {
    const nextInput = normalizeTypingInput(nextRawValue, promptChars.length);
    const nextChars = Array.from(nextInput);
    let addedMistakes = 0;

    nextChars.forEach((char, index) => {
      if (inputChars[index] !== char && char !== promptChars[index]) {
        addedMistakes += 1;
      }
    });

    if (addedMistakes > 0) setMistakeCount((count) => count + addedMistakes);
    setInput(nextInput);
  };

  const handleClipboardBlock = (
    event: YeonClipboardEvent<YeonTextAreaElement>
  ) => {
    event.preventDefault();
  };

  const inCountdown = race.stage === TYPING_RACE_STAGE.COUNTDOWN;
  const results = race.results;
  const roomParticipants = race.roomSnapshot?.participants ?? [];
  const myResult = results.find((result) => result.userId === race.mySeat);
  const hasResults = results.length > 0;
  const showResults = canShowTypingRoomResults(race.roomSnapshot, race.mySeat);

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
            {race.snapshot?.roundLabel === "flow-focus"
              ? t("roundFlowFocus")
              : (race.snapshot?.roundLabel ?? "")}
          </YeonText>
        }
      />

      <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceViewportPadding}>
        <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceEngineFrame}>
          <YeonView
            ref={engineContainerRef}
            className={TYPING_SERVICE_COMMON_CLASS.raceEngineCanvas}
          />
        </YeonView>

        <YeonView className={TYPING_SERVICE_COMMON_CLASS.raceStatRowCompact}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
          >
            {speedStyle === TYPING_SPEED_STYLE.KO_JASO
              ? raceText.speedLabel
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
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
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
                className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
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
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
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
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
          >
            {raceText.progress}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-label={raceText.progress}
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
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
          >
            {raceText.mistakes}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.titleStatValue}
          >
            {mistakeCount}
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
            className={TYPING_SERVICE_COMMON_CLASS.raceStatLabel}
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

        <YeonView className="mt-3 grid gap-2 rounded-lg border border-[#e5e5e5] bg-white px-5 py-4">
          <YeonView
            className={`flex items-center justify-between ${SHARED_FEATURE_CLASS.text13PrimaryBold}`}
          >
            <YeonText as="span" variant="unstyled" tone="inherit">
              {raceText.liveProgress}
            </YeonText>
            {myResult && (
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[#111]"
              >
                {raceText.currentRank(myResult.rank)}
              </YeonText>
            )}
          </YeonView>
          {roomParticipants.map((participant) => (
            <YeonView
              key={participant.id}
              aria-label={raceText.participantProgressLabel(participant.label)}
              className="grid gap-1"
            >
              <YeonView
                className={`flex items-center justify-between ${SHARED_FEATURE_CLASS.text12Neutral}`}
              >
                <YeonText as="span" variant="unstyled" tone="inherit">
                  {participant.label}
                  {participant.id === race.mySeat ? raceText.meSuffix : ""}
                </YeonText>
                <YeonText as="span" variant="unstyled" tone="inherit">
                  {participant.progress}% ·{" "}
                  {speedStyle === TYPING_SPEED_STYLE.KO_JASO
                    ? `${participant.cpm} ${displayUnit}`
                    : `${participant.wpm} WPM`}{" "}
                  · {raceText.accuracy} {participant.accuracy}%
                </YeonText>
              </YeonView>
              <YeonProgressBar
                label={raceText.participantProgressLabel(participant.label)}
                value={participant.progress}
              />
            </YeonView>
          ))}
        </YeonView>

        {showResults && (
          <YeonView className="mt-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
            <YeonView className={SHARED_FEATURE_CLASS.alignBetweenGap3}>
              <YeonView>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#111]"
                >
                  Result
                </YeonText>
                <YeonText
                  as="h2"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 text-[22px] font-black tracking-[-0.03em]"
                >
                  {raceText.resultTitle}
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

            <YeonView className="mt-4 grid gap-3 md:grid-cols-2">
              {results.map((result) => (
                <YeonView
                  key={result.userId}
                  className={SHARED_FEATURE_CLASS.panelCard}
                >
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[13px] font-bold text-[#aaa]"
                  >
                    {raceText.rank(result.rank)}
                  </YeonText>
                  <YeonText
                    as="h3"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 text-[18px] font-black"
                  >
                    {result.label}
                  </YeonText>
                  <YeonView className="mt-3 grid grid-cols-2 gap-2 font-mono text-[12px]">
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      {speedStyle === TYPING_SPEED_STYLE.KO_JASO
                        ? raceText.speedLabel
                        : "WPM"}{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {speedStyle === TYPING_SPEED_STYLE.KO_JASO
                          ? result.cpm
                          : result.wpm}
                      </YeonText>
                    </YeonText>
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      CPM{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {result.cpm}
                      </YeonText>
                    </YeonText>
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      {raceText.accuracy}{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {result.accuracy}%
                      </YeonText>
                    </YeonText>
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      {raceText.mistakes}{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {result.mistakeCount}
                      </YeonText>
                    </YeonText>
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      {raceText.time}{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {(result.elapsedTimeMs / 1000).toFixed(1)}s
                      </YeonText>
                    </YeonText>
                    <YeonText as="span" variant="unstyled" tone="inherit">
                      {raceText.score}{" "}
                      <YeonText
                        as="strong"
                        variant="unstyled"
                        tone="inherit"
                        className={
                          TYPING_SERVICE_COMMON_CLASS.metricResultValue
                        }
                      >
                        {result.score}
                      </YeonText>
                    </YeonText>
                  </YeonView>
                </YeonView>
              ))}
              {!hasResults && (
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white p-5 text-[14px] text-[#666]"
                >
                  {raceText.collectingResults}
                </YeonText>
              )}
            </YeonView>
          </YeonView>
        )}

        {!showResults && (
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
                    key={`${index}-${char}`}
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
              disabled={inCountdown}
              rows={3}
              spellCheck={false}
              aria-label={t("typingInputLabel")}
              className={TYPING_SERVICE_COMMON_CLASS.raceInputArea}
              placeholder={
                inCountdown
                  ? `${race.countdownRemaining}${t("startingIn")}`
                  : t("typeHere")
              }
            />
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
