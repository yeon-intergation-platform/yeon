"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
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
const RESULT_RETURN_SECONDS = 24;

const TEAM_VIEW = {
  red: {
    label: "빨강팀",
    shortLabel: "빨강",
    gradient: "from-red-700 via-red-600 to-red-500",
    border: "border-red-400/70",
    text: "text-red-100",
    tile: "border-red-300 bg-red-600 text-white",
    glow: "shadow-[0_0_40px_rgba(199,92,92,0.18)]",
  },
  blue: {
    label: "파랑팀",
    shortLabel: "파랑",
    gradient: "from-sky-600 via-sky-500 to-blue-400",
    border: "border-sky-300/70",
    text: "text-sky-100",
    tile: "border-sky-300 bg-sky-600 text-white",
    glow: "shadow-[0_0_40px_rgba(79,111,173,0.18)]",
  },
} as const;

type TypingTerritoryBattleScreenProps = {
  originRoomId: string | null;
};

function getTeamDisplayLabel(team: TerritoryBattleTeam) {
  return team === TERRITORY_BATTLE_TEAM.RED ? "빨강팀" : "파랑팀";
}

function getTeamResultClass(team: TerritoryBattleTeam) {
  return team === TERRITORY_BATTLE_TEAM.RED
    ? "border-red-400 bg-red-600"
    : "border-sky-400 bg-sky-600";
}

function TerritoryGateScreen() {
  return (
    <div className="min-h-screen bg-white px-4 py-8 text-[#111]">
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8">
          <p className="text-[13px] font-black uppercase tracking-[0.24em] text-[#111]">
            타자방 선입장 필요
          </p>
          <h1 className="mt-4 text-[34px] font-black tracking-[-0.06em]">
            점령전은 타자방 참가 후 입장합니다.
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-7 text-[#666]">
            먼저 로비에서 타자방을 만들거나 참가한 다음, 대기방의 ‘점령전 입장’
            버튼으로 들어가 주세요.
          </p>
          <a
            href="/typing-service/rooms"
            className="mt-6 inline-flex rounded-2xl bg-[#111] px-6 py-3 text-[14px] font-black text-white"
          >
            타자방 로비로 이동
          </a>
        </div>
      </main>
    </div>
  );
}

function TerritoryResultBoard({
  snapshot,
  winner,
  redScore,
  blueScore,
  returnPath,
  remainingSeconds,
}: {
  snapshot: TerritoryBattleSnapshot;
  winner: TerritoryBattleTeam | "draw";
  redScore: number;
  blueScore: number;
  returnPath: string;
  remainingSeconds: number;
}) {
  const rankedPlayers = [...snapshot.players].sort((a, b) => b.score - a.score);
  const redPlayers = rankedPlayers.filter(
    (player) => player.team === TERRITORY_BATTLE_TEAM.RED
  );
  const bluePlayers = rankedPlayers.filter(
    (player) => player.team === TERRITORY_BATTLE_TEAM.BLUE
  );
  const currentPlayer =
    rankedPlayers.find((player) => player.id === LOCAL_PLAYER_ID) ??
    rankedPlayers[0] ??
    null;
  const currentRank = currentPlayer
    ? rankedPlayers.findIndex((player) => player.id === currentPlayer.id) + 1
    : null;

  const teamRows = [
    {
      team: TERRITORY_BATTLE_TEAM.RED,
      score: redScore,
      players: redPlayers,
      capturedCellCount:
        snapshot.teams.find((team) => team.team === TERRITORY_BATTLE_TEAM.RED)
          ?.capturedCellCount ?? 0,
    },
    {
      team: TERRITORY_BATTLE_TEAM.BLUE,
      score: blueScore,
      players: bluePlayers,
      capturedCellCount:
        snapshot.teams.find((team) => team.team === TERRITORY_BATTLE_TEAM.BLUE)
          ?.capturedCellCount ?? 0,
    },
  ];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 px-6 py-5">
      <div className="relative grid h-full max-h-[760px] w-full max-w-[1360px] grid-rows-[96px_minmax(0,1fr)_96px] overflow-hidden rounded-[28px] border-2 border-sky-500/70 bg-black/80 shadow-[0_0_80px_rgba(250,204,21,0.35)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.72)_0%,rgba(250,204,21,0.25)_34%,transparent_70%)]" />

        <header className="relative flex items-center justify-center">
          <div className="rounded-[28px] border-4 border-white bg-indigo-800 px-8 py-3 text-center shadow-[0_0_44px_rgba(250,204,21,0.72)]">
            <p className="text-[44px] font-black leading-none tracking-[-0.08em] text-white [text-shadow:0_4px_0_rgba(0,0,0,0.55)]">
              {winner === "draw" ? "무승부" : "승리"}
            </p>
          </div>
        </header>

        <section className="relative grid min-h-0 grid-cols-[minmax(220px,1fr)_minmax(420px,660px)_minmax(220px,1fr)] gap-6 px-8 pb-4">
          {teamRows.map(({ team, players }) => (
            <aside
              key={team}
              className="flex min-h-0 flex-col rounded-[24px] border-2 border-sky-500/60 bg-black/72 p-4"
            >
              <div
                className={`flex items-center gap-3 rounded-t-[18px] px-5 py-3 text-white ${
                  team === TERRITORY_BATTLE_TEAM.RED ? "bg-[#111]" : "bg-[#666]"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[22px]">
                  🚀
                </span>
                <p className="text-[24px] font-black tracking-[-0.05em]">
                  {getTeamDisplayLabel(team)}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {(players.length ? players : [null, null, null])
                  .slice(0, 3)
                  .map((player, index) => (
                    <div
                      key={player?.id ?? `${team}-empty-${index}`}
                      className={`grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-white ${
                        index === 1 ? "ring-2 ring-purple-500" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fafafa] text-[20px] font-black text-[#111]">
                        {index + 1}
                      </span>
                      <span className="truncate text-[14px] font-black">
                        {player?.nickname ?? "대기 중"}
                      </span>
                      <span className="text-[13px] font-black text-white/80">
                        {player?.score ?? 0}
                      </span>
                    </div>
                  ))}
              </div>
            </aside>
          ))}

          <div className="grid min-h-0 grid-cols-2 items-start gap-6 self-center">
            {teamRows.map(({ team, score, capturedCellCount }) => {
              const isWinner = winner === team;

              return (
                <article
                  key={team}
                  className={`rounded-[22px] border-4 bg-white p-2 shadow-xl ${
                    isWinner ? "scale-[1.02]" : "opacity-90"
                  } ${getTeamResultClass(team)}`}
                >
                  <div className="rounded-[18px] bg-white p-4">
                    <h2
                      className={`rounded-2xl px-4 py-3 text-center text-[30px] font-black tracking-[-0.08em] text-white ${
                        team === TERRITORY_BATTLE_TEAM.RED
                          ? "bg-[#111]"
                          : "bg-[#666]"
                      }`}
                    >
                      {getTeamDisplayLabel(team)}
                    </h2>
                    <div className="mt-4 grid gap-4">
                      <ResultScoreRow label="판 점수" value={`${score}P`} />
                      <ResultScoreRow
                        label="보너스 게임"
                        value={`${capturedCellCount * 100}P`}
                      />
                      <ResultScoreRow label="팀 점수" value={`${score}P`} />
                      {team === currentPlayer?.team && (
                        <>
                          <ResultScoreRow
                            label="내 순위"
                            value={currentRank ? `${currentRank}위` : "-"}
                          />
                          <ResultScoreRow
                            label="획득 포인트"
                            value={`${currentPlayer.capturedCellCount}`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="relative grid grid-cols-[220px_minmax(0,1fr)_220px] items-center gap-5 bg-slate-300/95 px-6">
          <a
            href="/typing-service/rooms"
            className="rounded-[24px] bg-red-500 px-7 py-4 text-center text-[22px] font-black text-white shadow-lg"
          >
            방 나가기
          </a>
          <p className="text-center text-[28px] font-black tracking-[-0.06em] text-white [text-shadow:0_2px_0_rgba(0,0,0,0.22)]">
            {remainingSeconds}초 뒤 대기방으로 이동합니다.
          </p>
          <a
            href={returnPath}
            className="rounded-[24px] bg-sky-500 px-7 py-4 text-center text-[22px] font-black text-white shadow-lg"
          >
            대기방
          </a>
        </footer>
      </div>
    </div>
  );
}

function ResultScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl bg-[#111] px-4 py-2 text-white shadow-inner">
      <span className="text-[18px] font-black tracking-[-0.04em]">{label}</span>
      <span className="text-[20px] font-black tracking-[-0.04em]">{value}</span>
    </div>
  );
}

function countOwnedCells(
  board: readonly TerritoryCellSnapshot[],
  owner: "red" | "blue"
) {
  return board.filter((cell) => cell.owner === owner).length;
}

function getOpponentTeam(team: TerritoryBattleTeam): TerritoryBattleTeam {
  return team === TERRITORY_BATTLE_TEAM.RED
    ? TERRITORY_BATTLE_TEAM.BLUE
    : TERRITORY_BATTLE_TEAM.RED;
}

function pickNextTargetWord(
  board: readonly TerritoryCellSnapshot[],
  myTeam: TerritoryBattleTeam
) {
  const opponentTeam = getOpponentTeam(myTeam);

  return (
    board.find((cell) => cell.owner === opponentTeam) ??
    board.find((cell) => cell.owner === "neutral") ??
    board.find((cell) => cell.owner !== myTeam) ??
    board[0]
  )?.word;
}

function getCellClass(owner: TerritoryCellSnapshot["owner"]) {
  if (owner === TERRITORY_BATTLE_TEAM.RED) return TEAM_VIEW.red.tile;
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) return TEAM_VIEW.blue.tile;
  return "border-slate-600 bg-slate-800 text-white";
}

function getCellOwnerLabel(owner: TerritoryCellSnapshot["owner"]) {
  if (owner === TERRITORY_BATTLE_TEAM.RED) return "빨강";
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) return "파랑";
  return "중립";
}

function TerritoryCardBoard({
  board,
  myTeam,
  targetWord,
  redScore,
  blueScore,
  onPickWord,
}: {
  board: readonly TerritoryCellSnapshot[];
  myTeam: TerritoryBattleTeam;
  targetWord: string;
  redScore: number;
  blueScore: number;
  onPickWord: (word: string) => void;
}) {
  const opponentTeam = getOpponentTeam(myTeam);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-white/10 bg-[#111827] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/10 pb-3">
        <p className="text-left text-[14px] font-black text-red-200">
          RED {redScore}P
        </p>
        <div className="text-center">
          <p className="text-[26px] font-black leading-none tracking-[-0.06em] text-white">
            {targetWord ? "READY" : "WAIT"}
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-300">
            상대팀 카드를 입력하면 내 팀 카드로 뒤집힙니다.
          </p>
        </div>
        <p className="text-right text-[14px] font-black text-sky-200">
          BLUE {blueScore}P
        </p>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <div className="grid h-full max-h-[620px] w-full max-w-[720px] grid-cols-5 gap-2">
          {board.map((cell) => {
            const isOpponentCard = cell.owner === opponentTeam;
            const isMyCard = cell.owner === myTeam;
            const isTarget = cell.word === targetWord;

            return (
              <button
                key={cell.id}
                type="button"
                onClick={() => onPickWord(cell.word)}
                className={`group relative min-h-20 rounded-[10px] border-2 px-2 py-3 text-center shadow-inner transition hover:-translate-y-0.5 hover:brightness-110 ${getCellClass(
                  cell.owner
                )} ${isTarget ? "ring-4 ring-[#111]" : ""} ${
                  isOpponentCard ? "cursor-pointer" : ""
                } ${isMyCard ? "opacity-90" : ""}`}
              >
                <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-black text-white/80">
                  {getCellOwnerLabel(cell.owner)}
                </span>
                <span className="flex h-full items-center justify-center pt-3 text-[18px] font-black tracking-[-0.05em] text-white [text-shadow:0_2px_0_rgba(0,0,0,0.28)]">
                  {cell.word}
                </span>
                {isOpponentCard && (
                  <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/18 py-0.5 text-[10px] font-black text-white opacity-0 transition group-hover:opacity-100">
                    뒤집기 타깃
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center text-[12px] font-black">
        <div className="rounded-xl border border-red-300/40 bg-red-600 px-3 py-2 text-white">
          빨강 카드
        </div>
        <div className="rounded-xl border border-slate-500 bg-slate-800 px-3 py-2 text-white">
          중립 카드
        </div>
        <div className="rounded-xl border border-sky-300/40 bg-sky-600 px-3 py-2 text-white">
          파랑 카드
        </div>
      </div>
    </div>
  );
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

export function TypingTerritoryBattleScreen({
  originRoomId,
}: TypingTerritoryBattleScreenProps) {
  if (!originRoomId) {
    return <TerritoryGateScreen />;
  }

  return <TypingTerritoryBattleGameScreen originRoomId={originRoomId} />;
}

function TypingTerritoryBattleGameScreen({
  originRoomId,
}: {
  originRoomId: string;
}) {
  const router = useRouter();
  const [resultReturnSeconds, setResultReturnSeconds] = useState(
    RESULT_RETURN_SECONDS
  );
  const territoryRoom = useTerritoryBattleRoom({
    enabled: true,
    nickname: "Guest",
    originRoomId,
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
  const displayBoard = territoryRoom.snapshot?.board ?? board;
  const isServerConnected =
    territoryRoom.connectionState === "connected" && !!territoryRoom.snapshot;
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
  const currentPlayer =
    hudPlayers.find((player) => player.id === LOCAL_PLAYER_ID) ??
    hudPlayers[0] ??
    null;
  const myTeam = currentPlayer?.team ?? TERRITORY_BATTLE_TEAM.RED;
  const opponentTeam = getOpponentTeam(myTeam);
  const myCapturedCells =
    myTeam === TERRITORY_BATTLE_TEAM.RED ? redCapturedCells : blueCapturedCells;
  const targetWord = pickNextTargetWord(displayBoard, myTeam) ?? "";
  const timerLabel = formatTimer(territoryRoom.snapshot, now);
  const returnPath = `/typing-service/rooms/${encodeURIComponent(
    originRoomId
  )}`;
  const resultWinner = territoryRoom.result?.winner ?? winner;
  const shouldShowResult =
    engineSnapshot.phase === TERRITORY_BATTLE_PHASE.FINISHED ||
    Boolean(territoryRoom.result);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!shouldShowResult) {
      setResultReturnSeconds(RESULT_RETURN_SECONDS);
      return;
    }

    const intervalId = window.setInterval(() => {
      setResultReturnSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [shouldShowResult]);

  useEffect(() => {
    if (!shouldShowResult || resultReturnSeconds > 0) return;
    router.push(returnPath);
  }, [resultReturnSeconds, returnPath, router, shouldShowResult]);

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

    if (targetCell.owner === myTeam) {
      setCombo(0);
      setMessage(
        "이미 우리 팀 카드입니다. 상대팀 카드나 중립 카드를 입력해 주세요."
      );
      return;
    }

    const nextCombo = combo + 1;
    const { board: nextBoard, result } = captureTerritoryCell({
      board,
      cellId: targetCell.id,
      team: myTeam,
      playerId: LOCAL_PLAYER_ID,
      combo: nextCombo,
      capturedAt: Date.now(),
    });

    setBoard(nextBoard);
    setTeamScore((score) =>
      myTeam === TERRITORY_BATTLE_TEAM.RED
        ? { ...score, red: score.red + result.scoreDelta }
        : { ...score, blue: score.blue + result.scoreDelta }
    );
    setCombo(nextCombo);
    setInputValue("");
    setMessage(
      `${targetCell.word} 카드 뒤집기 성공 · +${result.scoreDelta}P${
        result.isSteal ? " · 탈환" : ""
      }${result.completesLine ? " · 라인 완성" : ""}`
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1E293B_0%,#111827_42%,#0F172A_100%)] text-[#F8FAFC]">
      <main className="grid h-full w-full grid-rows-[104px_minmax(0,1fr)_132px] gap-4 p-4">
        <header className="grid grid-cols-[minmax(210px,1fr)_minmax(260px,420px)_minmax(210px,1fr)] items-center gap-4">
          <div className="rounded-[26px] border border-[#C75C5C]/35 bg-[#0B1220]/72 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#F6B7BE]">
              빨강팀 점수
            </p>
            <p className="mt-1 text-[38px] font-black leading-none tracking-[-0.07em] text-[#F8FAFC]">
              {redScore}P
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[#F8FAFC]/10 px-6 py-4 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F2C94C]/80 to-transparent" />
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#CBD5E1]">
              Card Flip Battle
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
              파랑팀 점수
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
                    중앙 카드를 뒤집는 팀 점령전
                  </p>
                  <h1 className="mt-1 text-[24px] font-black tracking-[-0.05em] text-[#F8FAFC]">
                    상대팀 카드를 입력해 뒤집으세요
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#CBD5E1]">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
                    {winner === "draw"
                      ? "동점"
                      : `${winner.toUpperCase()} 우세`}
                  </span>
                  <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[#111]">
                    내 팀 {getTeamDisplayLabel(myTeam)} · 타깃{" "}
                    {getTeamDisplayLabel(opponentTeam)}
                  </span>
                  <span className="rounded-full border border-[#A3E635]/20 bg-[#A3E635]/10 px-3 py-1 text-[#D9F99D]">
                    {isServerConnected ? "LIVE" : "LOCAL"}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 p-3">
                <TerritoryCardBoard
                  board={displayBoard}
                  myTeam={myTeam}
                  targetWord={targetWord}
                  redScore={redScore}
                  blueScore={blueScore}
                  onPickWord={setInputValue}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0B1220]/80 px-5 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#94A3B8]">
                  뒤집을 판
                </p>
                <div className="flex min-w-0 flex-1 justify-end gap-2 overflow-hidden">
                  {displayBoard
                    .filter((cell) => cell.owner === opponentTeam)
                    .concat(
                      displayBoard.filter((cell) => cell.owner === "neutral")
                    )
                    .slice(0, 5)
                    .map((cell) => (
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
              내가 뒤집은 판
            </p>
            <p className="mt-2 text-[34px] font-black leading-none tracking-[-0.06em] text-[#F8FAFC]">
              {combo} combo
            </p>
            <p className="mt-2 text-[12px] font-bold text-[#CBD5E1]">
              뒤집은 판 {myCapturedCells}개
            </p>
          </div>

          <form
            className="grid grid-cols-[160px_minmax(0,1fr)_148px] items-center gap-3 rounded-[30px] border border-white/12 bg-[#F8FAFC]/10 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            onSubmit={handleSubmit}
          >
            <div className="rounded-2xl border border-[#F2C94C]/25 bg-[#F2C94C]/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F8D86A]">
                뒤집을 단어
              </p>
              <p className="mt-1 truncate text-[22px] font-black tracking-[-0.04em] text-[#F8FAFC]">
                {targetWord || "대기"}
              </p>
            </div>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="h-16 rounded-2xl border border-white/15 bg-[#F8FAFC] px-5 text-[22px] font-black tracking-[-0.04em] text-[#111827] outline-none ring-0 placeholder:text-[#64748B] focus:border-[#F2C94C]"
              placeholder="뒤집을 판의 단어를 입력해주세요"
              autoComplete="off"
            />
            <button
              type="submit"
              className="h-16 rounded-2xl border border-[#F2C94C]/30 bg-[#F2C94C] px-4 text-[16px] font-black tracking-[-0.03em] text-[#111827] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              입력하기 ↵
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
                  setMessage("판 뒤집기 점령전 시작을 요청했습니다.");
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
      {shouldShowResult && (
        <TerritoryResultBoard
          snapshot={engineSnapshot}
          winner={resultWinner}
          redScore={redScore}
          blueScore={blueScore}
          returnPath={returnPath}
          remainingSeconds={resultReturnSeconds}
        />
      )}
    </div>
  );
}
