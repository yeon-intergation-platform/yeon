"use client";
import { useEffect, useMemo, useState } from "react";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import {
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_TEAM,
  captureTerritoryCell,
  createTerritoryBoard,
  findTerritoryCellByWord,
  resolveTerritoryWinner,
  type TerritoryBattleSnapshot,
  type TerritoryBattlePhase,
  type TerritoryBattleTeam,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";
import { useTerritoryBattleRoom } from "./use-territory-battle-room";
import { useTypingSettings, type TypingLocale } from "./use-typing-settings";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  YeonSurface,
  YeonText,
  YeonForm,
  YeonView,
  type YeonFormEvent,
  type YeonFormElement,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import {
  clearYeonInterval,
  getYeonNow,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

type TeamScore = {
  red: number;
  blue: number;
};

type TeamPanelProps = {
  team: TerritoryBattleTeam;
  score: number;
  capturedCellCount: number;
  players: TerritoryBattleSnapshot["players"];
  labels: TerritoryBattleText;
};

const LOCAL_PLAYER_ID = "local-red-player";
const PROTOTYPE_SEED = "territory-battle-v0-1";
const RESULT_RETURN_SECONDS = 24;

type TypingTerritoryBattleScreenProps = {
  originRoomId: string | null;
};

type TerritoryBattleText = {
  gate: {
    eyebrow: string;
    title: string;
    description: string;
    lobby: string;
  };
  result: {
    draw: string;
    victory: string;
    waitingPlayer: string;
    boardScore: string;
    bonusGame: string;
    teamScore: string;
    myRank: string;
    rank: (rank: number) => string;
    earnedPoints: string;
    leaveRoom: string;
    countdown: (seconds: number) => string;
    waitingRoom: string;
  };
  team: Record<
    TerritoryBattleTeam,
    {
      label: string;
      shortLabel: string;
      scoreLabel: string;
      cardLabel: string;
    }
  > & {
    neutralLabel: string;
    neutralCardLabel: string;
    waitingPlayer: string;
    players: string;
    tiles: (count: number) => string;
  };
  board: {
    instruction: string;
    targetHover: string;
    currentTarget: string;
  };
  game: {
    initialMessage: string;
    serverNotPlaying: string;
    submitted: string;
    wordNotFound: string;
    ownCell: string;
    flipSuccess: (word: string, scoreDelta: number, suffix: string) => string;
    steal: string;
    lineComplete: string;
    cardFlipBattle: string;
    phase: Record<TerritoryBattlePhase | "none", string>;
    connection: (state: string) => string;
    title: string;
    subtitle: string;
    draw: string;
    leading: (winner: TerritoryBattleTeam) => string;
    teamTarget: (myTeam: string, opponentTeam: string) => string;
    targetBoard: string;
    capturedMine: string;
    capturedSummary: (count: number) => string;
    wordToFlip: string;
    waiting: string;
    placeholder: string;
    submit: string;
    controls: string;
    startRequested: string;
    start: string;
    reconnect: string;
    connectionError: string;
  };
};

const TERRITORY_BATTLE_TEXT: Record<TypingLocale, TerritoryBattleText> = {
  ko: {
    gate: {
      eyebrow: "타자방 선입장 필요",
      title: "점령전은 점령전 방 참가 후 입장합니다.",
      description:
        "먼저 로비에서 점령전 방을 만들거나 참가한 다음, 대기방의 ‘점령전 입장’ 버튼으로 들어가 주세요.",
      lobby: "타자방 로비로 이동",
    },
    result: {
      draw: "무승부",
      victory: "승리",
      waitingPlayer: "대기 중",
      boardScore: "판 점수",
      bonusGame: "보너스 게임",
      teamScore: "팀 점수",
      myRank: "내 순위",
      rank: (rank) => `${rank}위`,
      earnedPoints: "획득 포인트",
      leaveRoom: "방 나가기",
      countdown: (seconds) => `${seconds}초 뒤 대기방으로 이동합니다.`,
      waitingRoom: "대기방",
    },
    team: {
      red: {
        label: "빨강팀",
        shortLabel: "빨강",
        scoreLabel: "빨강팀 점수",
        cardLabel: "빨강 카드",
      },
      blue: {
        label: "파랑팀",
        shortLabel: "파랑",
        scoreLabel: "파랑팀 점수",
        cardLabel: "파랑 카드",
      },
      neutralLabel: "중립",
      neutralCardLabel: "중립 카드",
      waitingPlayer: "대기 중",
      players: "Players",
      tiles: (count) => `${count} tiles`,
    },
    board: {
      instruction: "상대팀 카드를 입력하면 내 팀 카드로 뒤집힙니다.",
      targetHover: "뒤집기 타깃",
      currentTarget: "뒤집을 판",
    },
    game: {
      initialMessage:
        "서버 연결 전에는 로컬 규칙으로 점령전을 체험할 수 있습니다.",
      serverNotPlaying: "서버 판 시작 후 단어를 제출할 수 있습니다.",
      submitted: "서버에 제출했습니다. 판정 결과를 기다립니다.",
      wordNotFound: "보드에 있는 단어를 정확히 입력해 주세요.",
      ownCell:
        "이미 우리 팀 카드입니다. 상대팀 카드나 중립 카드를 입력해 주세요.",
      flipSuccess: (word, scoreDelta, suffix) =>
        `${word} 카드 뒤집기 성공 · +${scoreDelta}P${suffix}`,
      steal: "탈환",
      lineComplete: "라인 완성",
      cardFlipBattle: "Card Flip Battle",
      phase: {
        waiting: "대기",
        countdown: "카운트다운",
        playing: "진행 중",
        finished: "종료",
        none: "연결 전",
      },
      connection: (state) => `연결 ${state}`,
      title: "중앙 카드를 뒤집는 팀 점령전",
      subtitle: "상대팀 카드를 입력해 뒤집으세요",
      draw: "동점",
      leading: (winner) => `${winner.toUpperCase()} 우세`,
      teamTarget: (myTeam, opponentTeam) =>
        `내 팀 ${myTeam} · 타깃 ${opponentTeam}`,
      targetBoard: "뒤집을 판",
      capturedMine: "내가 뒤집은 판",
      capturedSummary: (count) => `뒤집은 판 ${count}개`,
      wordToFlip: "뒤집을 단어",
      waiting: "대기",
      placeholder: "뒤집을 판의 단어를 입력해주세요",
      submit: "입력하기 ↵",
      controls: "Controls",
      startRequested: "판 뒤집기 점령전 시작을 요청했습니다.",
      start: "시작",
      reconnect: "재연결",
      connectionError: "점령전 서버에 연결할 수 없습니다.",
    },
  },
  en: {
    gate: {
      eyebrow: "Join a room first",
      title: "Territory Battle starts from a territory room.",
      description:
        "Create or join a territory room in the lobby, then enter from the Territory Battle button in the waiting room.",
      lobby: "Go to typing room lobby",
    },
    result: {
      draw: "Draw",
      victory: "Victory",
      waitingPlayer: "Waiting",
      boardScore: "Board Score",
      bonusGame: "Bonus",
      teamScore: "Team Score",
      myRank: "My Rank",
      rank: (rank) => `#${rank}`,
      earnedPoints: "Points Earned",
      leaveRoom: "Leave Room",
      countdown: (seconds) => `Returning to the waiting room in ${seconds}s.`,
      waitingRoom: "Waiting Room",
    },
    team: {
      red: {
        label: "Red Team",
        shortLabel: "Red",
        scoreLabel: "Red Team Score",
        cardLabel: "Red Card",
      },
      blue: {
        label: "Blue Team",
        shortLabel: "Blue",
        scoreLabel: "Blue Team Score",
        cardLabel: "Blue Card",
      },
      neutralLabel: "Neutral",
      neutralCardLabel: "Neutral Card",
      waitingPlayer: "Waiting",
      players: "Players",
      tiles: (count) => `${count} tiles`,
    },
    board: {
      instruction: "Type an opposing card to flip it to your team.",
      targetHover: "Flip target",
      currentTarget: "Flip Target",
    },
    game: {
      initialMessage:
        "You can try Territory Battle locally before the server connects.",
      serverNotPlaying: "Submit words after the server round starts.",
      submitted: "Submitted to the server. Waiting for the result.",
      wordNotFound: "Type a word that appears on the board.",
      ownCell:
        "This card already belongs to your team. Type an opposing or neutral card.",
      flipSuccess: (word, scoreDelta, suffix) =>
        `${word} card flipped · +${scoreDelta}P${suffix}`,
      steal: "Steal",
      lineComplete: "Line Complete",
      cardFlipBattle: "Card Flip Battle",
      phase: {
        waiting: "Waiting",
        countdown: "Countdown",
        playing: "Playing",
        finished: "Finished",
        none: "Not connected",
      },
      connection: (state) => `Connection ${state}`,
      title: "Team territory battle over the center board",
      subtitle: "Type opposing cards to flip them",
      draw: "Draw",
      leading: (winner) => `${winner.toUpperCase()} leading`,
      teamTarget: (myTeam, opponentTeam) =>
        `My team ${myTeam} · Target ${opponentTeam}`,
      targetBoard: "Flip Target",
      capturedMine: "My Flipped Cards",
      capturedSummary: (count) => `${count} flipped cards`,
      wordToFlip: "Word to Flip",
      waiting: "Waiting",
      placeholder: "Type the word on the card to flip",
      submit: "Submit ↵",
      controls: "Controls",
      startRequested: "Requested Territory Battle start.",
      start: "Start",
      reconnect: "Reconnect",
      connectionError: "Could not connect to the territory server.",
    },
  },
};

function useTerritoryBattleText() {
  const { settings } = useTypingSettings();
  return TERRITORY_BATTLE_TEXT[settings.locale];
}

function getTeamDisplayLabel(
  team: TerritoryBattleTeam,
  labels: TerritoryBattleText
) {
  return labels.team[team].label;
}

function getTerritoryPhaseDisplayLabel(
  phase: TerritoryBattlePhase | null,
  labels: TerritoryBattleText
) {
  return phase ? labels.game.phase[phase] : labels.game.phase.none;
}

function getTeamResultClass(team: TerritoryBattleTeam) {
  return team === TERRITORY_BATTLE_TEAM.RED
    ? "border-[#111] bg-[#fafafa]"
    : "border-[#e5e5e5] bg-white";
}

function TerritoryGateScreen({ labels }: { labels: TerritoryBattleText }) {
  return (
    <YeonView className="min-h-screen bg-white px-4 py-8 text-[#111]">
      <YeonView
        as="main"
        className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center"
      >
        <YeonSurface variant="panel" className="p-8">
          <YeonText variant="label" className="uppercase tracking-[0.24em]">
            {labels.gate.eyebrow}
          </YeonText>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-4 text-[34px] font-black tracking-[-0.06em] text-[#111]"
          >
            {labels.gate.title}
          </YeonText>
          <YeonText className="mt-3 font-medium">
            {labels.gate.description}
          </YeonText>
          <YeonButton
            as="a"
            href="/typing-service/rooms"
            variant="primary"
            size="lg"
            className="mt-6"
          >
            {labels.gate.lobby}
          </YeonButton>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}

function TerritoryResultBoard({
  snapshot,
  winner,
  redScore,
  blueScore,
  returnPath,
  remainingSeconds,
  labels,
}: {
  snapshot: TerritoryBattleSnapshot;
  winner: TerritoryBattleTeam | "draw";
  redScore: number;
  blueScore: number;
  returnPath: string;
  remainingSeconds: number;
  labels: TerritoryBattleText;
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
    <YeonView className="absolute inset-0 z-20 flex items-center justify-center bg-[#111]/70 px-6 py-5">
      <YeonView
        className={`relative grid h-full max-h-[760px] w-full max-w-[1360px] grid-rows-[96px_minmax(0,1fr)_96px] overflow-hidden rounded-[28px] border border-[#e5e5e5] bg-white ${YEON_WEB_SHADOW_CLASS.modal}`}
      >
        <YeonView
          as="header"
          className="relative flex items-center justify-center"
        >
          <YeonView className="rounded-[28px] border border-[#111] bg-[#111] px-8 py-3 text-center">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[44px] font-black leading-none tracking-[-0.08em] text-white"
            >
              {winner === "draw" ? labels.result.draw : labels.result.victory}
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonView
          as="section"
          className="relative grid min-h-0 grid-cols-[minmax(220px,1fr)_minmax(420px,660px)_minmax(220px,1fr)] gap-6 px-8 pb-4"
        >
          {teamRows.map(({ team, players }) => (
            <YeonView
              as="aside"
              key={team}
              className="flex min-h-0 flex-col rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] p-4"
            >
              <YeonView className="flex items-center gap-3 rounded-t-[18px] border border-[#e5e5e5] bg-white px-5 py-3 text-[#111]">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[22px]"
                >
                  🚀
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[24px] font-black tracking-[-0.05em]"
                >
                  {getTeamDisplayLabel(team, labels)}
                </YeonText>
              </YeonView>

              <YeonView className="mt-5 grid gap-3">
                {(players.length ? players : [null, null, null])
                  .slice(0, 3)
                  .map((player, index) => (
                    <YeonView
                      key={player?.id ?? `${team}-empty-${index}`}
                      className={`grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[#111] ${
                        index === 1 ? "ring-2 ring-[#111]" : ""
                      }`}
                    >
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fafafa] text-[20px] font-black text-[#111]"
                      >
                        {index + 1}
                      </YeonText>
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="truncate text-[14px] font-black"
                      >
                        {player?.nickname ?? labels.result.waitingPlayer}
                      </YeonText>
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="text-[13px] font-black text-[#666]"
                      >
                        {player?.score ?? 0}
                      </YeonText>
                    </YeonView>
                  ))}
              </YeonView>
            </YeonView>
          ))}

          <YeonView className="grid min-h-0 grid-cols-2 items-start gap-6 self-center">
            {teamRows.map(({ team, score, capturedCellCount }) => {
              const isWinner = winner === team;

              return (
                <YeonView
                  as="article"
                  key={team}
                  className={`rounded-[22px] border bg-white p-2 shadow-xl ${
                    isWinner ? "scale-[1.02]" : "opacity-90"
                  } ${getTeamResultClass(team)}`}
                >
                  <YeonView className="rounded-[18px] bg-white p-4">
                    <YeonText
                      as="h2"
                      variant="unstyled"
                      tone="inherit"
                      className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-center text-[30px] font-black tracking-[-0.08em] text-[#111]"
                    >
                      {getTeamDisplayLabel(team, labels)}
                    </YeonText>
                    <YeonView className="mt-4 grid gap-4">
                      <ResultScoreRow
                        label={labels.result.boardScore}
                        value={`${score}P`}
                      />
                      <ResultScoreRow
                        label={labels.result.bonusGame}
                        value={`${capturedCellCount * 100}P`}
                      />
                      <ResultScoreRow
                        label={labels.result.teamScore}
                        value={`${score}P`}
                      />
                      {team === currentPlayer?.team && (
                        <>
                          <ResultScoreRow
                            label={labels.result.myRank}
                            value={
                              currentRank
                                ? labels.result.rank(currentRank)
                                : "-"
                            }
                          />
                          <ResultScoreRow
                            label={labels.result.earnedPoints}
                            value={`${currentPlayer.capturedCellCount}`}
                          />
                        </>
                      )}
                    </YeonView>
                  </YeonView>
                </YeonView>
              );
            })}
          </YeonView>
        </YeonView>

        <YeonView
          as="footer"
          className="relative grid grid-cols-[220px_minmax(0,1fr)_220px] items-center gap-5 border-t border-[#e5e5e5] bg-[#fafafa] px-6"
        >
          <YeonButton
            as="a"
            href="/typing-service/rooms"
            variant="secondary"
            size="xl"
            className="rounded-[24px] text-[22px] font-black"
          >
            {labels.result.leaveRoom}
          </YeonButton>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-center text-[28px] font-black tracking-[-0.06em] text-[#111]"
          >
            {labels.result.countdown(remainingSeconds)}
          </YeonText>
          <YeonButton
            as="a"
            href={returnPath}
            variant="primary"
            size="xl"
            className="rounded-[24px] text-[22px] font-black"
          >
            {labels.result.waitingRoom}
          </YeonButton>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

function ResultScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <YeonView className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl bg-[#111] px-4 py-2 text-white shadow-inner">
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="text-[18px] font-black tracking-[-0.04em]"
      >
        {label}
      </YeonText>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="text-[20px] font-black tracking-[-0.04em]"
      >
        {value}
      </YeonText>
    </YeonView>
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
  if (owner === TERRITORY_BATTLE_TEAM.RED) {
    return "border-[#111] bg-[#fafafa] text-[#111]";
  }
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) {
    return "border-[#e5e5e5] bg-white text-[#111]";
  }
  return "border-[#e5e5e5] bg-[#fafafa] text-[#666]";
}

function getCellOwnerLabel(
  owner: TerritoryCellSnapshot["owner"],
  labels: TerritoryBattleText
) {
  if (owner === TERRITORY_BATTLE_TEAM.RED) {
    return labels.team.red.shortLabel;
  }
  if (owner === TERRITORY_BATTLE_TEAM.BLUE) {
    return labels.team.blue.shortLabel;
  }
  return labels.team.neutralLabel;
}

function TerritoryCardBoard({
  board,
  myTeam,
  targetWord,
  redScore,
  blueScore,
  onPickWord,
  labels,
}: {
  board: readonly TerritoryCellSnapshot[];
  myTeam: TerritoryBattleTeam;
  targetWord: string;
  redScore: number;
  blueScore: number;
  onPickWord: (word: string) => void;
  labels: TerritoryBattleText;
}) {
  const opponentTeam = getOpponentTeam(myTeam);

  return (
    <YeonSurface
      variant="outlined"
      className={`flex h-full min-h-0 flex-col rounded-[28px] p-4 ${YEON_WEB_SHADOW_CLASS.territoryBoard}`}
    >
      <YeonView className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[#e5e5e5] pb-3">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-left text-[14px] font-black text-[#111]"
        >
          RED {redScore}P
        </YeonText>
        <YeonView className="text-center">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[26px] font-black leading-none tracking-[-0.06em] text-[#111]"
          >
            {targetWord ? "READY" : "WAIT"}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-[11px] font-bold text-[#666]"
          >
            {labels.board.instruction}
          </YeonText>
        </YeonView>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-right text-[14px] font-black text-[#111]"
        >
          BLUE {blueScore}P
        </YeonText>
      </YeonView>

      <YeonView className="flex min-h-0 flex-1 items-center justify-center py-4">
        <YeonView className="grid h-full max-h-[620px] w-full max-w-[720px] grid-cols-5 gap-2">
          {board.map((cell) => {
            const isOpponentCard = cell.owner === opponentTeam;
            const isMyCard = cell.owner === myTeam;
            const isTarget = cell.word === targetWord;

            return (
              <YeonButton
                key={cell.id}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onPickWord(cell.word)}
                className={`group relative min-h-20 rounded-[10px] border-2 px-2 py-3 text-center shadow-inner transition hover:-translate-y-0.5 ${getCellClass(
                  cell.owner
                )} ${isTarget ? "ring-4 ring-[#111]" : ""} ${
                  isOpponentCard ? "cursor-pointer" : ""
                } ${isMyCard ? "opacity-90" : ""}`}
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="absolute left-2 top-2 rounded-full border border-[#e5e5e5] bg-white px-2 py-0.5 text-[10px] font-black text-[#666]"
                >
                  {getCellOwnerLabel(cell.owner, labels)}
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="flex h-full items-center justify-center pt-3 text-[18px] font-black tracking-[-0.05em]"
                >
                  {cell.word}
                </YeonText>
                {isOpponentCard && (
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="absolute inset-x-2 bottom-2 rounded-full border border-[#e5e5e5] bg-white py-0.5 text-[10px] font-black text-[#111] opacity-0 transition group-hover:opacity-100"
                  >
                    {labels.board.targetHover}
                  </YeonText>
                )}
              </YeonButton>
            );
          })}
        </YeonView>
      </YeonView>

      <YeonView className="grid grid-cols-3 gap-2 border-t border-[#e5e5e5] pt-3 text-center text-[12px] font-black">
        <YeonView className="rounded-xl border border-[#111] bg-[#fafafa] px-3 py-2 text-[#111]">
          {labels.team.red.cardLabel}
        </YeonView>
        <YeonView className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[#666]">
          {labels.team.neutralCardLabel}
        </YeonView>
        <YeonView className="rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[#111]">
          {labels.team.blue.cardLabel}
        </YeonView>
      </YeonView>
    </YeonSurface>
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
  labels,
}: TeamPanelProps) {
  const view = labels.team[team];
  const teamPlayers = players.filter((player) => player.team === team);

  return (
    <YeonSurface
      as="aside"
      variant="outlined"
      className="flex min-h-0 flex-col rounded-[28px] p-4"
    >
      <YeonView className="rounded-[22px] border border-[#e5e5e5] bg-[#fafafa] p-4">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[11px] font-black uppercase tracking-[0.28em] text-[#666]"
        >
          {view.label}
        </YeonText>
        <YeonView className="mt-3 flex items-end justify-between gap-3">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[42px] font-black leading-none tracking-[-0.08em] text-[#111]"
          >
            {score}P
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-black text-[#666]"
          >
            {labels.team.tiles(capturedCellCount)}
          </YeonText>
        </YeonView>
      </YeonView>

      <YeonView className="mt-4 grid gap-3">
        <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-3">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666]"
          >
            {labels.team.players}
          </YeonText>
          <YeonView className="mt-3 grid gap-2">
            {(teamPlayers.length ? teamPlayers : [null]).map(
              (player, index) => (
                <YeonView
                  key={player?.id ?? `${team}-empty-${index}`}
                  className="flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2"
                >
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="truncate text-[13px] font-bold text-[#111]"
                  >
                    {player?.nickname ?? labels.team.waitingPlayer}
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className={`ml-2 h-2.5 w-2.5 rounded-full ${
                      player?.isConnected ? "bg-[#111]" : "bg-[#aaa]"
                    }`}
                  />
                </YeonView>
              )
            )}
          </YeonView>
        </YeonView>

        <YeonView className="grid grid-cols-2 gap-2">
          <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-3">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666]"
            >
              Accuracy
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[20px] font-black text-[#111]"
            >
              {Math.round(
                teamPlayers.reduce((sum, player) => sum + player.accuracy, 0) /
                  Math.max(teamPlayers.length, 1)
              )}
              %
            </YeonText>
          </YeonView>
          <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-3">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666]"
            >
              Combo
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[20px] font-black text-[#111]"
            >
              {teamPlayers.reduce(
                (max, player) => Math.max(max, player.combo),
                0
              )}
            </YeonText>
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonSurface>
  );
}

export function TypingTerritoryBattleScreen({
  originRoomId,
}: TypingTerritoryBattleScreenProps) {
  const labels = useTerritoryBattleText();

  if (!originRoomId) {
    return <TerritoryGateScreen labels={labels} />;
  }

  return <TypingTerritoryBattleGameScreen originRoomId={originRoomId} />;
}

function TypingTerritoryBattleGameScreen({
  originRoomId,
}: {
  originRoomId: string;
}) {
  const labels = useTerritoryBattleText();
  const router = useYeonRouter();
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
  const [message, setMessage] = useState(labels.game.initialMessage);
  const [now, setNow] = useState(() => getYeonNow());
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
  const territoryStatusMessage = territoryRoom.roomError
    ? labels.game.connectionError
    : message;

  useEffect(() => {
    const intervalId = scheduleYeonInterval(() => setNow(getYeonNow()), 250);
    return () => clearYeonInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!shouldShowResult) {
      setResultReturnSeconds(RESULT_RETURN_SECONDS);
      return;
    }

    const intervalId = scheduleYeonInterval(() => {
      setResultReturnSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearYeonInterval(intervalId);
  }, [shouldShowResult]);

  useEffect(() => {
    if (!shouldShowResult || resultReturnSeconds > 0) return;
    router.push(returnPath);
  }, [resultReturnSeconds, returnPath, router, shouldShowResult]);

  function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();

    if (isServerConnected && territoryRoom.snapshot) {
      if (territoryRoom.snapshot.phase !== TERRITORY_BATTLE_PHASE.PLAYING) {
        setMessage(labels.game.serverNotPlaying);
        return;
      }

      territoryRoom.sendSubmitWord({ word: inputValue || targetWord });
      setInputValue("");
      setMessage(labels.game.submitted);
      return;
    }

    const targetCell = findTerritoryCellByWord({
      board,
      word: inputValue || targetWord,
    });

    if (!targetCell) {
      setCombo(0);
      setMessage(labels.game.wordNotFound);
      return;
    }

    if (targetCell.owner === myTeam) {
      setCombo(0);
      setMessage(labels.game.ownCell);
      return;
    }

    const nextCombo = combo + 1;
    const { board: nextBoard, result } = captureTerritoryCell({
      board,
      cellId: targetCell.id,
      team: myTeam,
      playerId: LOCAL_PLAYER_ID,
      combo: nextCombo,
      capturedAt: getYeonNow(),
    });

    setBoard(nextBoard);
    setTeamScore((score) =>
      myTeam === TERRITORY_BATTLE_TEAM.RED
        ? { ...score, red: score.red + result.scoreDelta }
        : { ...score, blue: score.blue + result.scoreDelta }
    );
    setCombo(nextCombo);
    setInputValue("");
    const suffix = [
      result.isSteal ? labels.game.steal : "",
      result.completesLine ? labels.game.lineComplete : "",
    ]
      .filter(Boolean)
      .map((item) => ` · ${item}`)
      .join("");
    setMessage(
      labels.game.flipSuccess(targetCell.word, result.scoreDelta, suffix)
    );
  }

  return (
    <YeonView className="relative h-screen w-screen overflow-hidden bg-white text-[#111]">
      <YeonView
        as="main"
        className="grid h-full w-full grid-rows-[104px_minmax(0,1fr)_132px] gap-4 p-4"
      >
        <YeonView
          as="header"
          className="grid grid-cols-[minmax(210px,1fr)_minmax(260px,420px)_minmax(210px,1fr)] items-center gap-4"
        >
          <YeonSurface variant="panel" className="rounded-[26px] px-5 py-4">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-black uppercase tracking-[0.28em] text-[#666]"
            >
              {labels.team.red.scoreLabel}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[38px] font-black leading-none tracking-[-0.07em] text-[#111]"
            >
              {redScore}P
            </YeonText>
          </YeonSurface>

          <YeonSurface
            variant="outlined"
            className={`relative overflow-hidden rounded-[32px] px-6 py-4 text-center ${YEON_WEB_SHADOW_CLASS.cardWide}`}
          >
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-black uppercase tracking-[0.32em] text-[#666]"
            >
              {labels.game.cardFlipBattle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[42px] font-black leading-none tracking-[-0.08em] text-[#111]"
            >
              {timerLabel}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[12px] font-bold text-[#666]"
            >
              {getTerritoryPhaseDisplayLabel(
                territoryRoom.snapshot?.phase ?? null,
                labels
              )}{" "}
              · {labels.game.connection(territoryRoom.connectionState)}
            </YeonText>
          </YeonSurface>

          <YeonSurface
            variant="panel"
            className="rounded-[26px] px-5 py-4 text-right"
          >
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-black uppercase tracking-[0.28em] text-[#666]"
            >
              {labels.team.blue.scoreLabel}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[38px] font-black leading-none tracking-[-0.07em] text-[#111]"
            >
              {blueScore}P
            </YeonText>
          </YeonSurface>
        </YeonView>

        <YeonView
          as="section"
          className="grid min-h-0 grid-cols-[240px_minmax(0,1fr)_240px] gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]"
        >
          <TeamPanel
            team={TERRITORY_BATTLE_TEAM.RED}
            score={redScore}
            capturedCellCount={redCapturedCells}
            players={hudPlayers}
            labels={labels}
          />

          <YeonSurface
            variant="outlined"
            className={`min-h-0 overflow-hidden rounded-[34px] p-3 ${YEON_WEB_SHADOW_CLASS.territoryBoard}`}
          >
            <YeonView className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#e5e5e5] bg-white">
              <YeonView className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-3">
                <YeonView>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[11px] font-black uppercase tracking-[0.3em] text-[#666]"
                  >
                    {labels.game.title}
                  </YeonText>
                  <YeonText
                    as="h1"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 text-[24px] font-black tracking-[-0.05em] text-[#111]"
                  >
                    {labels.game.subtitle}
                  </YeonText>
                </YeonView>
                <YeonView className="flex items-center gap-2 text-[12px] font-bold text-[#666]">
                  <YeonBadge variant="neutral">
                    {winner === "draw"
                      ? labels.game.draw
                      : labels.game.leading(winner)}
                  </YeonBadge>
                  <YeonBadge variant="accent">
                    {labels.game.teamTarget(
                      getTeamDisplayLabel(myTeam, labels),
                      getTeamDisplayLabel(opponentTeam, labels)
                    )}
                  </YeonBadge>
                  <YeonBadge variant="success">
                    {isServerConnected ? "LIVE" : "LOCAL"}
                  </YeonBadge>
                </YeonView>
              </YeonView>

              <YeonView className="min-h-0 flex-1 p-3">
                <TerritoryCardBoard
                  board={displayBoard}
                  myTeam={myTeam}
                  targetWord={targetWord}
                  redScore={redScore}
                  blueScore={blueScore}
                  onPickWord={setInputValue}
                  labels={labels}
                />
              </YeonView>

              <YeonView className="flex items-center justify-between gap-3 border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-3">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[11px] font-black uppercase tracking-[0.24em] text-[#666]"
                >
                  {labels.game.targetBoard}
                </YeonText>
                <YeonView className="flex min-w-0 flex-1 justify-end gap-2 overflow-hidden">
                  {displayBoard
                    .filter((cell) => cell.owner === opponentTeam)
                    .concat(
                      displayBoard.filter((cell) => cell.owner === "neutral")
                    )
                    .slice(0, 5)
                    .map((cell) => (
                      <YeonButton
                        key={cell.id}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className={`min-w-0 rounded-full border px-3 py-1.5 text-center text-[11px] font-black transition hover:scale-[1.02] ${getCellClass(
                          cell.owner
                        )}`}
                        onClick={() => setInputValue(cell.word)}
                      >
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className="block max-w-20 truncate"
                        >
                          {cell.word}
                        </YeonText>
                      </YeonButton>
                    ))}
                </YeonView>
              </YeonView>
            </YeonView>
          </YeonSurface>

          <TeamPanel
            team={TERRITORY_BATTLE_TEAM.BLUE}
            score={blueScore}
            capturedCellCount={blueCapturedCells}
            players={hudPlayers}
            labels={labels}
          />
        </YeonView>

        <YeonView
          as="footer"
          className="grid grid-cols-[220px_minmax(0,1fr)_220px] items-stretch gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]"
        >
          <YeonSurface variant="panel" className="rounded-[26px] p-4">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-black uppercase tracking-[0.25em] text-[#666]"
            >
              {labels.game.capturedMine}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[34px] font-black leading-none tracking-[-0.06em] text-[#111]"
            >
              {combo} combo
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[12px] font-bold text-[#666]"
            >
              {labels.game.capturedSummary(myCapturedCells)}
            </YeonText>
          </YeonSurface>

          <YeonForm
            className={`grid grid-cols-[160px_minmax(0,1fr)_148px] items-center gap-3 rounded-[30px] border border-[#e5e5e5] bg-white p-4 ${YEON_WEB_SHADOW_CLASS.cardWide}`}
            onSubmit={handleSubmit}
          >
            <YeonView className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="text-[10px] font-black uppercase tracking-[0.24em] text-[#666]"
              >
                {labels.game.wordToFlip}
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-1 truncate text-[22px] font-black tracking-[-0.04em] text-[#111]"
              >
                {targetWord || labels.game.waiting}
              </YeonText>
            </YeonView>
            <YeonField
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="h-16 rounded-2xl px-5 text-[22px] font-black tracking-[-0.04em]"
              placeholder={labels.game.placeholder}
              autoComplete="off"
            />
            <YeonButton
              type="submit"
              variant="primary"
              className="h-16 rounded-2xl px-4 text-[16px] font-black tracking-[-0.03em]"
            >
              {labels.game.submit}
            </YeonButton>
          </YeonForm>

          <YeonSurface variant="panel" className="rounded-[26px] p-4">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[11px] font-black uppercase tracking-[0.25em] text-[#666]"
            >
              {labels.game.controls}
            </YeonText>
            <YeonView className="mt-3 grid grid-cols-2 gap-2">
              <YeonButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  territoryRoom.sendStart();
                  setMessage(labels.game.startRequested);
                }}
                disabled={!isServerConnected}
                className="rounded-xl px-3 py-2 text-[12px] font-black"
              >
                {labels.game.start}
              </YeonButton>
              <YeonButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => territoryRoom.rejoin()}
                className="rounded-xl px-3 py-2 text-[12px] font-black"
              >
                {labels.game.reconnect}
              </YeonButton>
            </YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-[#666]"
            >
              {territoryStatusMessage}
            </YeonText>
          </YeonSurface>
        </YeonView>
      </YeonView>
      {shouldShowResult && (
        <TerritoryResultBoard
          snapshot={engineSnapshot}
          winner={resultWinner}
          redScore={redScore}
          blueScore={blueScore}
          returnPath={returnPath}
          remainingSeconds={resultReturnSeconds}
          labels={labels}
        />
      )}
    </YeonView>
  );
}
