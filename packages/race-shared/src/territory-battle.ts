export const TERRITORY_BATTLE_ROOM_NAME = "typing_territory_battle";

export const TERRITORY_BATTLE_PHASE = {
  WAITING: "waiting",
  COUNTDOWN: "countdown",
  PLAYING: "playing",
  FINISHED: "finished",
} as const;

export type TerritoryBattlePhase =
  (typeof TERRITORY_BATTLE_PHASE)[keyof typeof TERRITORY_BATTLE_PHASE];

export const TERRITORY_BATTLE_TEAM = {
  RED: "red",
  BLUE: "blue",
} as const;

export type TerritoryBattleTeam =
  (typeof TERRITORY_BATTLE_TEAM)[keyof typeof TERRITORY_BATTLE_TEAM];

export const TERRITORY_CELL_OWNER = {
  NEUTRAL: "neutral",
  RED: TERRITORY_BATTLE_TEAM.RED,
  BLUE: TERRITORY_BATTLE_TEAM.BLUE,
} as const;

export type TerritoryCellOwner =
  (typeof TERRITORY_CELL_OWNER)[keyof typeof TERRITORY_CELL_OWNER];

export const TERRITORY_BATTLE_EVENTS = {
  JOIN: "territory.join",
  READY: "territory.ready",
  START: "territory.start",
  SUBMIT_WORD: "territory.submitWord",
  STATE: "territory.state",
  CELL_CAPTURED: "territory.cellCaptured",
  RESULT: "territory.result",
  ERROR: "territory.error",
  PING: "territory.ping",
} as const;

export const TERRITORY_BATTLE_DEFAULTS = {
  boardSize: 5,
  durationSeconds: 60,
  countdownSeconds: 3,
  maxPlayers: 6,
  minSubmitIntervalMs: 250,
  reconnectGraceSeconds: 30,
} as const;

export const TERRITORY_BATTLE_SCORE = {
  perCharacter: 10,
  perfectBonus: 20,
  stealBonus: 30,
  comboMultiplier: 5,
  lineBonus: 100,
} as const;

export const TERRITORY_BATTLE_ERROR = {
  INVALID_PHASE: "invalid-phase",
  ROUND_ENDED: "round-ended",
  EMPTY_WORD: "empty-word",
  WORD_NOT_FOUND: "word-not-found",
  ALREADY_OWNED: "already-owned",
  TOO_FAST: "too-fast",
} as const;

export type TerritoryBattleErrorCode =
  (typeof TERRITORY_BATTLE_ERROR)[keyof typeof TERRITORY_BATTLE_ERROR];

export type TerritoryCellSnapshot = {
  id: string;
  row: number;
  col: number;
  word: string;
  owner: TerritoryCellOwner;
  lastCapturedBy?: string;
  capturedAt?: number;
};

export type TerritoryBattlePlayerSnapshot = {
  id: string;
  nickname: string;
  team: TerritoryBattleTeam;
  score: number;
  combo: number;
  capturedCellCount: number;
  accuracy: number;
  cpm: number;
  lastSubmittedAt?: number;
  isConnected: boolean;
  disconnectedAt?: number;
};

export type TerritoryBattleTeamSnapshot = {
  team: TerritoryBattleTeam;
  score: number;
  capturedCellCount: number;
};

export type TerritoryBattleSnapshot = {
  phase: TerritoryBattlePhase;
  seed: string;
  boardSize: number;
  startsAt?: number;
  endsAt?: number;
  board: readonly TerritoryCellSnapshot[];
  players: readonly TerritoryBattlePlayerSnapshot[];
  teams: readonly TerritoryBattleTeamSnapshot[];
};

export type TerritoryBattleSubmitWordMessage = {
  word: string;
  cellId?: string;
  submittedAt?: number;
};

export type TerritoryBattleScoreInput = {
  word: string;
  combo: number;
  isSteal?: boolean;
  completesLine?: boolean;
  isPerfect?: boolean;
};

export type TerritoryBattleCaptureResult = {
  cell: TerritoryCellSnapshot;
  scoreDelta: number;
  isSteal: boolean;
  completesLine: boolean;
};

export type TerritoryBattleWinnerResult = {
  winner: TerritoryBattleTeam | "draw";
  redScore: number;
  blueScore: number;
};

export const TERRITORY_BATTLE_DEFAULT_WORDS = [
  "한동대",
  "구미",
  "연산동",
  "팔공산",
  "외도",
  "달맞이길",
  "울릉도",
  "진주성",
  "대구",
  "청도반시",
  "문경새재",
  "구미역",
  "부산역",
  "성류굴",
  "마린시티",
  "철성시장",
  "광구항",
  "해운대구",
  "낙동강",
  "씨앗호떡",
  "풍기인삼",
  "덕천",
  "사과나무",
  "의성",
  "기림사",
] as const;

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed) || 1;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function normalizeTerritoryWord(word: string) {
  return word.replace(/\s+/g, "").trim();
}

export function createTerritoryBoard({
  seed,
  boardSize = TERRITORY_BATTLE_DEFAULTS.boardSize,
  words = TERRITORY_BATTLE_DEFAULT_WORDS,
}: {
  seed: string;
  boardSize?: number;
  words?: readonly string[];
}) {
  const normalizedWords = Array.from(
    new Set(words.map(normalizeTerritoryWord).filter(Boolean))
  );
  const requiredCount = boardSize * boardSize;

  if (normalizedWords.length < requiredCount) {
    throw new Error("타자 점령전 보드에 필요한 단어가 부족합니다.");
  }

  const random = createSeededRandom(seed);
  const shuffled = [...normalizedWords];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled
    .slice(0, requiredCount)
    .map<TerritoryCellSnapshot>((word, index) => ({
      id: `cell-${index}`,
      row: Math.floor(index / boardSize),
      col: index % boardSize,
      word,
      owner: TERRITORY_CELL_OWNER.NEUTRAL,
    }));
}

export function calculateTerritoryScore({
  word,
  combo,
  isSteal = false,
  completesLine = false,
  isPerfect = true,
}: TerritoryBattleScoreInput) {
  const baseScore =
    normalizeTerritoryWord(word).length * TERRITORY_BATTLE_SCORE.perCharacter;
  return (
    baseScore +
    (isPerfect ? TERRITORY_BATTLE_SCORE.perfectBonus : 0) +
    (isSteal ? TERRITORY_BATTLE_SCORE.stealBonus : 0) +
    combo * TERRITORY_BATTLE_SCORE.comboMultiplier +
    (completesLine ? TERRITORY_BATTLE_SCORE.lineBonus : 0)
  );
}

function getTeamOwnedCells(
  board: readonly TerritoryCellSnapshot[],
  team: TerritoryBattleTeam
) {
  return board.filter((cell) => cell.owner === team);
}

export function countTerritoryCells(
  board: readonly TerritoryCellSnapshot[],
  team: TerritoryBattleTeam
) {
  return getTeamOwnedCells(board, team).length;
}

export function completesTerritoryLine({
  board,
  boardSize = TERRITORY_BATTLE_DEFAULTS.boardSize,
  team,
}: {
  board: readonly TerritoryCellSnapshot[];
  boardSize?: number;
  team: TerritoryBattleTeam;
}) {
  for (let index = 0; index < boardSize; index += 1) {
    const rowComplete = board.every((cell) =>
      cell.row === index ? cell.owner === team : true
    );
    const colComplete = board.every((cell) =>
      cell.col === index ? cell.owner === team : true
    );

    if (rowComplete || colComplete) {
      return true;
    }
  }

  return false;
}

export function captureTerritoryCell({
  board,
  cellId,
  team,
  playerId,
  combo,
  capturedAt,
  boardSize = TERRITORY_BATTLE_DEFAULTS.boardSize,
}: {
  board: readonly TerritoryCellSnapshot[];
  cellId: string;
  team: TerritoryBattleTeam;
  playerId: string;
  combo: number;
  capturedAt: number;
  boardSize?: number;
}): { board: TerritoryCellSnapshot[]; result: TerritoryBattleCaptureResult } {
  const targetCell = board.find((cell) => cell.id === cellId);
  if (!targetCell) {
    throw new Error("점령할 칸을 찾지 못했습니다.");
  }

  const isSteal =
    targetCell.owner !== TERRITORY_CELL_OWNER.NEUTRAL &&
    targetCell.owner !== team;
  const nextBoard = board.map((cell) =>
    cell.id === cellId
      ? {
          ...cell,
          owner: team,
          lastCapturedBy: playerId,
          capturedAt,
        }
      : cell
  );
  const completesLine = completesTerritoryLine({
    board: nextBoard,
    boardSize,
    team,
  });
  const scoreDelta = calculateTerritoryScore({
    word: targetCell.word,
    combo,
    isSteal,
    completesLine,
    isPerfect: true,
  });
  const capturedCell = nextBoard.find((cell) => cell.id === cellId)!;

  return {
    board: nextBoard,
    result: {
      cell: capturedCell,
      scoreDelta,
      isSteal,
      completesLine,
    },
  };
}

export function findTerritoryCellByWord({
  board,
  word,
  preferredCellId,
}: {
  board: readonly TerritoryCellSnapshot[];
  word: string;
  preferredCellId?: string;
}) {
  const normalizedWord = normalizeTerritoryWord(word);

  if (preferredCellId) {
    const preferredCell = board.find((cell) => cell.id === preferredCellId);
    if (preferredCell?.word === normalizedWord) return preferredCell;
  }

  return board.find((cell) => cell.word === normalizedWord) ?? null;
}

export function assignTerritoryTeam(playerIndex: number): TerritoryBattleTeam {
  return playerIndex % 2 === 0
    ? TERRITORY_BATTLE_TEAM.RED
    : TERRITORY_BATTLE_TEAM.BLUE;
}

export function resolveTerritoryWinner({
  redScore,
  blueScore,
}: {
  redScore: number;
  blueScore: number;
}): TerritoryBattleWinnerResult {
  return {
    redScore,
    blueScore,
    winner:
      redScore > blueScore
        ? TERRITORY_BATTLE_TEAM.RED
        : blueScore > redScore
          ? TERRITORY_BATTLE_TEAM.BLUE
          : "draw",
  };
}
