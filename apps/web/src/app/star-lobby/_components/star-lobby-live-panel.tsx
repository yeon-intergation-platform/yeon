"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Client, type Room } from "@colyseus/sdk";
import {
  STAR_LOBBY_EVENTS,
  STAR_LOBBY_ROOM_NAME,
  type StarLobbyAlertMatchedEvent,
  type StarLobbyRealtimeEvent,
  type StarLobbyRoomDto,
} from "@yeon/race-shared";

import { resolveRaceServerUrl } from "@/features/typing-service/use-race-room";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

type LiveAlert = StarLobbyAlertMatchedEvent & { receivedAt: Date };
type LiveRoom = StarLobbyRoomDto & { receivedAt: Date };

type KeywordRule = {
  includeKeywords: string[];
  excludeKeywords: string[];
};

const DEFAULT_RULE: KeywordRule = {
  includeKeywords: ["랜타디", "랜덤타워디펜스", "RTD"],
  excludeKeywords: ["고수", "빡겜", "노초보"],
};

const MAX_VISIBLE_ITEMS = 6;
const GUEST_SESSION_STORAGE_KEY = "yeon.star-lobby.guest-session-id";

function keywordText(keywords: string[]) {
  return keywords.join(", ");
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .filter((keyword, index, keywords) => keywords.indexOf(keyword) === index)
    .slice(0, 20);
}

function playersText(
  room: Pick<StarLobbyRoomDto, "currentPlayers" | "maxPlayers">
) {
  if (room.currentPlayers === null && room.maxPlayers === null)
    return "인원 미확인";
  if (room.currentPlayers === null) return `?/${room.maxPlayers}`;
  if (room.maxPlayers === null) return `${room.currentPlayers}/?`;
  return `${room.currentPlayers}/${room.maxPlayers}`;
}

function eventRoom(event: StarLobbyRealtimeEvent) {
  return event.room;
}

function ensureGuestSessionId() {
  if (typeof window === "undefined") return null;
  const current = window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  if (current) return current;
  const next = globalThis.crypto?.randomUUID?.() ?? `guest-${Date.now()}`;
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, next);
  return next;
}

export function StarLobbyLivePanel() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [includeText, setIncludeText] = useState(
    keywordText(DEFAULT_RULE.includeKeywords)
  );
  const [excludeText, setExcludeText] = useState(
    keywordText(DEFAULT_RULE.excludeKeywords)
  );
  const [rule, setRule] = useState<KeywordRule>(DEFAULT_RULE);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const roomRef = useRef<Room | null>(null);

  const canSubscribe = parseKeywords(includeText).length > 0;
  const statusLabel = useMemo(() => {
    if (connectionState === "connected") return "실시간 연결됨";
    if (connectionState === "connecting") return "연결 중";
    if (connectionState === "disconnected") return "연결 끊김";
    return "연결 오류";
  }, [connectionState]);

  const sendSubscription = useCallback((nextRule: KeywordRule) => {
    roomRef.current?.send(STAR_LOBBY_EVENTS.SUBSCRIBE, nextRule);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const client = new Client(resolveRaceServerUrl());
    const guestSessionId = ensureGuestSessionId();

    setConnectionState("connecting");
    setError(null);

    client
      .joinOrCreate(STAR_LOBBY_ROOM_NAME, {
        guestSessionId,
        ...rule,
      })
      .then((room) => {
        if (cancelled) {
          void room.leave();
          return;
        }
        roomRef.current = room;
        setConnectionState("connected");

        room.onMessage(
          STAR_LOBBY_EVENTS.ROOM_OBSERVED,
          (event: StarLobbyRealtimeEvent) => {
            const room = eventRoom(event);
            setRooms((current) =>
              [
                { ...room, receivedAt: new Date() },
                ...current.filter((item) => item.id !== room.id),
              ].slice(0, MAX_VISIBLE_ITEMS)
            );
          }
        );
        room.onMessage(
          STAR_LOBBY_EVENTS.ALERT_MATCHED,
          (event: StarLobbyAlertMatchedEvent) => {
            setAlerts((current) =>
              [{ ...event, receivedAt: new Date() }, ...current].slice(
                0,
                MAX_VISIBLE_ITEMS
              )
            );
          }
        );
        room.onMessage(
          STAR_LOBBY_EVENTS.ERROR,
          (message: { message?: string }) => {
            setError(
              message.message ?? "스타 로비 실시간 알림 오류가 발생했습니다."
            );
          }
        );
        room.onLeave(() => {
          if (!cancelled) setConnectionState("disconnected");
        });
        room.onError((_code, message) => {
          if (!cancelled) {
            setConnectionState("error");
            setError(message || "스타 로비 실시간 서버에 연결하지 못했습니다.");
          }
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setConnectionState("error");
          setError(
            err instanceof Error
              ? err.message
              : "스타 로비 실시간 서버에 연결하지 못했습니다."
          );
        }
      });

    return () => {
      cancelled = true;
      void roomRef.current?.leave();
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (connectionState === "connected") sendSubscription(rule);
  }, [connectionState, rule, sendSubscription]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRule = {
      includeKeywords: parseKeywords(includeText),
      excludeKeywords: parseKeywords(excludeText),
    };
    setRule(nextRule);
    sendSubscription(nextRule);
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">접속 중 실시간 알림</p>
          <h2 className="mt-2 text-2xl font-black">키워드 뜨면 바로 표시</h2>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-slate-200">
          {statusLabel}
        </span>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-slate-300">포함 키워드</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
            onChange={(event) => setIncludeText(event.target.value)}
            placeholder="랜타디, 랜덤타워디펜스, RTD"
            value={includeText}
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-300">제외 키워드</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-rose-300"
            onChange={(event) => setExcludeText(event.target.value)}
            placeholder="고수, 빡겜, 노초보"
            value={excludeText}
          />
        </label>
        <button
          className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          disabled={!canSubscribe}
          type="submit"
        >
          이 키워드로 접속 중 알림 받기
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl bg-slate-950/70 p-4">
          <h3 className="font-black text-white">알림</h3>
          <div className="mt-3 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm leading-6 text-slate-400">
                조건에 맞는 방이 관측되면 여기에 바로 표시됩니다.
              </p>
            ) : (
              alerts.map((alert) => (
                <article
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3"
                  key={`${alert.match.id}-${alert.receivedAt.toISOString()}`}
                >
                  <p className="text-xs font-bold text-cyan-100">방 떴다</p>
                  <h4 className="mt-1 font-black text-white">
                    {alert.room.title}
                  </h4>
                  <p className="mt-1 text-sm text-cyan-50/80">
                    {playersText(alert.room)} ·{" "}
                    {alert.match.matchedKeyword ?? "키워드 매칭"}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-950/70 p-4">
          <h3 className="font-black text-white">실시간 관측 피드</h3>
          <div className="mt-3 space-y-3">
            {rooms.length === 0 ? (
              <p className="text-sm leading-6 text-slate-400">
                관측 이벤트가 들어오면 최근 방이 표시됩니다.
              </p>
            ) : (
              rooms.map((room) => (
                <article
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-3"
                  key={`${room.id}-${room.receivedAt.toISOString()}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">{room.title}</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {room.receivedAt.toLocaleTimeString("ko-KR")}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-950">
                      {playersText(room)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
