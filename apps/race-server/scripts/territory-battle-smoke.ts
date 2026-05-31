import { Client, type Room } from "@colyseus/sdk";
import {
  TERRITORY_BATTLE_DEFAULTS,
  TERRITORY_BATTLE_ERROR,
  TERRITORY_BATTLE_EVENTS,
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_ROOM_NAME,
  type TerritoryBattleErrorCode,
  type TerritoryBattleSnapshot,
} from "@yeon/race-shared";

type SmokeOptions = {
  players: number;
  delayMs: number;
  reconnect: boolean;
  url: string;
};

type SmokeRoom = {
  client: Client;
  room: Room<TerritoryBattleSnapshot>;
  errors: TerritoryBattleErrorCode[];
  snapshot: TerritoryBattleSnapshot | null;
};

function parseOptions(): SmokeOptions {
  const options: SmokeOptions = {
    players: 2,
    delayMs: TERRITORY_BATTLE_DEFAULTS.minSubmitIntervalMs + 50,
    reconnect: false,
    url: process.env.RACE_SERVER_SMOKE_URL ?? "ws://localhost:2567",
  };

  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key === "players" && value) options.players = Number(value);
    if (key === "delay-ms" && value) options.delayMs = Number(value);
    if (key === "reconnect") options.reconnect = value !== "0";
    if (key === "url" && value) options.url = value;
  }

  if (
    !Number.isInteger(options.players) ||
    options.players < 2 ||
    options.players > 6
  ) {
    throw new Error("--players는 2~6 정수여야 합니다.");
  }
  if (!Number.isFinite(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms는 0 이상의 숫자여야 합니다.");
  }

  return options;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(
  predicate: () => boolean,
  description: string,
  timeoutMs = 5_000
) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (predicate()) return;
    await sleep(50);
  }
  throw new Error(`${description} 대기 시간이 초과되었습니다.`);
}

async function joinSmokeRoom(
  client: Client,
  index: number
): Promise<SmokeRoom> {
  const room = await client.joinOrCreate<TerritoryBattleSnapshot>(
    TERRITORY_BATTLE_ROOM_NAME,
    { nickname: `Smoke ${index + 1}` }
  );
  const smokeRoom: SmokeRoom = {
    client,
    room,
    errors: [],
    snapshot: null,
  };

  room.onMessage(TERRITORY_BATTLE_EVENTS.STATE, (snapshot) => {
    smokeRoom.snapshot = snapshot;
  });
  room.onStateChange((snapshot) => {
    smokeRoom.snapshot = snapshot as TerritoryBattleSnapshot;
  });
  room.onMessage(TERRITORY_BATTLE_EVENTS.ERROR, (message) => {
    const maybeCode = (message as { code?: unknown }).code;
    if (typeof maybeCode === "string") {
      smokeRoom.errors.push(maybeCode as TerritoryBattleErrorCode);
    }
  });
  room.onMessage(TERRITORY_BATTLE_EVENTS.CELL_CAPTURED, () => undefined);

  await waitFor(
    () => smokeRoom.snapshot !== null,
    `플레이어 ${index + 1} snapshot`
  );
  return smokeRoom;
}

function pickSubmittableWord(
  snapshot: TerritoryBattleSnapshot,
  playerId: string
) {
  const player = snapshot.players.find((entry) => entry.id === playerId);
  if (!player)
    throw new Error(`플레이어 ${playerId}를 snapshot에서 찾을 수 없습니다.`);

  const target =
    snapshot.board.find((cell) => cell.owner === "neutral") ??
    snapshot.board.find((cell) => cell.owner !== player.team);

  if (!target) throw new Error("제출 가능한 보드 칸이 없습니다.");
  return target.word;
}

async function submitOne(room: SmokeRoom) {
  const snapshot = room.snapshot;
  if (!snapshot) throw new Error("snapshot이 없습니다.");
  const playerId = room.room.sessionId;
  const word = pickSubmittableWord(snapshot, playerId);
  room.room.send(TERRITORY_BATTLE_EVENTS.SUBMIT_WORD, { word });
  await waitFor(
    () =>
      (room.snapshot?.players.find((player) => player.id === playerId)
        ?.capturedCellCount ?? 0) > 0,
    `${playerId} 점령 반영`
  );
}

async function assertTooFastGuard(room: SmokeRoom) {
  const snapshot = room.snapshot;
  if (!snapshot) throw new Error("snapshot이 없습니다.");
  const firstWord = pickSubmittableWord(snapshot, room.room.sessionId);
  const secondWord =
    snapshot.board.find((cell) => cell.word !== firstWord)?.word ?? firstWord;

  room.room.send(TERRITORY_BATTLE_EVENTS.SUBMIT_WORD, { word: firstWord });
  room.room.send(TERRITORY_BATTLE_EVENTS.SUBMIT_WORD, { word: secondWord });

  await waitFor(
    () => room.errors.includes(TERRITORY_BATTLE_ERROR.TOO_FAST),
    "too-fast 오류"
  );
}

async function assertReconnect(room: SmokeRoom) {
  const token = room.room.reconnectionToken;
  const roomId = room.room.roomId;
  const playerId = room.room.sessionId;
  if (!token) throw new Error("reconnectionToken이 없습니다.");

  room.room.connection.close(4001, "territory-smoke-reconnect");
  await sleep(200);
  const reconnected =
    await room.client.reconnect<TerritoryBattleSnapshot>(token);
  room.room = reconnected;

  reconnected.onMessage(TERRITORY_BATTLE_EVENTS.STATE, (snapshot) => {
    room.snapshot = snapshot;
  });
  reconnected.onStateChange((snapshot) => {
    room.snapshot = snapshot as TerritoryBattleSnapshot;
  });
  reconnected.onMessage(TERRITORY_BATTLE_EVENTS.CELL_CAPTURED, () => undefined);

  await waitFor(
    () =>
      room.room.roomId === roomId &&
      room.snapshot?.players.some(
        (player) => player.id === playerId && player.isConnected
      ) === true,
    "재접속 상태 복구"
  );
}

async function main() {
  const options = parseOptions();
  const rooms: SmokeRoom[] = [];

  try {
    for (let index = 0; index < options.players; index += 1) {
      rooms.push(await joinSmokeRoom(new Client(options.url), index));
    }

    rooms[0]?.room.send(TERRITORY_BATTLE_EVENTS.START, {});
    await waitFor(
      () =>
        rooms.every(
          (entry) => entry.snapshot?.phase === TERRITORY_BATTLE_PHASE.PLAYING
        ),
      "경기 시작"
    );

    await assertTooFastGuard(rooms[0]!);
    await sleep(
      TERRITORY_BATTLE_DEFAULTS.minSubmitIntervalMs + options.delayMs
    );

    for (const room of rooms) {
      await submitOne(room);
      await sleep(options.delayMs);
    }

    if (options.reconnect) {
      await assertReconnect(rooms[0]!);
    }

    const snapshot = rooms[0]?.snapshot;
    if (!snapshot) throw new Error("최종 snapshot이 없습니다.");
    const capturedCells = snapshot.board.filter(
      (cell) => cell.owner !== "neutral"
    ).length;
    const totalScore = snapshot.teams.reduce(
      (sum, team) => sum + team.score,
      0
    );

    if (capturedCells < options.players) {
      throw new Error(
        `점령 칸이 부족합니다: ${capturedCells}/${options.players}`
      );
    }
    if (totalScore <= 0) {
      throw new Error("팀 점수가 증가하지 않았습니다.");
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          url: options.url,
          players: options.players,
          delayMs: options.delayMs,
          reconnect: options.reconnect,
          roomId: rooms[0]?.room.roomId,
          capturedCells,
          totalScore,
          tooFastGuard: rooms[0]?.errors.includes(
            TERRITORY_BATTLE_ERROR.TOO_FAST
          ),
        },
        null,
        2
      )
    );
  } finally {
    await Promise.allSettled(rooms.map((entry) => entry.room.leave(true)));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
