"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, Crown, Play, Users } from "lucide-react";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomCreateMessage,
  type TypingRoomDifficulty,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import { TypingBgmButton } from "./typing-bgm-button";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
import { TypingSettingsButton } from "./typing-settings-button";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_MODE_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
  TYPING_ROOM_VISIBILITY_LABELS,
} from "./typing-room-labels";
import { useTypingSettings } from "./use-typing-settings";

type TypingRoomScreenProps = {
  roomId?: string;
  mode: "create" | "join";
};

function parseEnum<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function parseNumber(value: string | null, allowed: readonly number[], fallback: number) {
  const parsed = Number(value);
  return allowed.includes(parsed) ? parsed : fallback;
}

function useCreateRoomOptions(): TypingRoomCreateMessage {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const language = parseEnum<TypingRoomLanguage>(
      searchParams.get("language"),
      [TYPING_ROOM_LANGUAGE.KO, TYPING_ROOM_LANGUAGE.EN],
      TYPING_ROOM_LANGUAGE.KO,
    );
    return {
      title: (searchParams.get("title") || "한글 짧은 문장 같이 치기").slice(0, 40),
      visibility: parseEnum<TypingRoomVisibility>(
        searchParams.get("visibility"),
        [TYPING_ROOM_VISIBILITY.PUBLIC],
        TYPING_ROOM_VISIBILITY.PUBLIC,
      ),
      maxParticipants: parseNumber(searchParams.get("maxParticipants"), [2, 4], 4),
      textType: parseEnum<TypingRoomTextType>(
        searchParams.get("textType"),
        [TYPING_ROOM_TEXT_TYPE.SHORT],
        TYPING_ROOM_TEXT_TYPE.SHORT,
      ),
      language,
      difficulty: parseEnum<TypingRoomDifficulty>(
        searchParams.get("difficulty"),
        [TYPING_ROOM_DIFFICULTY.EASY, TYPING_ROOM_DIFFICULTY.NORMAL, TYPING_ROOM_DIFFICULTY.HARD],
        TYPING_ROOM_DIFFICULTY.NORMAL,
      ),
      roundCount: parseNumber(searchParams.get("roundCount"), [1], 1),
      mode: parseEnum<TypingRoomMode>(
        searchParams.get("mode"),
        [TYPING_ROOM_MODE.FINISH],
        TYPING_ROOM_MODE.FINISH,
      ),
    };
  }, [searchParams]);
}

export function TypingRoomScreen({ roomId, mode }: TypingRoomScreenProps) {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const playerId = usePlayerIdentity();
  const createRoomOptions = useCreateRoomOptions();
  const [copied, setCopied] = useState(false);

  const race = useRaceRoom({
    enabled: profileLoaded && !!playerId,
    playerLabel: profile.nickname,
    playerId,
    locale: settings.locale,
    roomId: mode === "join" ? roomId : null,
    createRoom: mode === "create" ? createRoomOptions : null,
  });

  const room = race.roomSnapshot;
  const me = room?.participants.find((participant) => participant.id === race.mySeat) ?? null;
  const isHost = me?.role === "host";
  const isReady = Boolean(me?.isReady);
  const inviteUrl = typeof window === "undefined" || !race.roomId
    ? ""
    : `${window.location.origin}/typing-service/rooms/${race.roomId}`;

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (race.connectionState === "connecting" || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#111]">
        <div className="flex flex-col items-center gap-3 font-mono text-[13px] text-[#888]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
          <span>{mode === "create" ? "타자방을 만드는 중..." : "타자방에 입장하는 중..."}</span>
        </div>
      </div>
    );
  }

  if (race.connectionState === "error" || race.connectionState === "disconnected") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 text-[#111]">
        <div className="max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-8 text-center shadow-sm">
          <h1 className="text-[24px] font-black tracking-[-0.03em]">타자방에 연결할 수 없어요</h1>
          <p className="mt-3 text-[14px] leading-6 text-[#666]">방이 이미 시작됐거나 서버 연결이 끊겼을 수 있어요. 로비에서 대기중인 방을 다시 확인해 주세요.</p>
          <Link href="/typing-service/rooms" className="mt-6 inline-flex rounded-2xl bg-[#111] px-5 py-3 text-[14px] font-bold text-white no-underline">로비로 돌아가기</Link>
        </div>
      </div>
    );
  }

  if (room.status !== TYPING_ROOM_STATUS.WAITING) {
    return <TypingRaceMultiplayerScreen race={race} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111]">
      <header className="border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link href="/typing-service/rooms" className="inline-flex items-center gap-2 text-[13px] text-[#888] no-underline hover:text-[#111]">
            <ArrowLeft size={14} /> 타자방 로비
          </Link>
          <div className="flex items-center gap-2">
            <TypingBgmButton />
            <TypingSettingsButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1200px] gap-6 px-4 py-6 md:grid-cols-[1fr_360px] md:px-8">
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#111] px-2.5 py-1 text-[11px] font-bold text-white">대기중</span>
                <span className="font-mono text-[12px] text-[#aaa]">#{room.roomCode}</span>
                <span className="rounded-full bg-[#f4f4f0] px-2.5 py-1 text-[11px] font-bold text-[#555]">{TYPING_ROOM_VISIBILITY_LABELS[room.visibility]}</span>
              </div>
              <h1 className="mt-3 text-[30px] font-black tracking-[-0.04em] md:text-[42px]">{room.title}</h1>
              <p className="mt-3 text-[14px] font-medium text-[#666]">
                {TYPING_ROOM_LANGUAGE_LABELS[room.language]} · {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]} · {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]} · {room.roundCount}판 · {TYPING_ROOM_MODE_LABELS[room.mode]}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f4f0] px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#888]">Players</p>
              <p className="mt-1 text-[24px] font-black">{room.currentParticipants} / {room.maxParticipants}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <h2 className="text-[16px] font-black">참여자</h2>
            {room.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded-2xl border border-[#ececec] bg-[#fafafa] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[15px] font-black shadow-sm">
                    {participant.role === "host" ? <Crown size={18} className="text-[#ff9f1c]" /> : participant.label.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold">{participant.label}</p>
                    <p className="text-[12px] text-[#888]">{participant.role === "host" ? "방장" : "참가자"}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${participant.isReady ? "bg-[#e9f8df] text-[#3f7f1d]" : "bg-[#f1f1f1] text-[#888]"}`}>
                  {participant.isReady ? "준비완료" : "대기중"}
                </span>
              </div>
            ))}
          </div>

          {race.roomError && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">{race.roomError}</div>
          )}
        </section>

        <aside className="grid content-start gap-4 rounded-3xl border border-[#e5e5e5] bg-white p-5 shadow-sm md:p-6">
          <div className="rounded-2xl bg-[#111] p-5 text-white">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">Countdown</p>
            <p className="mt-2 text-[34px] font-black tracking-[-0.05em]">3, 2, 1</p>
            <p className="mt-2 text-[13px] leading-5 text-white/70">방장이 시작하면 모두에게 같은 제시문과 카운트다운이 동시에 뜹니다.</p>
          </div>

          {!isHost && (
            <button
              type="button"
              onClick={() => race.sendReady(!isReady)}
              className={`rounded-2xl px-4 py-4 text-[15px] font-bold transition-colors ${isReady ? "border border-[#e5e5e5] bg-white text-[#555] hover:border-[#111]" : "bg-[#ff6b35] text-white hover:bg-[#111]"}`}
            >
              {isReady ? "준비 취소" : "준비하기"}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              onClick={race.sendStart}
              disabled={!room.canStart}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff6b35] px-4 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#111] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#888]"
            >
              <Play size={16} /> 시작하기
            </button>
          )}

          <button
            type="button"
            onClick={copyInvite}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e5e5e5] px-4 py-3 text-[13px] font-bold text-[#555] transition-colors hover:border-[#111] hover:text-[#111]"
          >
            <Copy size={14} /> {copied ? "초대 링크 복사됨" : "초대 링크 복사"}
          </button>

          <div className="rounded-2xl border border-dashed border-[#ddd] p-4 text-[13px] leading-6 text-[#777]">
            <p className="flex items-center gap-2 font-bold text-[#111]"><Users size={14} /> MVP 규칙</p>
            <ul className="mt-2 list-disc pl-4">
              <li>방장은 자동 준비 완료입니다.</li>
              <li>참가자가 모두 준비하면 시작할 수 있습니다.</li>
              <li>진행 중인 방은 새 참가자가 들어올 수 없습니다.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
