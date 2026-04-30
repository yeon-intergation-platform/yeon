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
  type RaceSeedMessage,
  type RoomErrorMessage,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingRoomCreateMessage,
  type TypingRoomSnapshot,
} from "@yeon/race-shared";

export type RaceConnectionState = "idle" | "connecting" | "connected" | "error" | "disconnected";

export type UseRaceRoomOptions = {
  enabled: boolean;
  playerLabel: string;
  playerId: string | null;
  locale: "ko" | "en";
  roomId?: string | null;
  createRoom?: TypingRoomCreateMessage | null;
};

export type UseRaceRoomResult = {
  connectionState: RaceConnectionState;
  snapshot: TypingRaceSnapshot | null;
  roomSnapshot: TypingRoomSnapshot | null;
  prompt: string | null;
  countdownRemaining: number;
  stage: TypingRaceStage;
  mySeat: string | null;
  roomId: string | null;
  roomError: string | null;
  sendProgress: (payload: RaceProgressMessage) => void;
  sendFinish: (payload: RaceFinishMessage) => void;
  sendReady: (isReady: boolean) => void;
  sendStart: () => void;
  rejoin: () => void;
};

const DEFAULT_SERVER_URL = "ws://localhost:2567";

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
  consumeSeatReservation?: (response: LegacySeatReservation, ...args: unknown[]) => unknown;
};

function ensureSeatReservationCompat() {
  const prototype = Client.prototype as unknown as ColyseusClientPrototypeWithCompat;
  if (prototype.__yeonSeatReservationCompat || !prototype.consumeSeatReservation) return;

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

export function resolveRaceServerUrl() {
  const envUrl = process.env.NEXT_PUBLIC_RACE_SERVER_URL;
  return envUrl && envUrl.length > 0 ? envUrl : DEFAULT_SERVER_URL;
}

export function useRaceRoom(options: UseRaceRoomOptions): UseRaceRoomResult {
  const { enabled, playerLabel, playerId, locale, roomId, createRoom } = options;
  const [connectionState, setConnectionState] = useState<RaceConnectionState>("idle");
  const [snapshot, setSnapshot] = useState<TypingRaceSnapshot | null>(null);
  const [roomSnapshot, setRoomSnapshot] = useState<TypingRoomSnapshot | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [mySeat, setMySeat] = useState<string | null>(null);
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [rejoinToken, setRejoinToken] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const createRoomKey = createRoom ? JSON.stringify(createRoom) : "";

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
    setMySeat(null);
    setConnectedRoomId(null);
    setRoomError(null);

    ensureSeatReservationCompat();
    const client = new Client(resolveRaceServerUrl());
    const joinOptions = {
      playerLabel: playerLabelRef.current,
      playerId,
      locale,
    };

    const joinPromise = createRoom
      ? client.create<unknown>(TYPING_RACE_ROOM_NAME, {
          ...createRoom,
          ...joinOptions,
          roomMode: "lobby",
        })
      : roomId
        ? client.joinById<unknown>(roomId, joinOptions)
        : client.joinOrCreate<unknown>(TYPING_RACE_ROOM_NAME, {
            ...joinOptions,
            roomMode: "quick",
          });

    joinPromise
      .then((room) => {
        if (cancelled) {
          try { room.leave(); } catch { /* ignore */ }
          return;
        }

        roomRef.current = room;
        setMySeat(room.sessionId);
        setConnectedRoomId(room.roomId);
        setConnectionState("connected");

        room.onMessage(RACE_EVENTS.RACE_SEED, (message: RaceSeedMessage) => {
          setPrompt(message.prompt);
        });

        room.onMessage(RACE_EVENTS.ROOM_STATE, (message: TypingRoomSnapshot) => {
          setRoomSnapshot(message);
        });

        room.onMessage(RACE_EVENTS.ROOM_ERROR, (message: RoomErrorMessage) => {
          setRoomError(message.message);
        });

        room.onMessage(RACE_EVENTS.RACE_STATE, (message: TypingRaceSnapshot) => {
          setSnapshot(message);
        });

        room.onLeave(() => {
          if (!cancelled) setConnectionState("disconnected");
        });

        room.onError((_code, _message) => {
          if (!cancelled) setConnectionState("error");
        });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[typing-race] 룸 접속 실패:", err);
          setConnectionState("error");
        }
      });

    return () => {
      cancelled = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        try { room.leave(); } catch { /* ignore */ }
      }
    };
  }, [enabled, playerId, locale, roomId, createRoomKey, rejoinToken]);

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

  const sendStart = useCallback(() => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_START);
  }, []);

  const rejoin = useCallback(() => {
    // connectionState를 즉시 "connecting"으로 리셋 (retry flip-back 방지)
    setConnectionState("connecting");
    setSnapshot(null);
    setRoomSnapshot(null);
    setPrompt(null);
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
      prompt,
      countdownRemaining: snapshot?.countdownRemaining ?? TYPING_RACE_DEFAULTS.countdownSeconds,
      stage: snapshot?.stage ?? TYPING_RACE_STAGE.COUNTDOWN,
      mySeat,
      roomId: connectedRoomId,
      roomError,
      sendProgress,
      sendFinish,
      sendReady,
      sendStart,
      rejoin,
    }),
    [
      connectionState,
      snapshot,
      roomSnapshot,
      prompt,
      mySeat,
      connectedRoomId,
      roomError,
      sendProgress,
      sendFinish,
      sendReady,
      sendStart,
      rejoin,
    ],
  );
}
