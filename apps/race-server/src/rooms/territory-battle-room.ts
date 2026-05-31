import { type Client, Room } from "@colyseus/core";
import {
  TERRITORY_BATTLE_DEFAULTS,
  TERRITORY_BATTLE_ERROR,
  TERRITORY_BATTLE_EVENTS,
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_TEAM,
  assignTerritoryTeam,
  captureTerritoryCell,
  createTerritoryBoard,
  findTerritoryCellByWord,
  resolveTerritoryWinner,
  type TerritoryBattlePhase,
  type TerritoryBattlePlayerSnapshot,
  type TerritoryBattleSnapshot,
  type TerritoryBattleSubmitWordMessage,
  type TerritoryBattleTeam,
  type TerritoryBattleTeamSnapshot,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";

type TerritoryPlayer = TerritoryBattlePlayerSnapshot & {
  joinedAt: number;
};

type TerritoryBattleRoomOptions = {
  seed?: string;
  durationSeconds?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSubmitWordMessage(
  payload: unknown
): TerritoryBattleSubmitWordMessage | null {
  if (!isRecord(payload) || typeof payload.word !== "string") return null;

  return {
    word: payload.word,
    cellId: typeof payload.cellId === "string" ? payload.cellId : undefined,
    submittedAt:
      typeof payload.submittedAt === "number" ? payload.submittedAt : undefined,
  };
}

export class TerritoryBattleRoom extends Room {
  maxClients = TERRITORY_BATTLE_DEFAULTS.maxPlayers;

  private phase: TerritoryBattlePhase = TERRITORY_BATTLE_PHASE.WAITING;
  private seed = "";
  private board: TerritoryCellSnapshot[] = [];
  private readonly players = new Map<string, TerritoryPlayer>();
  private readonly clientPlayerIds = new Map<string, string>();
  private readonly reconnectingPlayerIds = new Set<string>();
  private startsAt: number | undefined;
  private endsAt: number | undefined;
  private finishTimer: { clear: () => void } | null = null;

  onCreate(options?: TerritoryBattleRoomOptions) {
    this.seed = options?.seed?.trim() || `territory-${Date.now()}`;
    this.board = createTerritoryBoard({ seed: this.seed });
    this.phase = TERRITORY_BATTLE_PHASE.WAITING;
    this.autoDispose = true;

    this.onMessage(TERRITORY_BATTLE_EVENTS.READY, () => {
      this.startRoundIfNeeded();
    });

    this.onMessage(TERRITORY_BATTLE_EVENTS.START, () => {
      this.startRoundIfNeeded();
    });

    this.onMessage(TERRITORY_BATTLE_EVENTS.SUBMIT_WORD, (client, payload) => {
      this.submitWord(client, parseSubmitWordMessage(payload));
    });

    this.setState(this.createSnapshot());
  }

  onJoin(client: Client, options?: { nickname?: string }) {
    const playerIndex = this.players.size;
    const playerId = client.sessionId;
    const team = assignTerritoryTeam(playerIndex);
    const player: TerritoryPlayer = {
      id: playerId,
      nickname:
        typeof options?.nickname === "string" && options.nickname.trim()
          ? options.nickname.trim().slice(0, 24)
          : `Guest ${playerIndex + 1}`,
      team,
      score: 0,
      combo: 0,
      capturedCellCount: 0,
      accuracy: 100,
      cpm: 0,
      isConnected: true,
      joinedAt: Date.now(),
    };

    this.players.set(playerId, player);
    this.clientPlayerIds.set(client.sessionId, playerId);
    client.send(TERRITORY_BATTLE_EVENTS.STATE, this.createSnapshot());
    this.broadcastState();
  }

  onDrop(client: Client) {
    const playerId = this.clientPlayerIds.get(client.sessionId);
    const player = playerId ? this.players.get(playerId) : null;

    if (!playerId || !player) return;

    this.clientPlayerIds.delete(client.sessionId);
    this.reconnectingPlayerIds.add(playerId);
    player.isConnected = false;
    player.disconnectedAt = Date.now();
    this.broadcastState();

    this.allowReconnection(
      client,
      TERRITORY_BATTLE_DEFAULTS.reconnectGraceSeconds
    )
      .then((reconnectedClient) => {
        this.clientPlayerIds.set(reconnectedClient.sessionId, playerId);
        this.reconnectingPlayerIds.delete(playerId);
        player.isConnected = true;
        player.disconnectedAt = undefined;
        this.broadcastState();
      })
      .catch(() => {
        this.reconnectingPlayerIds.delete(playerId);
        this.players.delete(playerId);
        this.broadcastState();
      });
  }

  onReconnect(client: Client) {
    const playerId = this.clientPlayerIds.get(client.sessionId);
    const player = playerId ? this.players.get(playerId) : null;
    if (!player) return;

    player.isConnected = true;
    player.disconnectedAt = undefined;
    this.reconnectingPlayerIds.delete(player.id);
    this.broadcastState();
  }

  onLeave(client: Client) {
    const playerId =
      this.clientPlayerIds.get(client.sessionId) ?? client.sessionId;
    this.clientPlayerIds.delete(client.sessionId);

    if (this.reconnectingPlayerIds.has(playerId)) return;

    this.players.delete(playerId);
    this.broadcastState();
  }

  onDispose() {
    this.finishTimer?.clear();
  }

  private startRoundIfNeeded() {
    if (this.phase !== TERRITORY_BATTLE_PHASE.WAITING) return;

    const now = Date.now();
    this.phase = TERRITORY_BATTLE_PHASE.PLAYING;
    this.startsAt = now;
    this.endsAt = now + TERRITORY_BATTLE_DEFAULTS.durationSeconds * 1000;
    this.finishTimer = this.clock.setTimeout(() => {
      this.finishRound();
    }, TERRITORY_BATTLE_DEFAULTS.durationSeconds * 1000);
    this.broadcastState();
  }

  private submitWord(
    client: Client,
    message: TerritoryBattleSubmitWordMessage | null
  ) {
    const playerId = this.clientPlayerIds.get(client.sessionId);
    const player = playerId ? this.players.get(playerId) : null;

    if (!playerId || !player) return;

    if (this.phase !== TERRITORY_BATTLE_PHASE.PLAYING) {
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.INVALID_PHASE,
        message: "점령전이 진행 중일 때만 입력할 수 있습니다.",
      });
      return;
    }

    const now = Date.now();
    if (this.endsAt && now > this.endsAt) {
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.ROUND_ENDED,
        message: "이미 종료된 판입니다.",
      });
      return;
    }

    if (!message?.word.trim()) {
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.EMPTY_WORD,
        message: "입력한 단어가 비어 있습니다.",
      });
      return;
    }

    if (
      player.lastSubmittedAt &&
      now - player.lastSubmittedAt <
        TERRITORY_BATTLE_DEFAULTS.minSubmitIntervalMs
    ) {
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.TOO_FAST,
        message: "입력 간격이 너무 짧습니다.",
      });
      return;
    }

    const targetCell = findTerritoryCellByWord({
      board: this.board,
      word: message.word,
      preferredCellId: message.cellId,
    });

    if (!targetCell) {
      player.combo = 0;
      player.lastSubmittedAt = now;
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.WORD_NOT_FOUND,
        message: "보드에 없는 단어입니다.",
      });
      this.broadcastState();
      return;
    }

    if (targetCell.owner === player.team) {
      player.combo = 0;
      player.lastSubmittedAt = now;
      client.send(TERRITORY_BATTLE_EVENTS.ERROR, {
        code: TERRITORY_BATTLE_ERROR.ALREADY_OWNED,
        message: "이미 우리 팀이 점령한 칸입니다.",
      });
      this.broadcastState();
      return;
    }

    const nextCombo = player.combo + 1;
    const { board, result } = captureTerritoryCell({
      board: this.board,
      cellId: targetCell.id,
      team: player.team,
      playerId,
      combo: nextCombo,
      capturedAt: now,
    });

    this.board = board;
    player.combo = nextCombo;
    player.score += result.scoreDelta;
    player.capturedCellCount += 1;
    player.lastSubmittedAt = now;

    this.broadcast(TERRITORY_BATTLE_EVENTS.CELL_CAPTURED, {
      playerId,
      team: player.team,
      ...result,
    });
    this.broadcastState();
  }

  private finishRound() {
    if (this.phase === TERRITORY_BATTLE_PHASE.FINISHED) return;

    this.phase = TERRITORY_BATTLE_PHASE.FINISHED;
    const scores = this.createTeamSnapshots();
    const redScore =
      scores.find((score) => score.team === TERRITORY_BATTLE_TEAM.RED)?.score ??
      0;
    const blueScore =
      scores.find((score) => score.team === TERRITORY_BATTLE_TEAM.BLUE)
        ?.score ?? 0;
    const result = resolveTerritoryWinner({ redScore, blueScore });

    this.broadcast(TERRITORY_BATTLE_EVENTS.RESULT, {
      ...result,
      players: Array.from(this.players.values()).map((player) =>
        this.createPlayerSnapshot(player)
      ),
      board: this.board,
    });
    this.broadcastState();
  }

  private createPlayerSnapshot(
    player: TerritoryPlayer
  ): TerritoryBattlePlayerSnapshot {
    return {
      id: player.id,
      nickname: player.nickname,
      team: player.team,
      score: player.score,
      combo: player.combo,
      capturedCellCount: player.capturedCellCount,
      accuracy: player.accuracy,
      cpm: player.cpm,
      lastSubmittedAt: player.lastSubmittedAt,
      isConnected: player.isConnected,
      disconnectedAt: player.disconnectedAt,
    };
  }

  private createTeamSnapshots(): TerritoryBattleTeamSnapshot[] {
    return [TERRITORY_BATTLE_TEAM.RED, TERRITORY_BATTLE_TEAM.BLUE].map(
      (team: TerritoryBattleTeam) => ({
        team,
        score: Array.from(this.players.values())
          .filter((player) => player.team === team)
          .reduce((sum, player) => sum + player.score, 0),
        capturedCellCount: this.board.filter((cell) => cell.owner === team)
          .length,
      })
    );
  }

  private createSnapshot(): TerritoryBattleSnapshot {
    return {
      phase: this.phase,
      seed: this.seed,
      boardSize: TERRITORY_BATTLE_DEFAULTS.boardSize,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      board: this.board,
      players: Array.from(this.players.values()).map((player) =>
        this.createPlayerSnapshot(player)
      ),
      teams: this.createTeamSnapshots(),
    };
  }

  private broadcastState() {
    const snapshot = this.createSnapshot();
    this.setState(snapshot);
    this.broadcast(TERRITORY_BATTLE_EVENTS.STATE, snapshot);
    this.setMetadata({
      phase: snapshot.phase,
      players: snapshot.players.length,
    });
  }
}
