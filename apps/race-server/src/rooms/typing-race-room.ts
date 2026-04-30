import {
  RACE_EVENTS,
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  clampRaceProgress,
  type MatchJoinMessage,
  type RaceFinishMessage,
  type RaceProgressMessage,
  type RoomReadyMessage,
  type TypingRaceLaneSnapshot,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingRoomCreateMessage,
  type TypingRoomLanguage,
  type TypingRoomParticipantSnapshot,
  type TypingRoomSettings,
  type TypingRoomSnapshot,
  type TypingRoomStatus,
  type TypingRoomSummary,
} from "@yeon/race-shared";
import { type Client, Room } from "colyseus";

type RoomParticipant = {
  id: string;
  label: string;
  accent: string;
  kind: "player" | "benchmark";
  progress: number;
  wpm: number;
  accuracy: number;
  isReady: boolean;
  joinedAt: number;
};

const DEMO_PROMPTS: Record<TypingRoomLanguage, string> = {
  ko: "열 초 카운트다운이 끝나면 눈보다 손이 먼저 나가지 않게 문장을 끝까지 밀어 보세요.",
  en: "Once the countdown ends, let your fingers move forward through the sentence with a steady rhythm.",
  code: "function typeRace(input) { return input.trim().length > 0; }",
};

const ROUND_LABEL_ID = "flow-focus"; // 클라이언트가 번역해 표시

const BENCHMARKS = [
  { id: "benchmark-1", label: "Guest", accent: TYPING_RACE_LANE_ACCENTS[1], wpm: 265 },
  { id: "benchmark-2", label: "Guest", accent: TYPING_RACE_LANE_ACCENTS[2], wpm: 241 },
  { id: "benchmark-3", label: "Guest", accent: TYPING_RACE_LANE_ACCENTS[3], wpm: 227 },
] as const;

const DEFAULT_ROOM_SETTINGS: TypingRoomSettings = {
  title: "한글 짧은 문장 같이 치기",
  visibility: TYPING_ROOM_VISIBILITY.PUBLIC,
  maxParticipants: TYPING_RACE_DEFAULTS.lobbyMaxPlayers,
  textType: TYPING_ROOM_TEXT_TYPE.SHORT,
  language: TYPING_ROOM_LANGUAGE.KO,
  difficulty: TYPING_ROOM_DIFFICULTY.NORMAL,
  roundCount: 1,
  mode: TYPING_ROOM_MODE.FINISH,
};

// 엔진 레인 수가 4개라 maxClients도 4로 제한 (LANE_Y_RATIOS 길이와 일치시켜 5번째 참여자 누락 방지)
const MAX_PLAYERS_PER_ROOM = TYPING_RACE_DEFAULTS.lobbyMaxPlayers;

function clampOption(value: number | undefined, allowed: readonly number[], fallback: number) {
  if (!value) return fallback;
  return allowed.includes(value) ? value : fallback;
}

function clampText(value: string | undefined, fallback: string, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

function createRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeSettings(options?: TypingRoomCreateMessage): TypingRoomSettings {
  const language = Object.values(TYPING_ROOM_LANGUAGE).includes(
    options?.language as TypingRoomLanguage,
  )
    ? (options?.language as TypingRoomLanguage)
    : options?.locale === "en"
      ? TYPING_ROOM_LANGUAGE.EN
      : DEFAULT_ROOM_SETTINGS.language;

  return {
    title: clampText(options?.title, DEFAULT_ROOM_SETTINGS.title, 40),
    visibility: options?.visibility === TYPING_ROOM_VISIBILITY.PRIVATE
      ? TYPING_ROOM_VISIBILITY.PRIVATE
      : TYPING_ROOM_VISIBILITY.PUBLIC,
    maxParticipants: Math.min(
      MAX_PLAYERS_PER_ROOM,
      clampOption(options?.maxParticipants, [2, 4, 8], DEFAULT_ROOM_SETTINGS.maxParticipants),
    ),
    textType: Object.values(TYPING_ROOM_TEXT_TYPE).includes(options?.textType as never)
      ? options!.textType!
      : DEFAULT_ROOM_SETTINGS.textType,
    language,
    difficulty: Object.values(TYPING_ROOM_DIFFICULTY).includes(options?.difficulty as never)
      ? options!.difficulty!
      : DEFAULT_ROOM_SETTINGS.difficulty,
    roundCount: clampOption(options?.roundCount, [1, 3, 5], DEFAULT_ROOM_SETTINGS.roundCount),
    mode: options?.mode === TYPING_ROOM_MODE.TIME_LIMIT
      ? TYPING_ROOM_MODE.TIME_LIMIT
      : TYPING_ROOM_MODE.FINISH,
  };
}

export class TypingRaceRoom extends Room {
  maxClients: number = MAX_PLAYERS_PER_ROOM;

  private readonly participants = new Map<string, RoomParticipant>();

  private readonly benchmarks = new Map<string, RoomParticipant>();

  private settings: TypingRoomSettings = DEFAULT_ROOM_SETTINGS;

  private status: TypingRoomStatus = TYPING_ROOM_STATUS.COUNTDOWN;

  private stage: TypingRaceStage = TYPING_RACE_STAGE.COUNTDOWN;

  private countdownRemaining: number = TYPING_RACE_DEFAULTS.countdownSeconds;

  private startedAt: number = Date.now();

  private countdownAccumulator: number = 0;

  private finishCount: number = 0;

  private hostId: string | null = null;

  private roomCode: string = createRoomCode();

  private createdAt: number = Date.now();

  private lobbyMode: boolean = false;

  onCreate(options?: TypingRoomCreateMessage) {
    this.lobbyMode = options?.roomMode === "lobby";
    this.settings = normalizeSettings(options);
    this.maxClients = this.settings.maxParticipants;
    this.status = this.lobbyMode ? TYPING_ROOM_STATUS.WAITING : TYPING_ROOM_STATUS.COUNTDOWN;
    this.countdownRemaining = this.lobbyMode
      ? TYPING_RACE_DEFAULTS.roomCountdownSeconds
      : TYPING_RACE_DEFAULTS.countdownSeconds;
    this.createdAt = Date.now();
    this.setMetadata(this.createSummary());

    if (!this.lobbyMode) {
      this.resetRaceClock(TYPING_RACE_DEFAULTS.countdownSeconds);
      this.bootstrapBenchmarks();
    }

    this.onMessage(RACE_EVENTS.ROOM_READY, (client, message) => {
      this.updateReady(client, message as RoomReadyMessage);
    });

    this.onMessage(RACE_EVENTS.ROOM_START, (client) => {
      this.startFromLobby(client);
    });

    this.onMessage(RACE_EVENTS.RACE_PROGRESS, (client, message) => {
      this.updateParticipantProgress(client, message as RaceProgressMessage);
    });

    this.onMessage(RACE_EVENTS.RACE_FINISH, (client, message) => {
      this.finishParticipant(client, message as RaceFinishMessage);
    });

    this.setSimulationInterval(
      (deltaTime) => {
        this.tick(deltaTime);
      },
      Math.round(1000 / TYPING_RACE_DEFAULTS.roomTickRate),
    );
  }

  onJoin(client: Client, options: MatchJoinMessage) {
    this.registerParticipant(client, options);
    this.clock.setTimeout(() => {
      client.send(RACE_EVENTS.RACE_SEED, {
        passageId: ROUND_LABEL_ID,
        prompt: DEMO_PROMPTS[this.settings.language],
        roundLabel: ROUND_LABEL_ID,
      });
      client.send(RACE_EVENTS.ROOM_STATE, this.createRoomSnapshot());
      client.send(RACE_EVENTS.RACE_STATE, this.createSnapshot());
    }, 50);
  }

  onLeave(client: Client) {
    this.participants.delete(client.sessionId);
    if (this.hostId === client.sessionId) {
      this.hostId = this.participants.keys().next().value ?? null;
      const nextHost = this.hostId ? this.participants.get(this.hostId) : null;
      if (nextHost) nextHost.isReady = true;
    }
    this.syncState();
  }

  private registerParticipant(client: Client, message?: MatchJoinMessage) {
    if (this.participants.has(client.sessionId)) {
      return;
    }

    if (!this.hostId) {
      this.hostId = client.sessionId;
    }

    const participant: RoomParticipant = {
      id: client.sessionId,
      label: message?.playerLabel || "Guest",
      accent: TYPING_RACE_LANE_ACCENTS[this.participants.size % TYPING_RACE_LANE_ACCENTS.length],
      kind: "player",
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isReady: !this.lobbyMode || this.hostId === client.sessionId,
      joinedAt: Date.now(),
    };

    this.participants.set(client.sessionId, participant);
    this.syncState();
  }

  private updateReady(client: Client, message: RoomReadyMessage) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    const participant = this.participants.get(client.sessionId);
    if (!participant) return;
    participant.isReady = client.sessionId === this.hostId ? true : Boolean(message.isReady);
    this.syncState();
  }

  private startFromLobby(client: Client) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    if (client.sessionId !== this.hostId) {
      client.send(RACE_EVENTS.ROOM_ERROR, { message: "방장만 게임을 시작할 수 있어요." });
      return;
    }
    if (!this.canStart()) {
      client.send(RACE_EVENTS.ROOM_ERROR, { message: "아직 준비하지 않은 참여자가 있어요." });
      return;
    }

    this.status = TYPING_ROOM_STATUS.COUNTDOWN;
    this.resetRaceClock(TYPING_RACE_DEFAULTS.roomCountdownSeconds);
    this.lock();
    this.syncState();
  }

  private updateParticipantProgress(
    client: Client,
    message: RaceProgressMessage,
  ) {
    const participant = this.participants.get(client.sessionId);

    if (!participant) {
      return;
    }

    participant.progress = clampRaceProgress(message.progress);
    participant.wpm = Math.max(0, Math.round(message.wpm));
    participant.accuracy = Math.max(
      0,
      Math.min(100, Math.round(message.accuracy)),
    );
  }

  private finishParticipant(client: Client, message: RaceFinishMessage) {
    const participant = this.participants.get(client.sessionId);

    if (!participant) {
      return;
    }

    participant.progress = clampRaceProgress(message.progress);
    participant.wpm = Math.max(0, Math.round(message.wpm));
    participant.accuracy = Math.max(
      0,
      Math.min(100, Math.round(message.accuracy)),
    );

    this.finishCount += 1;
    client.send(RACE_EVENTS.RACE_RESULT, {
      placement: this.finishCount,
      totalPlayers: this.participants.size + this.benchmarks.size,
      completedAt: Date.now(),
    });

    const allFinished = Array.from(this.participants.values()).every(
      (p) => p.progress >= 100,
    );
    if (allFinished && this.participants.size > 0) {
      this.status = TYPING_ROOM_STATUS.FINISHED;
      this.stage = TYPING_RACE_STAGE.FINISHED;
    }
    this.syncState();
  }

  private tick(deltaTime: number) {
    if (this.status === TYPING_ROOM_STATUS.WAITING) {
      return;
    }

    if (this.stage === TYPING_RACE_STAGE.COUNTDOWN) {
      this.countdownAccumulator += deltaTime;

      if (this.countdownAccumulator >= 1000) {
        this.countdownAccumulator -= 1000;
        this.countdownRemaining = Math.max(0, this.countdownRemaining - 1);

        if (this.countdownRemaining === 0) {
          this.stage = TYPING_RACE_STAGE.LIVE;
          this.status = TYPING_ROOM_STATUS.LIVE;
          this.startedAt = Date.now();
          this.lock();
        }
      }
    }

    if (this.stage === TYPING_RACE_STAGE.LIVE) {
      const elapsedSeconds = (Date.now() - this.startedAt) / 1000;
      const promptChars = Math.max(1, Array.from(DEMO_PROMPTS[this.settings.language]).length);

      this.benchmarks.forEach((benchmark) => {
        const charsTyped = elapsedSeconds * (benchmark.wpm / 60);
        benchmark.progress = clampRaceProgress((charsTyped / promptChars) * 100);
      });
    }

    this.syncState();
  }

  private createSnapshot(): TypingRaceSnapshot {
    const lanes: TypingRaceLaneSnapshot[] = [
      ...this.participants.values(),
      ...this.benchmarks.values(),
    ]
      .slice(0, MAX_PLAYERS_PER_ROOM)
      .map((participant) => ({
        id: participant.id,
        label: participant.label,
        accent: participant.accent,
        progress: participant.progress,
        wpm: participant.wpm,
        role: participant.kind === "benchmark"
          ? TYPING_RACE_LANE_ROLE.BENCHMARK
          : TYPING_RACE_LANE_ROLE.GUEST,
        isReady: participant.isReady,
      }));

    return {
      stage: this.stage,
      countdownRemaining: this.countdownRemaining,
      headline: "",
      subheadline: "",
      roundLabel: ROUND_LABEL_ID,
      lanes,
    };
  }

  private createSummary(): TypingRoomSummary {
    return {
      ...this.settings,
      roomId: this.roomId,
      roomCode: this.roomCode,
      status: this.status,
      currentParticipants: this.participants.size,
      createdAt: this.createdAt,
    };
  }

  private createRoomSnapshot(): TypingRoomSnapshot {
    const participants: TypingRoomParticipantSnapshot[] = Array.from(
      this.participants.values(),
    ).map((participant) => ({
      id: participant.id,
      label: participant.label,
      role: participant.id === this.hostId ? "host" : "guest",
      isReady: participant.isReady,
      progress: participant.progress,
      wpm: participant.wpm,
      accuracy: participant.accuracy,
    }));

    return {
      ...this.createSummary(),
      participants,
      hostId: this.hostId,
      currentRound: 1,
      canStart: this.canStart(),
    };
  }

  private canStart() {
    return this.participants.size > 0 && Array.from(this.participants.values()).every(
      (participant) => participant.isReady,
    );
  }

  private bootstrapBenchmarks() {
    BENCHMARKS.forEach((benchmark) => {
      this.benchmarks.set(benchmark.id, {
        id: benchmark.id,
        label: benchmark.label,
        accent: benchmark.accent,
        kind: "benchmark",
        progress: 0,
        wpm: benchmark.wpm,
        accuracy: 100,
        isReady: true,
        joinedAt: Date.now(),
      });
    });
  }

  private resetRaceClock(seconds: number) {
    this.stage = TYPING_RACE_STAGE.COUNTDOWN;
    this.countdownRemaining = seconds;
    this.startedAt = Date.now();
    this.countdownAccumulator = 0;
    this.finishCount = 0;
    this.participants.forEach((participant) => {
      participant.progress = 0;
      participant.wpm = 0;
      participant.accuracy = 100;
    });
  }

  private syncState() {
    const roomSnapshot = this.createRoomSnapshot();
    this.setMetadata(this.createSummary());
    this.broadcast(RACE_EVENTS.ROOM_STATE, roomSnapshot);
    this.broadcast(RACE_EVENTS.RACE_STATE, this.createSnapshot());
  }
}
