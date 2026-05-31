"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  mountTerritoryBattleEngine,
  type TerritoryBattleEngineController,
} from "@yeon/typing-race-engine";
import {
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_TEAM,
  captureTerritoryCell,
  createTerritoryBoard,
  findTerritoryCellByWord,
  resolveTerritoryWinner,
  type TerritoryBattleSnapshot,
  type TerritoryBattleTeam,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";
import {
  getTerritoryPhaseLabel,
  useTerritoryBattleRoom,
} from "./use-territory-battle-room";

type TeamScore = {
  red: number;
  blue: number;
};

type TeamPanelProps = {
  team: TerritoryBattleTeam;
  score: number;
  capturedCellCount: number;
  players: TerritoryBattleSnapshot["players"];
};

const LOCAL_PLAYER_ID = "local-red-player";
const PROTOTYPE_SEED = "territory-battle-v0-1";

const TEAM_VIEW = {
  red: {
    label: "RED TEAM",
    shortLabel: "RED",
    gradient: "from-[#8F3A4A]/90 via-[#B94A62]/80 to-[#C75C5C]/70",
    border: "border-[#C75C5C]/45",
    text: "text-[#F6B7BE]",
    tile: "border-[#C75C5C]/55 bg-[#8F3A4A]/35 text-[#FDE2E5]",
    glow: "shadow-[0_0_40px_rgba(199,92,92,0.18)]",
  },
  blue: {
    label: "BLUE TEAM",
    shortLabel: "BLUE",
    gradient: "from-[#334E8C]/90 via-[#4C63B6]/80 to-[#4F6FAD]/70",
    border: "border-[#4F6FAD]/45",
    text: "text-[#C7D2FE]",
    tile: "border-[#4F6FAD]/55 bg-[#334E8C]/35 text-[#E0E7FF]",
    glow: "shadow-[0_0_40px_rgba(79,111,173,0.18)]",
  },
} as const;

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
  if (owner === TERRITORY_BATTLE_TEAM.RED) return TEAM_VIEW.red.tile;
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) return TEAM_VIEW.blue.tile;
  return "border-[#CBD5E1]/25 bg-[#F8FAFC]/12 text-[#F8FAFC]";
}

function formatTimer(snapshot: TerritoryBattleSnapshot | null, now: number) {
  if (!snapshot?.endsAt || snapshot.phase !== TERRITORY_BATTLE_PHASE.PLAYING) {
    return snapshot?.phase === TERRITORY_BATTLE_PHASE.FINISHED
      ? "FINISH"
      : "READY";
  }

  const seconds = Math.max(0, Math.ceil((snapshot.endsAt - now) / 1000));
  return `00:${String(seconds).padStart(2, "0")}`;
}

function TeamPanel({
  team,
  score,
  capturedCellCount,
  players,
}: TeamPanelProps) {
  const view = TEAM_VIEW[team];
  const teamPlayers = players.filter((player) => player.team === team);

  return (
    <aside
      className={`flex min-h-0 flex-col rounded-[28px] border ${view.border} bg-[#0B1220]/78 p-4 ${view.glow} backdrop-blur-xl`}
    >
      <div className={`rounded-[22px] bg-gradient-to-br ${view.gradient} p-4`}>
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/70">
          {view.label}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-[42px] font-black leading-none tracking-[-0.08em] text-white">
            {score}P
          </p>
          <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-black text-white/85">
            {capturedCellCount} tiles
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
            Players
          </p>
          <div className="mt-3 grid gap-2">
            {(teamPlayers.length ? teamPlayers : [null]).map(
              (player, index) => (
                <div
                  key={player?.id ?? `${team}-empty-${index}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827]/70 px-3 py-2"
                >
                  <span className="truncate text-[13px] font-bold text-[#F8FAFC]">
                    {player?.nickname ?? "대기 중"}
                  </span>
                  <span
                    className={`ml-2 h-2.5 w-2.5 rounded-full ${
                      player?.isConnected ? "bg-[#A3E635]" : "bg-[#64748B]"
                    }`}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
              Accuracy
            </p>
            <p className="mt-1 text-[20px] font-black text-[#F8FAFC]">
              {Math.round(
                teamPlayers.reduce((sum, player) => sum + player.accuracy, 0) /
                  Math.max(teamPlayers.length, 1)
              )}
              %
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
              Combo
            </p>
            <p className="mt-1 text-[20px] font-black text-[#F8FAFC]">
              {teamPlayers.reduce(
                (max, player) => Math.max(max, player.combo),
                0
              )}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
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
  const [now, setNow] = useState(() => Date.now());
  const engineContainerRef = useRef<HTMLDivElement | null>(null);
  const engineControllerRef = useRef<TerritoryBattleEngineController | null>(
    null
  );
  const latestSnapshotRef = useRef<TerritoryBattleSnapshot | null>(
    territoryRoom.snapshot
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
  const redCapturedCells = countOwnedCells(displayBoard, "red");
  const blueCapturedCells = countOwnedCells(displayBoard, "blue");
  const winner = resolveTerritoryWinner({ redScore, blueScore }).winner;
  const engineSnapshot = useMemo<TerritoryBattleSnapshot>(
    () =>
      territoryRoom.snapshot ?? {
        phase: TERRITORY_BATTLE_PHASE.WAITING,
        seed: PROTOTYPE_SEED,
        boardSize: 5,
        board: displayBoard,
        players: [
          {
            id: LOCAL_PLAYER_ID,
            nickname: "Guest",
            team: TERRITORY_BATTLE_TEAM.RED,
            score: teamScore.red,
            combo,
            capturedCellCount: redCapturedCells,
            accuracy: 100,
            cpm: 0,
            isConnected: true,
          },
        ],
        teams: [
          {
            team: TERRITORY_BATTLE_TEAM.RED,
            score: teamScore.red,
            capturedCellCount: redCapturedCells,
          },
          {
            team: TERRITORY_BATTLE_TEAM.BLUE,
            score: teamScore.blue,
            capturedCellCount: blueCapturedCells,
          },
        ],
      },
    [
      blueCapturedCells,
      combo,
      displayBoard,
      redCapturedCells,
      teamScore.blue,
      teamScore.red,
      territoryRoom.snapshot,
    ]
  );
  const hudPlayers = engineSnapshot.players;
  const timerLabel = formatTimer(territoryRoom.snapshot, now);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    latestSnapshotRef.current = engineSnapshot;
    engineControllerRef.current?.setSnapshot(engineSnapshot);
  }, [engineSnapshot]);

  useEffect(() => {
    const container = engineContainerRef.current;
    if (!container) return;

    let cancelled = false;
    void mountTerritoryBattleEngine({
      container,
      snapshot: latestSnapshotRef.current ?? undefined,
    }).then((controller) => {
      if (cancelled) {
        controller.destroy();
        return;
      }

      engineControllerRef.current = controller;
      if (latestSnapshotRef.current)
        controller.setSnapshot(latestSnapshotRef.current);
    });

    return () => {
      cancelled = true;
      engineControllerRef.current?.destroy();
      engineControllerRef.current = null;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isServerConnected && territoryRoom.snapshot) {
      if (territoryRoom.snapshot.phase !== "playing") {
        setMessage("서버 판 시작 후 단어를 제출할 수 있습니다.");
        return;
      }

      territoryRoom.sendSubmitWord({ word: inputValue || targetWord });
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
    setTeamScore((score) => ({ ...score, red: score.red + result.scoreDelta }));
    setCombo(nextCombo);
    setInputValue("");
    setMessage(
      `${targetCell.word} 점령 성공 · +${result.scoreDelta}P${
        result.isSteal ? " · 탈환" : ""
      }${result.completesLine ? " · 라인 완성" : ""}`
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1E293B_0%,#111827_42%,#0F172A_100%)] text-[#F8FAFC]">
      <main className="grid h-full w-full grid-rows-[104px_minmax(0,1fr)_132px] gap-4 p-4">
        <header className="grid grid-cols-[minmax(210px,1fr)_minmax(260px,420px)_minmax(210px,1fr)] items-center gap-4">
          <div className="rounded-[26px] border border-[#C75C5C]/35 bg-[#0B1220]/72 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#F6B7BE]">
              RED SCORE
            </p>
            <p className="mt-1 text-[38px] font-black leading-none tracking-[-0.07em] text-[#F8FAFC]">
              {redScore}P
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[#F8FAFC]/10 px-6 py-4 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F2C94C]/80 to-transparent" />
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#CBD5E1]">
              Territory Battle
            </p>
            <p className="mt-1 text-[42px] font-black leading-none tracking-[-0.08em] text-[#F8FAFC]">
              {timerLabel}
            </p>
            <p className="mt-2 text-[12px] font-bold text-[#94A3B8]">
              {getTerritoryPhaseLabel(territoryRoom.snapshot?.phase ?? null)} ·
              연결 {territoryRoom.connectionState}
            </p>
          </div>

          <div className="rounded-[26px] border border-[#4F6FAD]/35 bg-[#0B1220]/72 px-5 py-4 text-right shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C7D2FE]">
              BLUE SCORE
            </p>
            <p className="mt-1 text-[38px] font-black leading-none tracking-[-0.07em] text-[#F8FAFC]">
              {blueScore}P
            </p>
          </div>
        </header>

        <section className="grid min-h-0 grid-cols-[240px_minmax(0,1fr)_240px] gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <TeamPanel
            team={TERRITORY_BATTLE_TEAM.RED}
            score={redScore}
            capturedCellCount={redCapturedCells}
            players={hudPlayers}
          />

          <div className="min-h-0 overflow-hidden rounded-[34px] border border-white/12 bg-[#0B1220]/74 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#111827]/80">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">
                    Polished Tactical Board
                  </p>
                  <h1 className="mt-1 text-[24px] font-black tracking-[-0.05em] text-[#F8FAFC]">
                    타자 점령전
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#CBD5E1]">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
                    {winner === "draw"
                      ? "동점"
                      : `${winner.toUpperCase()} 우세`}
                  </span>
                  <span className="rounded-full border border-[#A3E635]/20 bg-[#A3E635]/10 px-3 py-1 text-[#D9F99D]">
                    {isServerConnected ? "LIVE" : "LOCAL"}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 p-3">
                <div className="h-full min-h-[360px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0F172A]">
                  <div ref={engineContainerRef} className="h-full w-full" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0B1220]/80 px-5 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#94A3B8]">
                  Quick targets
                </p>
                <div className="flex min-w-0 flex-1 justify-end gap-2 overflow-hidden">
                  {displayBoard.slice(0, 5).map((cell) => (
                    <button
                      key={cell.id}
                      type="button"
                      className={`min-w-0 rounded-full border px-3 py-1.5 text-center text-[11px] font-black transition hover:scale-[1.02] ${getCellClass(
                        cell.owner
                      )}`}
                      onClick={() => setInputValue(cell.word)}
                    >
                      <span className="block max-w-20 truncate">
                        {cell.word}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <TeamPanel
            team={TERRITORY_BATTLE_TEAM.BLUE}
            score={blueScore}
            capturedCellCount={blueCapturedCells}
            players={hudPlayers}
          />
        </section>

        <footer className="grid grid-cols-[220px_minmax(0,1fr)_220px] items-stretch gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <div className="rounded-[26px] border border-white/10 bg-[#0B1220]/72 p-4 backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#94A3B8]">
              My Capture
            </p>
            <p className="mt-2 text-[34px] font-black leading-none tracking-[-0.06em] text-[#F8FAFC]">
              {combo} combo
            </p>
            <p className="mt-2 text-[12px] font-bold text-[#CBD5E1]">
              뒤집은 타일 {redCapturedCells}개
            </p>
          </div>

          <form
            className="grid grid-cols-[160px_minmax(0,1fr)_148px] items-center gap-3 rounded-[30px] border border-white/12 bg-[#F8FAFC]/10 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            onSubmit={handleSubmit}
          >
            <div className="rounded-2xl border border-[#F2C94C]/25 bg-[#F2C94C]/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F8D86A]">
                Target
              </p>
              <p className="mt-1 truncate text-[22px] font-black tracking-[-0.04em] text-[#F8FAFC]">
                {targetWord}
              </p>
            </div>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="h-16 rounded-2xl border border-white/15 bg-[#F8FAFC] px-5 text-[22px] font-black tracking-[-0.04em] text-[#111827] outline-none ring-0 placeholder:text-[#64748B] focus:border-[#F2C94C]"
              placeholder="보드 단어 입력"
              autoComplete="off"
            />
            <button
              type="submit"
              className="h-16 rounded-2xl border border-[#F2C94C]/30 bg-[#F2C94C] px-4 text-[16px] font-black tracking-[-0.03em] text-[#111827] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              입력하기
            </button>
          </form>

          <div className="rounded-[26px] border border-white/10 bg-[#0B1220]/72 p-4 backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#94A3B8]">
              Controls
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  territoryRoom.sendStart();
                  setMessage("서버 점령전 시작을 요청했습니다.");
                }}
                disabled={!isServerConnected}
                className="rounded-xl border border-white/12 bg-white/[0.08] px-3 py-2 text-[12px] font-black text-[#F8FAFC] transition hover:bg-white/[0.14] disabled:opacity-40"
              >
                시작
              </button>
              <button
                type="button"
                onClick={() => territoryRoom.rejoin()}
                className="rounded-xl border border-white/12 bg-white/[0.08] px-3 py-2 text-[12px] font-black text-[#F8FAFC] transition hover:bg-white/[0.14]"
              >
                재연결
              </button>
            </div>
            <p className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-[#CBD5E1]">
              {territoryRoom.roomError?.message ?? message}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
