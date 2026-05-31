"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  TERRITORY_BATTLE_TEAM,
  captureTerritoryCell,
  createTerritoryBoard,
  findTerritoryCellByWord,
  resolveTerritoryWinner,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";
import { YeonButton, YeonSurface } from "@/components/yeon-ui";
import { TypingServiceHeader } from "./typing-service-header";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import {
  getTerritoryPhaseLabel,
  useTerritoryBattleRoom,
} from "./use-territory-battle-room";

type TeamScore = {
  red: number;
  blue: number;
};

const LOCAL_PLAYER_ID = "local-red-player";
const PROTOTYPE_SEED = "territory-battle-v0-1";

function countOwnedCells(
  board: readonly TerritoryCellSnapshot[],
  owner: "red" | "blue"
) {
  return board.filter((cell) => cell.owner === owner).length;
}

function pickNextTargetWord(board: readonly TerritoryCellSnapshot[]) {
  return (
    board.find((cell) => cell.owner === "neutral") ??
    board.find((cell) => cell.owner === TERRITORY_BATTLE_TEAM.BLUE) ??
    board[0]
  )?.word;
}

function getCellClass(owner: TerritoryCellSnapshot["owner"]) {
  if (owner === TERRITORY_BATTLE_TEAM.RED) {
    return "border-[#ef4444] bg-[#fff1f1] text-[#991b1b]";
  }
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) {
    return "border-[#2563eb] bg-[#eff6ff] text-[#1e3a8a]";
  }
  return "border-[#e5e5e5] bg-white text-[#333]";
}

export function TypingTerritoryBattleScreen() {
  const territoryRoom = useTerritoryBattleRoom({
    enabled: true,
    nickname: "Guest",
  });
  const initialBoard = useMemo(
    () => createTerritoryBoard({ seed: PROTOTYPE_SEED }),
    []
  );
  const [board, setBoard] = useState(initialBoard);
  const [teamScore, setTeamScore] = useState<TeamScore>({ red: 0, blue: 0 });
  const [combo, setCombo] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState(
    "서버 연결 전에는 로컬 규칙으로 점령전을 체험할 수 있습니다."
  );
  const displayBoard = territoryRoom.snapshot?.board ?? board;
  const isServerConnected =
    territoryRoom.connectionState === "connected" && !!territoryRoom.snapshot;
  const targetWord = pickNextTargetWord(displayBoard) ?? "";
  const redScore =
    territoryRoom.snapshot?.teams.find(
      (team) => team.team === TERRITORY_BATTLE_TEAM.RED
    )?.score ?? teamScore.red;
  const blueScore =
    territoryRoom.snapshot?.teams.find(
      (team) => team.team === TERRITORY_BATTLE_TEAM.BLUE
    )?.score ?? teamScore.blue;
  const winner = resolveTerritoryWinner({
    redScore,
    blueScore,
  }).winner;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isServerConnected && territoryRoom.snapshot) {
      if (territoryRoom.snapshot.phase !== "playing") {
        setMessage("서버 판 시작 후 단어를 제출할 수 있습니다.");
        return;
      }

      territoryRoom.sendSubmitWord({
        word: inputValue || targetWord,
      });
      setInputValue("");
      setMessage("서버에 제출했습니다. 판정 결과를 기다립니다.");
      return;
    }

    const targetCell = findTerritoryCellByWord({
      board,
      word: inputValue || targetWord,
    });

    if (!targetCell) {
      setCombo(0);
      setMessage("보드에 있는 단어를 정확히 입력해 주세요.");
      return;
    }

    if (targetCell.owner === TERRITORY_BATTLE_TEAM.RED) {
      setCombo(0);
      setMessage(
        "이미 우리 팀이 점령한 칸입니다. 중립 또는 상대 칸을 입력해 주세요."
      );
      return;
    }

    const nextCombo = combo + 1;
    const { board: nextBoard, result } = captureTerritoryCell({
      board,
      cellId: targetCell.id,
      team: TERRITORY_BATTLE_TEAM.RED,
      playerId: LOCAL_PLAYER_ID,
      combo: nextCombo,
      capturedAt: Date.now(),
    });

    setBoard(nextBoard);
    setTeamScore((score) => ({
      ...score,
      red: score.red + result.scoreDelta,
    }));
    setCombo(nextCombo);
    setInputValue("");
    setMessage(
      `${targetCell.word} 점령 성공 · +${result.scoreDelta}P${
        result.isSteal ? " · 탈환" : ""
      }${result.completesLine ? " · 라인 완성" : ""}`
    );
  }

  return (
    <div className={"min-h-screen bg-white text-[#111]"}>
      <TypingServiceHeader active="home" title="YEON 타자연습" />

      <main className={"mx-auto max-w-[1400px] px-4 py-6 md:px-10"}>
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <YeonSurface className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e5e5] pb-4">
              <div>
                <p className={TYPING_SERVICE_COMMON_CLASS.panelMetaText}>
                  팀 기반 타자 게임
                </p>
                <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#111]">
                  타자 점령전
                </h1>
                <p
                  className={`mt-3 max-w-[720px] ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
                >
                  단어를 정확히 입력해 보드 칸을 점령합니다. 실제 멀티플레이
                  판정은 race-server가 확정하고, 연결 실패 시에는 로컬 규칙 체험
                  화면으로 동작합니다.
                </p>
              </div>
              <YeonButton as="a" href="/typing-service" variant="secondary">
                타자 홈으로
              </YeonButton>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {displayBoard.map((cell) => (
                <button
                  key={cell.id}
                  type="button"
                  className={`min-h-[64px] rounded-xl border px-2 text-center text-[13px] font-bold transition-colors ${getCellClass(
                    cell.owner
                  )}`}
                  onClick={() => setInputValue(cell.word)}
                >
                  {cell.word}
                </button>
              ))}
            </div>
          </YeonSurface>

          <aside className="grid gap-4">
            <YeonSurface className="p-5">
              <h2 className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}>
                팀 점수
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#ef4444] bg-[#fff1f1] p-4">
                  <p className="text-[12px] font-bold text-[#991b1b]">RED</p>
                  <p className="mt-1 text-[28px] font-black text-[#991b1b]">
                    {redScore}P
                  </p>
                  <p className="mt-1 text-[12px] text-[#991b1b]">
                    {countOwnedCells(displayBoard, "red")}칸
                  </p>
                </div>
                <div className="rounded-2xl border border-[#2563eb] bg-[#eff6ff] p-4">
                  <p className="text-[12px] font-bold text-[#1e3a8a]">BLUE</p>
                  <p className="mt-1 text-[28px] font-black text-[#1e3a8a]">
                    {blueScore}P
                  </p>
                  <p className="mt-1 text-[12px] text-[#1e3a8a]">
                    {countOwnedCells(displayBoard, "blue")}칸
                  </p>
                </div>
              </div>
              <p className={`mt-4 text-[13px] leading-6 text-[#666]`}>
                현재 판정: {winner === "draw" ? "동점" : `${winner} 우세`}
              </p>
            </YeonSurface>

            <YeonSurface className="p-5">
              <h2 className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}>
                서버 판
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-[#666]">
                연결: {territoryRoom.connectionState} · 단계:{" "}
                {getTerritoryPhaseLabel(territoryRoom.snapshot?.phase ?? null)}
                {territoryRoom.roomId ? ` · 방 ${territoryRoom.roomId}` : ""}
              </p>
              {territoryRoom.roomError ? (
                <p className="mt-2 text-[13px] leading-6 text-[#b91c1c]">
                  {territoryRoom.roomError.message}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <YeonButton
                  type="button"
                  variant="primary"
                  onClick={() => {
                    territoryRoom.sendStart();
                    setMessage("서버 점령전 시작을 요청했습니다.");
                  }}
                  disabled={!isServerConnected}
                >
                  서버 판 시작
                </YeonButton>
                <YeonButton
                  type="button"
                  variant="secondary"
                  onClick={() => territoryRoom.rejoin()}
                >
                  다시 연결
                </YeonButton>
              </div>
            </YeonSurface>

            <YeonSurface className="p-5">
              <h2 className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}>
                입력
              </h2>
              <p className="mt-3 text-[24px] font-black tracking-[-0.03em] text-[#111]">
                {targetWord}
              </p>
              <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="h-12 rounded-xl border border-[#d4d4d4] px-4 text-[16px] font-bold outline-none focus:border-[#111]"
                  placeholder="보드 단어 입력"
                  autoComplete="off"
                />
                <YeonButton type="submit" variant="primary">
                  입력하기
                </YeonButton>
              </form>
              <p className={`mt-4 text-[13px] leading-6 text-[#666]`}>
                콤보 {combo} · {territoryRoom.roomError?.message ?? message}
              </p>
            </YeonSurface>
          </aside>
        </section>
      </main>
    </div>
  );
}
