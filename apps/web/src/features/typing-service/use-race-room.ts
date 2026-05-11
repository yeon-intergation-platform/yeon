"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type Room } from "@colyseus/sdk";
import {
  RACE_EVENTS,
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_ROOM_NAME,
  TYPING_RACE_STAGE,
  type RaceFinishMessage,
  type RaceProgressMessage,
  type RaceResultMessage,
  type RaceSeedMessage,
  type RoomSettingsUpdateMessage,
  type RoomStartMessage,
  type RoomChatMessage,
  type RoomErrorMessage,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingResultSnapshot,
  type TypingRoomCreateMessage,
  type TypingRoomSnapshot,
} from "@yeon/race-shared";

export type RaceConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export type UseRaceRoomOptions = {
  enabled: boolean;
  playerLabel: string;
  playerId: string | null;
  characterId?: string;
  locale: "ko" | "en";
  roomId?: string | null;
  createRoom?: TypingRoomCreateMessage | null;
  quickRoom?: TypingRoomCreateMessage | null;
};

export type UseRaceRoomResult = {
  connectionState: RaceConnectionState;
  snapshot: TypingRaceSnapshot | null;
  roomSnapshot: TypingRoomSnapshot | null;
  results: readonly TypingResultSnapshot[];
  prompt: string | null;
  countdownRemaining: number;
  stage: TypingRaceStage;
  mySeat: string | null;
  roomId: string | null;
  roomError: string | null;
  sendProgress: (payload: RaceProgressMessage) => void;
  sendFinish: (payload: RaceFinishMessage) => void;
  sendReady: (isReady: boolean) => void;
  sendStart: (payload?: RoomStartMessage) => void;
  sendChat: (content: string) => void;
  sendRoomSettings: (payload: RoomSettingsUpdateMessage) => void;
  rejoin: () => void;
};

const DEFAULT_SERVER_URL = "ws://localhost:2567";

const ROOM_ERROR_MESSAGES = {
  started: "이미 시작된 방입니다.",
  full: "방이 가득 찼습니다.",
  notFound: "존재하지 않는 방입니다.",
  network: "서버와의 연결이 끊어졌습니다.",
  unknown: "타자방에 연결할 수 없습니다.",
} as const;

type LegacySeatReservation = {
  name?: string;
  roomId?: string;
  processId?: string;
  publicAddress?: string;
  room?: {
    name?: string;
    roomId?: string;
    processId?: string;
    publicAddress?: string;
  };
};

type ColyseusClientPrototypeWithCompat = {
  __yeonSeatReservationCompat?: boolean;
  consumeSeatReservation?: (
    response: LegacySeatReservation,
    ...args: unknown[]
  ) => unknown;
};

function ensureSeatReservationCompat() {
  const prototype =
    Client.prototype as unknown as ColyseusClientPrototypeWithCompat;
  if (
    prototype.__yeonSeatReservationCompat ||
    !prototype.consumeSeatReservation
  )
    return;

  const original = prototype.consumeSeatReservation;
  prototype.consumeSeatReservation = function consumeSeatReservationCompat(
    response: LegacySeatReservation,
    ...args: unknown[]
  ) {
    if (!response.room && response.name && response.roomId) {
      response.room = {
        name: response.name,
        roomId: response.roomId,
        processId: response.processId,
        publicAddress: response.publicAddress,
      };
    }
    return original.call(this, response, ...args);
  };
  prototype.__yeonSeatReservationCompat = true;
}

function normalizeRoomErrorMessage(source: unknown): string {
  if (typeof source === "string" && source.trim().length > 0) {
    const lower = source.toLowerCase();

    if (
      lower.includes("full") ||
      lower.includes("max") ||
      lower.includes("capacity") ||
      lower.includes("인원") ||
      lower.includes("가득")
    ) {
      return ROOM_ERROR_MESSAGES.full;
    }

    if (
      lower.includes("not found") ||
      lower.includes("does not exist") ||
      lower.includes("not exist") ||
      lower.includes("존재하지")
    ) {
      return ROOM_ERROR_MESSAGES.notFound;
    }

    if (
      lower.includes("already started") ||
      lower.includes("already in progress") ||
      lower.includes("in progress") ||
      lower.includes("이미 시작")
    ) {
      return ROOM_ERROR_MESSAGES.started;
    }

    return source;
  }

  if (source instanceof Error && source.message) {
    return normalizeRoomErrorMessage(source.message);
  }

  if (typeof source === "object" && source !== null) {
    const candidate =
      (source as { message?: unknown }).message ??
      (source as { reason?: unknown }).reason ??
      (source as { error?: unknown }).error;

    if (typeof candidate === "string") {
      return normalizeRoomErrorMessage(candidate);
    }
  }

  return ROOM_ERROR_MESSAGES.unknown;
}

function applyRoomErrorState(
  setConnectionState: (state: RaceConnectionState) => void,
  setRoomError: (message: string | null) => void,
  source: unknown
) {
  const normalized = normalizeRoomErrorMessage(source);
  const sourceText = typeof source === "string" ? source : "";

  const shouldUseNetworkMessage =
    normalized === ROOM_ERROR_MESSAGES.unknown &&
    (sourceText.startsWith("[") || sourceText.includes("room"));

  setRoomError(
    shouldUseNetworkMessage ? ROOM_ERROR_MESSAGES.network : normalized
  );
  setConnectionState("error");
}

export function resolveRaceServerUrl() {
  const envUrl = process.env.NEXT_PUBLIC_RACE_SERVER_URL;
  return envUrl && envUrl.length > 0 ? envUrl : DEFAULT_SERVER_URL;
}

export function useRaceRoom(options: UseRaceRoomOptions): UseRaceRoomResult {
  const {
    enabled,
    playerLabel,
    playerId,
    characterId,
    locale,
    roomId,
    createRoom,
    quickRoom,
  } = options;
  const [connectionState, setConnectionState] =
    useState<RaceConnectionState>("idle");
  const [snapshot, setSnapshot] = useState<TypingRaceSnapshot | null>(null);
  const [roomSnapshot, setRoomSnapshot] = useState<TypingRoomSnapshot | null>(
    null
  );
  const [prompt, setPrompt] = useState<string | null>(null);
  const [results, setResults] = useState<readonly TypingResultSnapshot[]>([]);
  const [mySeat, setMySeat] = useState<string | null>(null);
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [rejoinToken, setRejoinToken] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const createRoomKey = createRoom ? JSON.stringify(createRoom) : "";
  const quickRoomKey = quickRoom ? JSON.stringify(quickRoom) : "";

  // playerLabel은 접속 시점의 값만 사용 (변경 시 재연결 방지)
  const playerLabelRef = useRef(playerLabel);
  useEffect(() => {
    playerLabelRef.current = playerLabel;
  }, [playerLabel]);

  useEffect(() => {
    if (!enabled || !playerId) return;

    let cancelled = false;
    setConnectionState("connecting");
    setSnapshot(null);
    setRoomSnapshot(null);
    setPrompt(null);
    setResults([]);
    setMySeat(null);
    setConnectedRoomId(null);
    setRoomError(null);

    ensureSeatReservationCompat();
    const client = new Client(resolveRaceServerUrl());
    const joinOptions = {
      playerLabel: playerLabelRef.current,
      playerId,
      characterId,
      locale,
    };
    const createOptions: TypingRoomCreateMessage | null = createRoom
      ? {
          ...createRoom,
          ...joinOptions,
          roomMode: "lobby",
        }
      : null;

    const joinPromise = createOptions
      ? client.create<unknown>(TYPING_RACE_ROOM_NAME, createOptions)
      : roomId
        ? client.joinById<unknown>(roomId, joinOptions)
        : client.joinOrCreate<unknown>(TYPING_RACE_ROOM_NAME, {
            ...quickRoom,
            ...joinOptions,
            roomMode: "quick",
          });

    joinPromise
      .then((room) => {
        if (cancelled) {
          try {
            room.leave();
          } catch {
            /* ignore */
          }
          return;
        }

        roomRef.current = room;
        setMySeat(playerId);
        setConnectedRoomId(room.roomId);
        setConnectionState("connected");

        room.onMessage(RACE_EVENTS.RACE_SEED, (message: RaceSeedMessage) => {
          setPrompt(message.prompt);
        });

        room.onMessage(
          RACE_EVENTS.ROOM_STATE,
          (message: TypingRoomSnapshot) => {
            setRoomSnapshot(message);
          }
        );

        room.onMessage(RACE_EVENTS.ROOM_ERROR, (message: RoomErrorMessage) => {
          setRoomError(normalizeRoomErrorMessage(message.message));
        });

        room.onMessage(
          RACE_EVENTS.RACE_RESULT,
          (message: RaceResultMessage) => {
            setResults(message.results);
          }
        );

        room.onMessage(
          RACE_EVENTS.RACE_STATE,
          (message: TypingRaceSnapshot) => {
            setSnapshot(message);
          }
        );

        room.onLeave(() => {
          if (!cancelled) setConnectionState("disconnected");
        });

        room.onError((_code, message) => {
          if (cancelled) return;
          applyRoomErrorState(setConnectionState, setRoomError, message);
        });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[typing-race] 룸 접속 실패:", err);
          applyRoomErrorState(setConnectionState, setRoomError, err);
        }
      });

    return () => {
      cancelled = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        try {
          room.leave();
        } catch {
          /* ignore */
        }
      }
    };
  }, [
    enabled,
    playerId,
    characterId,
    locale,
    roomId,
    createRoomKey,
    quickRoomKey,
    rejoinToken,
  ]);

  const sendProgress = useCallback((payload: RaceProgressMessage) => {
    roomRef.current?.send(RACE_EVENTS.RACE_PROGRESS, payload);
  }, []);

  const sendFinish = useCallback((payload: RaceFinishMessage) => {
    roomRef.current?.send(RACE_EVENTS.RACE_FINISH, payload);
  }, []);

  const sendReady = useCallback((isReady: boolean) => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_READY, { isReady });
  }, []);

  const sendStart = useCallback((payload?: RoomStartMessage) => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_START, payload);
  }, []);

  const sendChat = useCallback((content: string) => {
    setRoomError(null);
    const trimmed = content.trim();
    if (!trimmed.length) return;
    roomRef.current?.send(RACE_EVENTS.ROOM_CHAT, {
      content: trimmed,
    } as RoomChatMessage);
  }, []);

  const sendRoomSettings = useCallback((payload: RoomSettingsUpdateMessage) => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_SETTINGS, payload);
  }, []);

  const rejoin = useCallback(() => {
    // connectionState를 즉시 "connecting"으로 리셋 (retry flip-back 방지)
    setConnectionState("connecting");
    setSnapshot(null);
    setRoomSnapshot(null);
    setPrompt(null);
    setResults([]);
    setMySeat(null);
    setConnectedRoomId(null);
    setRoomError(null);
    setRejoinToken((v) => v + 1);
  }, []);

  return useMemo<UseRaceRoomResult>(
    () => ({
      connectionState,
      snapshot,
      roomSnapshot,
      results: roomSnapshot?.results.length ? roomSnapshot.results : results,
      prompt,
      countdownRemaining:
        snapshot?.countdownRemaining ?? TYPING_RACE_DEFAULTS.countdownSeconds,
      stage: snapshot?.stage ?? TYPING_RACE_STAGE.COUNTDOWN,
      mySeat,
      roomId: connectedRoomId,
      roomError,
      sendProgress,
      sendFinish,
      sendReady,
      sendStart,
      sendChat,
      sendRoomSettings,
      rejoin,
    }),
    [
      connectionState,
      snapshot,
      roomSnapshot,
      results,
      prompt,
      mySeat,
      connectedRoomId,
      roomError,
      sendProgress,
      sendFinish,
      sendReady,
      sendStart,
      sendChat,
      sendRoomSettings,
      rejoin,
    ]
  );
}
