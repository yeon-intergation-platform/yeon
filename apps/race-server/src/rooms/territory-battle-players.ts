import {
  assignTerritoryTeam,
  type TerritoryBattlePlayerSnapshot,
} from "@yeon/race-shared";

export type TerritoryPlayer = TerritoryBattlePlayerSnapshot & {
  joinedAt: number;
};

export function createTerritoryPlayer({
  nickname,
  playerId,
  playerIndex,
}: {
  nickname?: string;
  playerId: string;
  playerIndex: number;
}): TerritoryPlayer {
  return {
    id: playerId,
    nickname: normalizeTerritoryNickname(nickname, playerIndex),
    team: assignTerritoryTeam(playerIndex),
    score: 0,
    combo: 0,
    capturedCellCount: 0,
    accuracy: 100,
    cpm: 0,
    isConnected: true,
    joinedAt: Date.now(),
  };
}

export function createTerritoryPlayerSnapshot(
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

function normalizeTerritoryNickname(
  nickname: string | undefined,
  playerIndex: number
): string {
  return typeof nickname === "string" && nickname.trim()
    ? nickname.trim().slice(0, 24)
    : `Guest ${playerIndex + 1}`;
}
