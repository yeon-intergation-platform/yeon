import {
  TERRITORY_BATTLE_DEFAULTS,
  TERRITORY_BATTLE_TEAM,
  type TerritoryBattlePhase,
  type TerritoryBattleSnapshot,
  type TerritoryBattleTeam,
  type TerritoryBattleTeamSnapshot,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";

import {
  createTerritoryPlayerSnapshot,
  type TerritoryPlayer,
} from "./territory-battle-players";

export function createTerritoryTeamSnapshots({
  board,
  players,
}: {
  board: readonly TerritoryCellSnapshot[];
  players: Iterable<TerritoryPlayer>;
}): TerritoryBattleTeamSnapshot[] {
  const playerList = Array.from(players);
  return [TERRITORY_BATTLE_TEAM.RED, TERRITORY_BATTLE_TEAM.BLUE].map(
    (team: TerritoryBattleTeam) => ({
      team,
      score: playerList
        .filter((player) => player.team === team)
        .reduce((sum, player) => sum + player.score, 0),
      capturedCellCount: board.filter((cell) => cell.owner === team).length,
    })
  );
}

export function createTerritoryBattleSnapshot({
  board,
  endsAt,
  phase,
  players,
  seed,
  startsAt,
}: {
  board: TerritoryCellSnapshot[];
  endsAt: number | undefined;
  phase: TerritoryBattlePhase;
  players: Iterable<TerritoryPlayer>;
  seed: string;
  startsAt: number | undefined;
}): TerritoryBattleSnapshot {
  const playerList = Array.from(players);
  return {
    phase,
    seed,
    boardSize: TERRITORY_BATTLE_DEFAULTS.boardSize,
    startsAt,
    endsAt,
    board,
    players: playerList.map((player) => createTerritoryPlayerSnapshot(player)),
    teams: createTerritoryTeamSnapshots({ board, players: playerList }),
  };
}
