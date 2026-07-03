"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
} from "lucide-react";
import {
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import {
  TODO_TASK_ESTIMATES,
  TODO_TASK_PRIORITIES,
  TODO_TASK_STATUSES,
  getTodayServiceLocalDate,
  getTodoTaskEstimateMinutes,
  setTodoTaskStatus,
  type TodoServiceState,
  type TodoTask,
  type TodoTaskEstimate,
  type TodoTaskPriority,
} from "./todo-service-model";
import {
  getTodoFocusHref,
  getTodoServiceHomeHref,
} from "./todo-service-routing";
import {
  readTodoServiceState,
  writeTodoServiceState,
} from "./todo-service-storage";
import styles from "./todo-focus-room-screen.module.css";

const DURATION_PRESETS = [15, 25, 45, 60] as const;
const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 180;
const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PRIORITY_LABELS: Record<TodoTaskPriority, string> = {
  [TODO_TASK_PRIORITIES.important]: "높음",
  [TODO_TASK_PRIORITIES.normal]: "보통",
  [TODO_TASK_PRIORITIES.light]: "낮음",
};

const ESTIMATE_LABELS: Record<TodoTaskEstimate, string> = {
  [TODO_TASK_ESTIMATES.five]: "5분",
  [TODO_TASK_ESTIMATES.fifteen]: "15분",
  [TODO_TASK_ESTIMATES.thirty]: "30분",
  [TODO_TASK_ESTIMATES.hour]: "1시간",
  [TODO_TASK_ESTIMATES.twoHours]: "2시간+",
};

type BrowserWindowWithLegacyAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function clampDurationMinutes(value: number) {
  if (!Number.isFinite(value)) return 25;
  return Math.min(
    MAX_DURATION_MINUTES,
    Math.max(MIN_DURATION_MINUTES, Math.round(value))
  );
}

function parseDurationMinutes(value: string | null) {
  if (!value) return 25;
  return clampDurationMinutes(Number(value));
}

function normalizeLocalDate(value: string | null, fallback: string) {
  return value && LOCAL_DATE_PATTERN.test(value) ? value : fallback;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function findTask(state: TodoServiceState | null, taskId: string) {
  if (!taskId) return null;
  return state?.tasks.find((candidate) => candidate.id === taskId) ?? null;
}

function getTaskDuration(task: TodoTask | null, fallbackMinutes: number) {
  return task ? getTodoTaskEstimateMinutes(task.estimate) : fallbackMinutes;
}

function playTimeoutSound() {
  if (typeof window === "undefined") return;

  const audioWindow = window as BrowserWindowWithLegacyAudio;
  const AudioContextConstructor =
    audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

  if (!AudioContextConstructor) return;

  try {
    const audioContext = new AudioContextConstructor();
    const startedAt = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(0.0001, startedAt);
    gain.gain.exponentialRampToValueAtTime(0.18, startedAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.9);

    [0, 0.18, 0.36].forEach((offset, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        index === 1 ? 880 : 660,
        startedAt + offset
      );
      oscillator.connect(gain);
      oscillator.start(startedAt + offset);
      oscillator.stop(startedAt + offset + 0.12);
    });

    window.setTimeout(() => {
      void audioContext.close().catch(() => undefined);
    }, 1100);
  } catch {
    // 브라우저가 오디오 컨텍스트를 막아도 타이머 완료 흐름은 유지한다.
  }
}

export function TodoFocusRoomScreen() {
  const router = useYeonRouter();
  const searchParams = useYeonSearchParams();
  const today = useMemo(() => getTodayServiceLocalDate(), []);
  const taskId = searchParams.get("taskId") ?? "";
  const focusDate = normalizeLocalDate(searchParams.get("date"), today);
  const queryMinutes = parseDurationMinutes(searchParams.get("minutes"));
  const [state, setState] = useState<TodoServiceState | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(queryMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(queryMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timeoutSoundPlayedRef = useRef(false);

  const task = useMemo(() => findTask(state, taskId), [state, taskId]);
  const effectiveMinutes = getTaskDuration(task, durationMinutes);
  const durationSeconds = durationMinutes * 60;
  const progress =
    durationSeconds === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            ((durationSeconds - remainingSeconds) / durationSeconds) * 100
          )
        );

  useEffect(() => {
    setState(readTodoServiceState(today));
  }, [today]);

  useEffect(() => {
    setDurationMinutes(queryMinutes);
    setRemainingSeconds(queryMinutes * 60);
    setElapsedSeconds(0);
    setIsRunning(false);
    timeoutSoundPlayedRef.current = false;
  }, [queryMinutes, taskId]);

  useEffect(() => {
    if (searchParams.get("minutes") || !task) return;
    const taskMinutes = clampDurationMinutes(
      getTodoTaskEstimateMinutes(task.estimate)
    );
    setDurationMinutes(taskMinutes);
    setRemainingSeconds(taskMinutes * 60);
    timeoutSoundPlayedRef.current = false;
  }, [searchParams, task]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds !== 0 || timeoutSoundPlayedRef.current || !task) {
      return;
    }

    timeoutSoundPlayedRef.current = true;
    playTimeoutSound();
  }, [remainingSeconds, task]);

  function moveHome() {
    router.push(getTodoServiceHomeHref(), { scroll: false });
  }

  function updateDuration(nextMinutes: number) {
    const clampedMinutes = clampDurationMinutes(nextMinutes);
    setIsRunning(false);
    setDurationMinutes(clampedMinutes);
    setRemainingSeconds(clampedMinutes * 60);
    setElapsedSeconds(0);
    timeoutSoundPlayedRef.current = false;

    if (!taskId) return;
    router.replace(
      getTodoFocusHref({
        taskId,
        date: focusDate,
        minutes: clampedMinutes,
      }),
      { scroll: false }
    );
  }

  function resetTimer() {
    setIsRunning(false);
    setRemainingSeconds(durationMinutes * 60);
    setElapsedSeconds(0);
    timeoutSoundPlayedRef.current = false;
  }

  function completeTask() {
    if (!taskId) {
      setNotice("완료 처리할 작업을 찾지 못했습니다.");
      return;
    }

    const currentState = readTodoServiceState(today);
    if (!findTask(currentState, taskId)) {
      setNotice("완료 처리할 작업을 찾지 못했습니다.");
      return;
    }

    const nextState: TodoServiceState = {
      ...currentState,
      lastOpenedDate: today,
      tasks: setTodoTaskStatus({
        tasks: currentState.tasks,
        taskId,
        status: TODO_TASK_STATUSES.done,
        today: focusDate,
        nowIso: new Date().toISOString(),
      }),
    };

    try {
      writeTodoServiceState(nextState);
      setState(nextState);
      router.push(getTodoServiceHomeHref(), { scroll: false });
    } catch {
      setNotice("브라우저 저장소에 저장하지 못했습니다.");
    }
  }

  return (
    <main className={styles.screen}>
      <video
        className={styles.video}
        src="/mooddesk/src/assets/mood-room-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className={styles.veil} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.textButton}
            onClick={moveHome}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Todo로 돌아가기
          </button>
          <div className={styles.topActions}>
            <span className={styles.pill}>{formatDateLabel(focusDate)}</span>
          </div>
        </header>

        <section className={styles.stage} aria-label="Todo 집중 화면">
          <div className={`${styles.panel} ${styles.focusPanel}`}>
            <div>
              <div className={styles.taskMeta}>
                <span className={styles.pill}>
                  {task ? PRIORITY_LABELS[task.priority] : "작업 없음"}
                </span>
                <span className={styles.pill}>
                  {task
                    ? ESTIMATE_LABELS[task.estimate]
                    : `${effectiveMinutes}분`}
                </span>
              </div>
              <h2 className={styles.taskTitle}>
                {task?.title ?? "작업을 찾지 못했습니다"}
              </h2>
            </div>

            <div className={styles.timerCard}>
              <div className={styles.timerLabel}>
                <span className="inline-flex items-center gap-1.5">
                  <Timer size={16} aria-hidden="true" />
                  남은 시간
                </span>
                <span>스톱워치 {formatClock(elapsedSeconds)}</span>
              </div>
              <div className={styles.timerValue} aria-live="polite">
                {formatClock(remainingSeconds)}
              </div>
              <div className={styles.meter} aria-hidden="true">
                <span
                  className={styles.meterFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={styles.presetGrid} aria-label="시간 프리셋">
                {DURATION_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`${styles.presetButton} ${
                      durationMinutes === minutes
                        ? styles.presetButtonActive
                        : ""
                    }`}
                    onClick={() => updateDuration(minutes)}
                  >
                    {minutes}분
                  </button>
                ))}
              </div>

              <div className={styles.minuteControl}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="집중 시간 1분 줄이기"
                  onClick={() => updateDuration(durationMinutes - 1)}
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <input
                  className={styles.minuteInput}
                  type="number"
                  min={MIN_DURATION_MINUTES}
                  max={MAX_DURATION_MINUTES}
                  step={1}
                  value={durationMinutes}
                  aria-label="집중 시간 직접 입력"
                  onChange={(event) =>
                    updateDuration(Number(event.target.value))
                  }
                />
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="집중 시간 1분 늘리기"
                  onClick={() => updateDuration(durationMinutes + 1)}
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>

              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => setIsRunning((current) => !current)}
                  disabled={!task}
                >
                  {isRunning ? (
                    <Pause size={18} aria-hidden="true" />
                  ) : (
                    <Play size={18} aria-hidden="true" />
                  )}
                  {isRunning ? "잠시 멈춤" : "시작"}
                </button>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={resetTimer}
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  리셋
                </button>
              </div>
            </div>

            <button
              type="button"
              className={styles.completionButton}
              onClick={completeTask}
              disabled={!task}
            >
              <CheckCircle2 size={19} aria-hidden="true" />
              작업 완료
            </button>

            {notice ? (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
