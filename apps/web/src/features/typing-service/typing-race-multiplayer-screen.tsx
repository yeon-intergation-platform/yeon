"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_ROOM_STATUS,
  toWpmFromCpm,
  type TypingRaceLaneSnapshot,
  type TypingRaceSnapshot,
} from "@yeon/race-shared";
import {
  mountTypingRaceEngine,
  type TypingRaceEngineController,
} from "@yeon/typing-race-engine";
import { useTypingProfile } from "./use-typing-profile";
import { TypingBgmButton } from "./typing-bgm-button";
import { createTranslator, useTypingSettings } from "./use-typing-settings";
import { TypingSettingsButton } from "./typing-settings-button";
import { TypingServiceHeader } from "./typing-service-header";
import type { UseRaceRoomResult } from "./use-race-room";
import {
  calculateAccuracy,
  calculateTypingSpeed,
  getProgress,
} from "./race-metrics";

export type TypingRaceMultiplayerScreenProps = {
  race: UseRaceRoomResult;
};

export function TypingRaceMultiplayerScreen({
  race,
}: TypingRaceMultiplayerScreenProps) {
  const { profile } = useTypingProfile();
  const { settings } = useTypingSettings();
  const t = createTranslator(settings.locale);

  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  const engineContainerRef = useRef<HTMLDivElement | null>(null);
  const engineControllerRef = useRef<TypingRaceEngineController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const prompt = race.prompt ?? "";
  const promptChars = useMemo(() => Array.from(prompt), [prompt]);
  const inputChars = useMemo(() => Array.from(input), [input]);

  const progress = useMemo(() => getProgress(prompt, input), [prompt, input]);
  const accuracy = useMemo(
    () => calculateAccuracy(prompt, input),
    [prompt, input]
  );
  const cpm = useMemo(
    () => calculateTypingSpeed(input, elapsedSeconds),
    [elapsedSeconds, input]
  );
  const wpm = useMemo(() => toWpmFromCpm(cpm), [cpm]);
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
    setStartedAt(Date.now());
    textareaRef.current?.focus();
  }, [race.stage, startedAt, completed]);

  useEffect(() => {
    if (!startedAt || completed) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000);
    }, 100);
    return () => window.clearInterval(interval);
  }, [completed, startedAt]);

  const lastSentProgressRef = useRef(0);
  const sendProgress = race.sendProgress;
  const sendFinish = race.sendFinish;
  const stage = race.stage;
  useEffect(() => {
    if (stage !== TYPING_RACE_STAGE.LIVE) return;
    const now = Date.now();
    if (now - lastSentProgressRef.current < 500 && !completed) return;
    lastSentProgressRef.current = now;
    sendProgress({
      progress,
      cpm,
      wpm,
      accuracy,
      mistakeCount,
      elapsedTimeMs: Math.round(elapsedSeconds * 1000),
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
      finishedAt: Date.now(),
    });
  }, [accuracy, completed, cpm, elapsedSeconds, mistakeCount, sendFinish, wpm]);

  useEffect(() => {
    let active = true;
    if (!engineContainerRef.current) return;

    const mountPromise = mountTypingRaceEngine({
      container: engineContainerRef.current,
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
  }, []);

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
          wpm: cpm,
        };
      }
      return lane;
    });
    return { ...race.snapshot, lanes, speedUnit: "CPM" };
  }, [race.snapshot, race.mySeat, profile.nickname, progress, cpm]);

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
    race.rejoin();
  };

  const handleInputChange = (nextRawValue: string) => {
    const nextInput = Array.from(nextRawValue)
      .slice(0, promptChars.length)
      .join("");
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

  const inCountdown = race.stage === TYPING_RACE_STAGE.COUNTDOWN;
  const results = race.results;
  const roomParticipants = race.roomSnapshot?.participants ?? [];
  const myResult = results.find((result) => result.userId === race.mySeat);
  const hasResults = results.length > 0;
  const showResults =
    Boolean(myResult) ||
    race.roomSnapshot?.status === TYPING_ROOM_STATUS.FINISHED;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader
        active="race"
        title="YEON 레이스"
        controls={
          <>
            <span className="font-mono text-[12px] text-[#aaa]">
              {race.snapshot?.roundLabel === "flow-focus"
                ? t("roundFlowFocus")
                : (race.snapshot?.roundLabel ?? "")}
            </span>
            <TypingBgmButton />
            <TypingSettingsButton />
          </>
        }
      />

      <div className="px-4 py-4 md:px-10">
        <div className="overflow-hidden rounded-xl border border-[#e5e5e5]">
          <div ref={engineContainerRef} className="h-[520px] w-full" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-3 font-mono text-[13px]">
          <span className="text-[#888]">CPM</span>
          <span className="text-[18px] font-bold text-[#111]">{cpm}</span>
          <span className="text-[#ddd]">·</span>
          <span className="text-[#888]">WPM</span>
          <span className="text-[18px] font-bold text-[#111]">{wpm}</span>
          <span className="text-[#ddd]">·</span>
          <span className="text-[#888]">acc</span>
          <span className="text-[18px] font-bold text-[#111]">{accuracy}%</span>
          <span className="text-[#ddd]">·</span>
          <span className="text-[#888]">progress</span>
          <span
            aria-label="내 진행률"
            className="text-[18px] font-bold text-[#111]"
          >
            {progress}%
          </span>
          <span className="text-[#ddd]">·</span>
          <span className="text-[#888]">mistakes</span>
          <span className="text-[18px] font-bold text-[#111]">
            {mistakeCount}
          </span>
          <span className="text-[#ddd]">·</span>
          <span className="text-[#888]">time</span>
          <span className="text-[18px] font-bold text-[#111]">
            {elapsedSeconds.toFixed(1)}s
          </span>
        </div>

        <div className="mt-3 grid gap-2 rounded-lg border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="flex items-center justify-between text-[13px] font-bold text-[#111]">
            <span>실시간 진행률</span>
            {myResult && (
              <span className="text-[#ff6b35]">현재 {myResult.rank}위</span>
            )}
          </div>
          {roomParticipants.map((participant) => (
            <div
              key={participant.id}
              aria-label={`${participant.label} 진행률`}
              className="grid gap-1"
            >
              <div className="flex items-center justify-between text-[12px] text-[#666]">
                <span>
                  {participant.label}
                  {participant.id === race.mySeat ? " (나)" : ""}
                </span>
                <span>
                  {participant.progress}% · {participant.cpm} CPM · 정확도{" "}
                  {participant.accuracy}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f1f1f1]">
                <div
                  className="h-full rounded-full bg-[#ff6b35] transition-all"
                  style={{ width: `${participant.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {showResults && (
          <div className="mt-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#ff6b35]">
                  Result
                </p>
                <h2 className="mt-1 text-[22px] font-black tracking-[-0.03em]">
                  타자 대결 결과
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded border border-[#e5e5e5] px-5 py-2 text-[13px] font-medium text-[#555] transition-colors hover:border-[#aaa]"
                onClick={handleRestart}
              >
                <RotateCcw size={13} />
                {t("restart")}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {results.map((result) => (
                <div
                  key={result.userId}
                  className="rounded-2xl border border-[#e5e5e5] bg-white p-4"
                >
                  <p className="text-[13px] font-bold text-[#888]">
                    {result.rank}위
                  </p>
                  <h3 className="mt-1 text-[18px] font-black">
                    {result.label}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[12px]">
                    <span>
                      CPM{" "}
                      <b className="text-[16px] text-[#111]">{result.cpm}</b>
                    </span>
                    <span>
                      WPM{" "}
                      <b className="text-[16px] text-[#111]">{result.wpm}</b>
                    </span>
                    <span>
                      정확도{" "}
                      <b className="text-[16px] text-[#111]">
                        {result.accuracy}%
                      </b>
                    </span>
                    <span>
                      오타{" "}
                      <b className="text-[16px] text-[#111]">
                        {result.mistakeCount}
                      </b>
                    </span>
                    <span>
                      시간{" "}
                      <b className="text-[16px] text-[#111]">
                        {(result.elapsedTimeMs / 1000).toFixed(1)}s
                      </b>
                    </span>
                    <span>
                      점수{" "}
                      <b className="text-[16px] text-[#111]">{result.score}</b>
                    </span>
                  </div>
                </div>
              ))}
              {!hasResults && (
                <p className="rounded-2xl border border-dashed border-[#ddd] bg-white p-5 text-[14px] text-[#777]">
                  결과를 집계하는 중입니다.
                </p>
              )}
            </div>
          </div>
        )}

        {!showResults && (
          <div className="mt-3 grid gap-3">
            <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-6 py-5 font-mono text-[19px] leading-[2] tracking-[0.01em]">
              {promptChars.map((char, index) => {
                const typed = inputChars[index];
                const isCurrent = index === inputChars.length;
                const isMismatch = mismatches.includes(index);
                const isMatched = typed === char;

                return (
                  <span
                    key={`${index}-${char}`}
                    className={
                      isMismatch
                        ? "bg-red-100 text-red-500"
                        : isMatched
                          ? "text-[#111]"
                          : isCurrent
                            ? "bg-[#111] text-white"
                            : "text-[#ccc]"
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
              disabled={inCountdown}
              rows={3}
              spellCheck={false}
              aria-label={t("typingInputLabel")}
              className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-5 py-4 font-mono text-[16px] leading-[1.7] text-[#111] outline-none transition-colors placeholder:text-[#ccc] focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-40"
              placeholder={
                inCountdown
                  ? `${race.countdownRemaining}${t("startingIn")}`
                  : t("typeHere")
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
