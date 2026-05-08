import {
  RACE_EVENTS,
  TYPING_DECK_LANGUAGE_TAG,
  TYPING_DECK_VISIBILITY,
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_SPEED_STYLE,
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  calculateTypingScore,
  clampPercent,
  clampRaceProgress,
  countTypingMetricUnits,
  getTypingDisplayUnit,
  normalizeNonNegativeInteger,
  rankTypingResults,
  resolveTypingSpeedStyle,
  toWpmFromCpm,
  type MatchJoinMessage,
  type RaceFinishMessage,
  type RaceProgressMessage,
  type RaceSeedMessage,
  type RoomReadyMessage,
  type TypingRaceLaneSnapshot,
  type TypingDeckLanguageTag,
  type TypingDeckVisibility,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingResultSnapshot,
  type TypingRoomCreateMessage,
  type TypingRoomLanguage,
  type TypingRoomParticipantSnapshot,
  type TypingRoomSettings,
  type TypingRoomSnapshot,
  type TypingRoomStatus,
  type TypingRoomSummary,
} from "@yeon/race-shared";
import { type Client, Room } from "colyseus";
import { createHmac, timingSafeEqual } from "node:crypto";

type RoomParticipant = {
  id: string;
  label: string;
  accent: string;
  kind: "player" | "benchmark";
  progress: number;
  cpm: number;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  elapsedTimeMs: number;
  finishedAt: number | null;
  score: number;
  rank: number | null;
  isReady: boolean;
  joinedAt: number;
};

const DEMO_PROMPTS: Record<TypingRoomLanguage, string> = {
  ko: "열 초 카운트다운이 끝나면 눈보다 손이 먼저 나가지 않게 문장을 끝까지 밀어 보세요.",
  en: "Once the countdown ends, let your fingers move forward through the sentence with a steady rhythm.",
  code: "function typeRace(input) { return input.trim().length > 0; }",
};

const ROUND_LABEL_ID = "flow-focus"; // 클라이언트가 번역해 표시
const DEFAULT_DECK_TITLE = "기본 덱";
const PRIVATE_DECK_LOBBY_TITLE = "비공개 덱";
const MAX_SEED_PROMPT_LENGTH = 4000;
const MAX_SEED_ID_LENGTH = 120;
const MAX_SEED_LABEL_LENGTH = 120;
const MAX_REASONABLE_CPM = 1200;
const TYPING_RACE_SEED_FALLBACK_SECRET = "yeon-local-typing-race-seed-secret";

const BENCHMARKS = [
  {
    id: "benchmark-1",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[1],
    cpm: 265,
  },
  {
    id: "benchmark-2",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[2],
    cpm: 241,
  },
  {
    id: "benchmark-3",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[3],
    cpm: 227,
  },
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

function clampOption(
  value: number | undefined,
  allowed: readonly number[],
  fallback: number
) {
  if (!value) return fallback;
  return allowed.includes(value) ? value : fallback;
}

function clampText(
  value: string | undefined,
  fallback: string,
  maxLength: number
) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

function optionalText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().slice(0, maxLength)
    : undefined;
}

function normalizeDeckVisibility(
  value: unknown
): TypingDeckVisibility | undefined {
  return Object.values(TYPING_DECK_VISIBILITY).includes(
    value as TypingDeckVisibility
  )
    ? (value as TypingDeckVisibility)
    : undefined;
}

function normalizeDeckLanguageTag(
  value: unknown
): TypingDeckLanguageTag | undefined {
  return Object.values(TYPING_DECK_LANGUAGE_TAG).includes(
    value as TypingDeckLanguageTag
  )
    ? (value as TypingDeckLanguageTag)
    : undefined;
}

function getTypingRaceSeedSigningSecret() {
  return (
    process.env.TYPING_RACE_SEED_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    TYPING_RACE_SEED_FALLBACK_SECRET
  );
}

function raceSeedSigningPayload(seed: RaceSeedMessage) {
  return JSON.stringify({
    passageId: seed.passageId,
    prompt: seed.prompt,
    roundLabel: seed.roundLabel,
    deckId: seed.deckId,
    deckVisibility: seed.deckVisibility,
    lobbyDeckTitle: seed.lobbyDeckTitle,
    participantDeckTitle: seed.participantDeckTitle,
    languageTag: seed.languageTag,
  });
}

function verifyRaceSeedToken(seed: RaceSeedMessage) {
  const token = optionalText(seed.seedToken, 256);
  if (!token?.startsWith("v1.")) {
    return false;
  }

  const expected = createHmac("sha256", getTypingRaceSeedSigningSecret())
    .update(raceSeedSigningPayload(seed))
    .digest("base64url");
  const actual = token.slice(3);
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function createRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeSettings(
  options?: TypingRoomCreateMessage
): TypingRoomSettings {
  const language = Object.values(TYPING_ROOM_LANGUAGE).includes(
    options?.language as TypingRoomLanguage
  )
    ? (options?.language as TypingRoomLanguage)
    : options?.locale === "en"
      ? TYPING_ROOM_LANGUAGE.EN
      : DEFAULT_ROOM_SETTINGS.language;

  const seedVisibility = normalizeDeckVisibility(
    options?.raceSeed?.deckVisibility
  );
  const selectedDeckVisibility =
    normalizeDeckVisibility(options?.selectedDeckVisibility) ?? seedVisibility;
  const selectedDeckLanguageTag =
    normalizeDeckLanguageTag(options?.selectedDeckLanguageTag) ??
    normalizeDeckLanguageTag(options?.raceSeed?.languageTag);
  const selectedDeckId =
    optionalText(options?.selectedDeckId, MAX_SEED_ID_LENGTH) ??
    optionalText(options?.raceSeed?.deckId, MAX_SEED_ID_LENGTH);
  const seedLobbyTitle = optionalText(
    options?.raceSeed?.lobbyDeckTitle,
    MAX_SEED_LABEL_LENGTH
  );
  const suppliedLobbyTitle =
    optionalText(options?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    seedLobbyTitle;

  return {
    title: clampText(options?.title, DEFAULT_ROOM_SETTINGS.title, 40),
    visibility: TYPING_ROOM_VISIBILITY.PUBLIC,
    maxParticipants: Math.min(
      MAX_PLAYERS_PER_ROOM,
      clampOption(
        options?.maxParticipants,
        [2, 4],
        DEFAULT_ROOM_SETTINGS.maxParticipants
      )
    ),
    textType: TYPING_ROOM_TEXT_TYPE.SHORT,
    language:
      language === TYPING_ROOM_LANGUAGE.EN
        ? TYPING_ROOM_LANGUAGE.EN
        : TYPING_ROOM_LANGUAGE.KO,
    difficulty: Object.values(TYPING_ROOM_DIFFICULTY).includes(
      options?.difficulty as never
    )
      ? options!.difficulty!
      : DEFAULT_ROOM_SETTINGS.difficulty,
    roundCount: TYPING_RACE_DEFAULTS.sliceARoundCount,
    mode: TYPING_ROOM_MODE.FINISH,
    selectedDeckId,
    selectedDeckVisibility,
    selectedDeckLanguageTag,
    lobbyDeckTitle:
      selectedDeckVisibility === TYPING_DECK_VISIBILITY.PRIVATE
        ? PRIVATE_DECK_LOBBY_TITLE
        : suppliedLobbyTitle,
  };
}

function createFallbackRaceSeed(language: TypingRoomLanguage): RaceSeedMessage {
  return {
    passageId: ROUND_LABEL_ID,
    prompt: DEMO_PROMPTS[language],
    roundLabel: ROUND_LABEL_ID,
    deckVisibility: TYPING_DECK_VISIBILITY.DEFAULT,
    lobbyDeckTitle: DEFAULT_DECK_TITLE,
    participantDeckTitle: DEFAULT_DECK_TITLE,
    languageTag:
      language === TYPING_ROOM_LANGUAGE.EN
        ? TYPING_DECK_LANGUAGE_TAG.EN
        : TYPING_DECK_LANGUAGE_TAG.KO,
  };
}

function normalizeRaceSeed(
  suppliedSeed: TypingRoomCreateMessage["raceSeed"] | undefined,
  language: TypingRoomLanguage
): RaceSeedMessage {
  const fallback = createFallbackRaceSeed(language);
  const prompt = optionalText(suppliedSeed?.prompt, MAX_SEED_PROMPT_LENGTH);

  if (!prompt) {
    return fallback;
  }

  const deckVisibility =
    normalizeDeckVisibility(suppliedSeed?.deckVisibility) ??
    fallback.deckVisibility;
  if (deckVisibility === TYPING_DECK_VISIBILITY.PRIVATE) {
    return fallback;
  }

  const participantDeckTitle =
    optionalText(suppliedSeed?.participantDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    optionalText(suppliedSeed?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH);
  const lobbyDeckTitle =
    optionalText(suppliedSeed?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    participantDeckTitle;

  const seed: RaceSeedMessage = {
    passageId:
      optionalText(suppliedSeed?.passageId, MAX_SEED_ID_LENGTH) ??
      fallback.passageId,
    prompt,
    roundLabel:
      optionalText(suppliedSeed?.roundLabel, MAX_SEED_LABEL_LENGTH) ??
      fallback.roundLabel,
    seedToken: optionalText(suppliedSeed?.seedToken, 256),
    deckId: optionalText(suppliedSeed?.deckId, MAX_SEED_ID_LENGTH),
    deckVisibility,
    lobbyDeckTitle,
    participantDeckTitle,
    languageTag:
      normalizeDeckLanguageTag(suppliedSeed?.languageTag) ??
      fallback.languageTag,
  };

  return verifyRaceSeedToken(seed) ? seed : fallback;
}

export class TypingRaceRoom extends Room {
  maxClients: number = MAX_PLAYERS_PER_ROOM;

  private readonly participants = new Map<string, RoomParticipant>();

  private readonly benchmarks = new Map<string, RoomParticipant>();

  private settings: TypingRoomSettings = DEFAULT_ROOM_SETTINGS;

  private roomSeed: RaceSeedMessage = createFallbackRaceSeed(
    DEFAULT_ROOM_SETTINGS.language
  );

  private status: TypingRoomStatus = TYPING_ROOM_STATUS.COUNTDOWN;

  private stage: TypingRaceStage = TYPING_RACE_STAGE.COUNTDOWN;

  private countdownRemaining: number = TYPING_RACE_DEFAULTS.countdownSeconds;

  private startedAt: number = Date.now();

  private countdownAccumulator: number = 0;

  private hostId: string | null = null;

  private roomCode: string = createRoomCode();

  private createdAt: number = Date.now();

  private lobbyMode: boolean = false;

  private get speedStyle() {
    return resolveTypingSpeedStyle(
      this.roomSeed.languageTag ?? this.settings.language
    );
  }

  onCreate(options?: TypingRoomCreateMessage) {
    this.lobbyMode = options?.roomMode === "lobby";
    this.settings = normalizeSettings(options);
    this.roomSeed = normalizeRaceSeed(
      options?.raceSeed,
      this.settings.language
    );
    this.settings = this.applyRoomSeedMetadata(this.settings, this.roomSeed);
    this.maxClients = this.settings.maxParticipants;
    this.status = this.lobbyMode
      ? TYPING_ROOM_STATUS.WAITING
      : TYPING_ROOM_STATUS.COUNTDOWN;
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
      Math.round(1000 / TYPING_RACE_DEFAULTS.roomTickRate)
    );
  }

  onJoin(client: Client, options: MatchJoinMessage) {
    this.registerParticipant(client, options);
    this.clock.setTimeout(() => {
      client.send(RACE_EVENTS.RACE_SEED, this.roomSeed);
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
      accent:
        TYPING_RACE_LANE_ACCENTS[
          this.participants.size % TYPING_RACE_LANE_ACCENTS.length
        ],
      kind: "player",
      progress: 0,
      cpm: 0,
      wpm: 0,
      accuracy: 100,
      mistakeCount: 0,
      elapsedTimeMs: 0,
      finishedAt: null,
      score: 0,
      rank: null,
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
    participant.isReady =
      client.sessionId === this.hostId ? true : Boolean(message.isReady);
    this.syncState();
  }

  private startFromLobby(client: Client) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    if (client.sessionId !== this.hostId) {
      client.send(RACE_EVENTS.ROOM_ERROR, {
        message: "방장만 게임을 시작할 수 있어요.",
      });
      return;
    }
    if (!this.canStart()) {
      client.send(RACE_EVENTS.ROOM_ERROR, {
        message: "아직 준비하지 않은 참여자가 있어요.",
      });
      return;
    }

    this.status = TYPING_ROOM_STATUS.COUNTDOWN;
    this.resetRaceClock(TYPING_RACE_DEFAULTS.roomCountdownSeconds);
    this.broadcast(RACE_EVENTS.RACE_SEED, this.roomSeed);
    this.lock();
    this.syncState();
  }

  private updateParticipantProgress(
    client: Client,
    message: RaceProgressMessage
  ) {
    if (!this.isRaceLive()) {
      return;
    }

    const participant = this.participants.get(client.sessionId);

    if (!participant) {
      return;
    }

    this.applyParticipantMetrics(participant, message);
  }

  private finishParticipant(client: Client, message: RaceFinishMessage) {
    if (!this.isRaceLive()) {
      return;
    }

    const participant = this.participants.get(client.sessionId);

    if (!participant || participant.finishedAt !== null) {
      return;
    }

    this.applyParticipantMetrics(participant, message);
    participant.progress = 100;
    participant.elapsedTimeMs = this.serverElapsedTimeMs();
    participant.finishedAt = Date.now();
    participant.score = calculateTypingScore(
      participant.cpm,
      participant.accuracy
    );
    this.updateRanks();

    const results = this.createResultSnapshot();
    const placement =
      results.find((result) => result.userId === participant.id)?.rank ??
      results.length;

    this.broadcast(RACE_EVENTS.RACE_RESULT, {
      placement,
      totalPlayers: this.participants.size,
      completedAt: participant.finishedAt,
      results,
    });

    const allFinished = Array.from(this.participants.values()).every(
      (p) => p.finishedAt !== null
    );
    if (allFinished && this.participants.size > 0) {
      this.status = TYPING_ROOM_STATUS.FINISHED;
      this.stage = TYPING_RACE_STAGE.FINISHED;
    }
    this.syncState();
  }

  private applyParticipantMetrics(
    participant: RoomParticipant,
    message: RaceProgressMessage | RaceFinishMessage
  ) {
    participant.progress = clampRaceProgress(message.progress);
    const elapsedTimeMs = this.serverElapsedTimeMs();
    const promptTypingUnits = Math.max(
      1,
      countTypingMetricUnits(this.roomSeed.prompt, this.speedStyle)
    );
    const typedUnits =
      normalizeNonNegativeInteger(message.typedUnitCount) ||
      Math.round((promptTypingUnits * participant.progress) / 100);
    const observedCpm =
      elapsedTimeMs > 0 ? Math.round((typedUnits / elapsedTimeMs) * 60_000) : 0;
    const reportedCpm = normalizeNonNegativeInteger(message.cpm ?? message.wpm);
    const cpm = Math.min(
      MAX_REASONABLE_CPM,
      reportedCpm > 0 ? reportedCpm : observedCpm,
      observedCpm > 0 ? observedCpm : MAX_REASONABLE_CPM
    );
    participant.cpm = cpm;
    participant.wpm =
      this.speedStyle === TYPING_SPEED_STYLE.KO_JASO ? 0 : toWpmFromCpm(cpm);
    participant.accuracy = clampPercent(message.accuracy);
    participant.mistakeCount = normalizeNonNegativeInteger(
      message.mistakeCount
    );
    participant.elapsedTimeMs = elapsedTimeMs;
    participant.score = calculateTypingScore(
      participant.cpm,
      participant.accuracy
    );
  }

  private isRaceLive() {
    return (
      this.status === TYPING_ROOM_STATUS.LIVE &&
      this.stage === TYPING_RACE_STAGE.LIVE
    );
  }

  private serverElapsedTimeMs() {
    return normalizeNonNegativeInteger(Date.now() - this.startedAt);
  }

  private updateRanks() {
    const ranked = rankTypingResults(this.createResultSnapshot(false));
    ranked.forEach((result) => {
      const participant = this.participants.get(result.userId);
      if (participant) participant.rank = result.rank;
    });
  }

  private createResultSnapshot(onlyFinished = true): TypingResultSnapshot[] {
    return rankTypingResults(
      Array.from(this.participants.values())
        .filter(
          (participant) => !onlyFinished || participant.finishedAt !== null
        )
        .map((participant) => ({
          userId: participant.id,
          label: participant.label,
          cpm: participant.cpm,
          wpm: participant.wpm,
          accuracy: participant.accuracy,
          mistakeCount: participant.mistakeCount,
          elapsedTimeMs: participant.elapsedTimeMs,
          score: participant.score,
          finishedAt: participant.finishedAt ?? Number.MAX_SAFE_INTEGER,
        }))
    );
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
      const promptTypingUnits = Math.max(
        1,
        countTypingMetricUnits(this.roomSeed.prompt, this.speedStyle)
      );

      this.benchmarks.forEach((benchmark) => {
        const typedUnits = elapsedSeconds * (benchmark.cpm / 60);
        benchmark.progress = clampRaceProgress(
          (typedUnits / promptTypingUnits) * 100
        );
      });
    }

    this.syncState();
  }

  private applyRoomSeedMetadata(
    settings: TypingRoomSettings,
    seed: RaceSeedMessage
  ): TypingRoomSettings {
    const selectedDeckVisibility =
      normalizeDeckVisibility(settings.selectedDeckVisibility) ??
      normalizeDeckVisibility(seed.deckVisibility);
    const lobbyDeckTitle =
      selectedDeckVisibility === TYPING_DECK_VISIBILITY.PRIVATE
        ? PRIVATE_DECK_LOBBY_TITLE
        : (optionalText(settings.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
          optionalText(seed.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
          optionalText(seed.participantDeckTitle, MAX_SEED_LABEL_LENGTH));

    return {
      ...settings,
      selectedDeckId:
        optionalText(settings.selectedDeckId, MAX_SEED_ID_LENGTH) ??
        optionalText(seed.deckId, MAX_SEED_ID_LENGTH),
      selectedDeckVisibility,
      selectedDeckLanguageTag:
        normalizeDeckLanguageTag(settings.selectedDeckLanguageTag) ??
        normalizeDeckLanguageTag(seed.languageTag),
      lobbyDeckTitle,
    };
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
        cpm: participant.cpm,
        displaySpeed:
          this.speedStyle === TYPING_SPEED_STYLE.KO_JASO
            ? participant.cpm
            : participant.wpm,
        role:
          participant.kind === "benchmark"
            ? TYPING_RACE_LANE_ROLE.BENCHMARK
            : TYPING_RACE_LANE_ROLE.GUEST,
        isReady: participant.isReady,
      }));

    return {
      stage: this.stage,
      countdownRemaining: this.countdownRemaining,
      headline: "",
      subheadline: "",
      roundLabel: this.roomSeed.roundLabel,
      lanes,
      speedUnit: getTypingDisplayUnit(this.speedStyle),
    };
  }

  private createSummary(): TypingRoomSummary {
    return {
      ...this.settings,
      roomId: this.roomId,
      roomCode: this.roomCode,
      status: this.status,
      currentParticipants: this.participants.size,
      hostLabel: this.hostId
        ? this.participants.get(this.hostId)?.label
        : undefined,
      createdAt: this.createdAt,
    };
  }

  private createRoomSnapshot(): TypingRoomSnapshot {
    const participants: TypingRoomParticipantSnapshot[] = Array.from(
      this.participants.values()
    ).map((participant) => ({
      id: participant.id,
      label: participant.label,
      role: participant.id === this.hostId ? "host" : "guest",
      isReady: participant.isReady,
      progress: participant.progress,
      cpm: participant.cpm,
      wpm: participant.wpm,
      accuracy: participant.accuracy,
      mistakeCount: participant.mistakeCount,
      elapsedTimeMs: participant.elapsedTimeMs,
      finishedAt: participant.finishedAt,
      score: participant.score,
      rank: participant.rank,
    }));

    return {
      ...this.createSummary(),
      participants,
      hostId: this.hostId,
      currentRound: 1,
      canStart: this.canStart(),
      results: this.createResultSnapshot(),
    };
  }

  private canStart() {
    return (
      this.participants.size > 0 &&
      Array.from(this.participants.values()).every(
        (participant) => participant.isReady
      )
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
        cpm: benchmark.cpm,
        wpm:
          this.speedStyle === TYPING_SPEED_STYLE.KO_JASO
            ? 0
            : toWpmFromCpm(benchmark.cpm),
        accuracy: 100,
        mistakeCount: 0,
        elapsedTimeMs: 0,
        finishedAt: null,
        score: 0,
        rank: null,
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
    this.participants.forEach((participant) => {
      participant.progress = 0;
      participant.cpm = 0;
      participant.wpm = 0;
      participant.accuracy = 100;
      participant.mistakeCount = 0;
      participant.elapsedTimeMs = 0;
      participant.finishedAt = null;
      participant.score = 0;
      participant.rank = null;
    });
  }

  private syncState() {
    const roomSnapshot = this.createRoomSnapshot();
    this.setMetadata(this.createSummary());
    this.broadcast(RACE_EVENTS.ROOM_STATE, roomSnapshot);
    this.broadcast(RACE_EVENTS.RACE_STATE, this.createSnapshot());
  }
}
