import { describe, expect, it } from "vitest";

import {
  TERRITORY_BATTLE_DEFAULT_WORDS,
  TERRITORY_BATTLE_SCORE,
  TERRITORY_BATTLE_TEAM,
  assignTerritoryTeam,
  calculateTerritoryScore,
  captureTerritoryCell,
  createTerritoryBoard,
  findTerritoryCellByWord,
  resolveTerritoryWinner,
} from "./territory-battle";

describe("territory-battle", () => {
  it("같은 seed는 같은 보드를 만든다", () => {
    const firstBoard = createTerritoryBoard({ seed: "round-1" });
    const secondBoard = createTerritoryBoard({ seed: "round-1" });

    expect(firstBoard).toEqual(secondBoard);
    expect(firstBoard).toHaveLength(25);
    expect(new Set(firstBoard.map((cell) => cell.word)).size).toBe(25);
  });

  it("점수는 글자 수, 무오타, 탈환, 콤보, 라인 보너스를 반영한다", () => {
    expect(
      calculateTerritoryScore({
        word: "한동대",
        combo: 3,
        isSteal: true,
        completesLine: true,
      })
    ).toBe(
      3 * TERRITORY_BATTLE_SCORE.perCharacter +
        TERRITORY_BATTLE_SCORE.perfectBonus +
        TERRITORY_BATTLE_SCORE.stealBonus +
        3 * TERRITORY_BATTLE_SCORE.comboMultiplier +
        TERRITORY_BATTLE_SCORE.lineBonus
    );
  });

  it("단어로 보드 칸을 찾고 점령한다", () => {
    const board = createTerritoryBoard({ seed: "capture" });
    const target = findTerritoryCellByWord({ board, word: board[0]!.word });

    expect(target?.id).toBe(board[0]!.id);

    const { board: nextBoard, result } = captureTerritoryCell({
      board,
      cellId: target!.id,
      team: TERRITORY_BATTLE_TEAM.RED,
      playerId: "player-1",
      combo: 1,
      capturedAt: 1000,
    });

    expect(result.cell.owner).toBe(TERRITORY_BATTLE_TEAM.RED);
    expect(result.isSteal).toBe(false);
    expect(nextBoard.find((cell) => cell.id === target!.id)?.owner).toBe(
      TERRITORY_BATTLE_TEAM.RED
    );
  });

  it("상대 칸을 점령하면 탈환으로 계산한다", () => {
    const board = createTerritoryBoard({ seed: "steal" });
    const firstCell = board[0]!;
    const blueBoard = board.map((cell) =>
      cell.id === firstCell.id
        ? { ...cell, owner: TERRITORY_BATTLE_TEAM.BLUE }
        : cell
    );

    const { result } = captureTerritoryCell({
      board: blueBoard,
      cellId: firstCell.id,
      team: TERRITORY_BATTLE_TEAM.RED,
      playerId: "player-1",
      combo: 0,
      capturedAt: 1000,
    });

    expect(result.isSteal).toBe(true);
  });

  it("행 또는 열을 완성하면 라인 보너스 대상이다", () => {
    const board = createTerritoryBoard({
      seed: "line",
      boardSize: 2,
      words: TERRITORY_BATTLE_DEFAULT_WORDS,
    });
    const redBoard = board.map((cell) =>
      cell.row === 0 ? { ...cell, owner: TERRITORY_BATTLE_TEAM.RED } : cell
    );

    const { result } = captureTerritoryCell({
      board: redBoard,
      boardSize: 2,
      cellId: board.find((cell) => cell.row === 1 && cell.col === 0)!.id,
      team: TERRITORY_BATTLE_TEAM.RED,
      playerId: "player-1",
      combo: 0,
      capturedAt: 1000,
    });

    expect(result.completesLine).toBe(true);
  });

  it("플레이어 순서로 팀을 교차 배정한다", () => {
    expect(assignTerritoryTeam(0)).toBe(TERRITORY_BATTLE_TEAM.RED);
    expect(assignTerritoryTeam(1)).toBe(TERRITORY_BATTLE_TEAM.BLUE);
    expect(assignTerritoryTeam(2)).toBe(TERRITORY_BATTLE_TEAM.RED);
  });

  it("점수로 승리 팀을 결정한다", () => {
    expect(resolveTerritoryWinner({ redScore: 10, blueScore: 5 }).winner).toBe(
      TERRITORY_BATTLE_TEAM.RED
    );
    expect(resolveTerritoryWinner({ redScore: 5, blueScore: 10 }).winner).toBe(
      TERRITORY_BATTLE_TEAM.BLUE
    );
    expect(resolveTerritoryWinner({ redScore: 10, blueScore: 10 }).winner).toBe(
      "draw"
    );
  });
});
