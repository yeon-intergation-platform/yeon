"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TERRITORY_BATTLE_EVENTS,
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_ROOM_NAME,
  type TerritoryBattleErrorCode,
  type TerritoryBattlePhase,
  type TerritoryBattleSnapshot,
  type TerritoryBattleSubmitWordMessage,
  type TerritoryBattleWinnerResult,
} from "@yeon/race-shared";
import { resolveRaceServerUrl } from "./use-race-room";
import {
  createYeonRealtimeClient,
  type YeonRealtimeRoom,
} from "@yeon/ui/runtime/YeonRealtimeClient";
import {
  readYeonLocalStorageItem,
  removeYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export type TerritoryBattleConnectionState =
  | "idle"
  | "connecting"
  | "reconnecting"
  | "connected"
  | "error"
  | "disconnected";

const TERRITORY_BATTLE_RECONNECTION_TOKEN_STORAGE_KEY =
  "yeon:typing-territory:reconnection-token";

type TerritoryBattleRoomError = {
  code: TerritoryBattleErrorCode | "network" | "unknown";
  message: string;
};

export type UseTerritoryBattleRoomOptions = {
  enabled: boolean;
  nickname: string;
  originRoomId: string;
};

export type UseTerritoryBattleConnectionResult = {
  connectionState: TerritoryBattleConnectionState;
  roomId: string | null;
  roomError: TerritoryBattleRoomError | null;
};

export type UseTerritoryBattleSnapshotResult = {
  snapshot: TerritoryBattleSnapshot | null;
  result: TerritoryBattleWinnerResult | null;
};

export type UseTerritoryBattleMessageActions = {
  sendStart: () => void;
  sendSubmitWord: (payload: TerritoryBattleSubmitWordMessage) => void;
};

export type UseTerritoryBattleLifecycleActions = {
  leaveRoom: () => Promise<void>;
  rejoin: () => void;
};

export type UseTerritoryBattleRoomResult = UseTerritoryBattleConnectionResult &
  UseTerritoryBattleSnapshotResult &
  UseTerritoryBattleMessageActions &
  UseTerritoryBattleLifecycleActions;

function getReconnectionTokenStorageKey(originRoomId: string) {
  return `${TERRITORY_BATTLE_RECONNECTION_TOKEN_STORAGE_KEY}:${originRoomId}`;
}

function readReconnectionToken(originRoomId: string) {
  return readYeonLocalStorageItem(getReconnectionTokenStorageKey(originRoomId));
}

function writeReconnectionToken(originRoomId: string, token: string) {
  writeYeonLocalStorageItem(
    getReconnectionTokenStorageKey(originRoomId),
    token
  );
}

function clearReconnectionToken(originRoomId: string) {
  removeYeonLocalStorageItem(getReconnectionTokenStorageKey(originRoomId));
}

function warnTerritoryRoomCleanupFailure(context: string, error: unknown) {
  console.warn(`[typing-territory] ${context}`, error);
}

function normalizeRoomError(error: unknown): TerritoryBattleRoomError {
  if (typeof error === "object" && error !== null) {
    const record = error as { code?: unknown; message?: unknown };
    if (typeof record.message === "string") {
      return {
        code:
          typeof record.code === "string"
            ? (record.code as TerritoryBattleRoomError["code"])
            : "unknown",
        message: record.message,
      };
    }
  }

  if (error instanceof Error) {
    return { code: "network", message: error.message };
  }

  if (typeof error === "string" && error.trim()) {
    return { code: "network", message: error };
  }

  return { code: "unknown", message: "점령전 서버에 연결할 수 없습니다." };
}

export function useTerritoryBattleRoom({
  enabled,
  nickname,
  originRoomId,
}: UseTerritoryBattleRoomOptions): UseTerritoryBattleRoomResult {
  const [connectionState, setConnectionState] =
    useState<TerritoryBattleConnectionState>("idle");
  const [snapshot, setSnapshot] = useState<TerritoryBattleSnapshot | null>(
    null
  );
  const [result, setResult] = useState<TerritoryBattleWinnerResult | null>(
    null
  );
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<TerritoryBattleRoomError | null>(
    null
  );
  const [rejoinToken, setRejoinToken] = useState(0);
  const roomRef = useRef<YeonRealtimeRoom | null>(null);
  const nicknameRef = useRef(nickname);

  useEffect(() => {
    nicknameRef.current = nickname;
  }, [nickname]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setConnectionState("connecting");
    setSnapshot(null);
    setResult(null);
    setRoomId(null);
    setRoomError(null);

    const client = createYeonRealtimeClient(resolveRaceServerUrl());
    const storedReconnectionToken = readReconnectionToken(originRoomId);
    const connectRoom = storedReconnectionToken
      ? client.reconnect<unknown>(storedReconnectionToken).catch((error) => {
          console.warn(
            "[typing-territory] 재접속 실패, 새 방 참가로 전환",
            error
          );
          clearReconnectionToken(originRoomId);
          if (!cancelled) setConnectionState("connecting");
          return client.joinOrCreate<unknown>(TERRITORY_BATTLE_ROOM_NAME, {
            nickname: nicknameRef.current,
            sourceRoomId: originRoomId,
          });
        })
      : client.joinOrCreate<unknown>(TERRITORY_BATTLE_ROOM_NAME, {
          nickname: nicknameRef.current,
          sourceRoomId: originRoomId,
        });

    if (storedReconnectionToken) setConnectionState("reconnecting");

    connectRoom
      .then((room) => {
        if (cancelled) {
          void room.leave(false);
          return;
        }

        roomRef.current = room;
        setConnectionState("connected");
        setRoomId(room.roomId);
        writeReconnectionToken(originRoomId, room.reconnectionToken);

        room.onMessage(
          TERRITORY_BATTLE_EVENTS.STATE,
          (message: TerritoryBattleSnapshot) => {
            setSnapshot(message);
          }
        );
        room.onMessage(
          TERRITORY_BATTLE_EVENTS.RESULT,
          (message: TerritoryBattleWinnerResult) => {
            setResult(message);
          }
        );
        room.onMessage(TERRITORY_BATTLE_EVENTS.ERROR, (message: unknown) => {
          setRoomError(normalizeRoomError(message));
        });
        room.onStateChange((state) => {
          setSnapshot(state as TerritoryBattleSnapshot);
        });
        room.onError((_code, message) => {
          if (cancelled) return;
          setConnectionState("error");
          setRoomError(normalizeRoomError(message));
        });
        room.onLeave(() => {
          if (cancelled) return;
          setConnectionState("disconnected");
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setConnectionState("error");
        setRoomError(normalizeRoomError(error));
      });

    return () => {
      cancelled = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) void room.leave(false);
    };
  }, [enabled, originRoomId, rejoinToken]);

  const sendStart = useCallback(() => {
    setRoomError(null);
    roomRef.current?.send(TERRITORY_BATTLE_EVENTS.START, {});
  }, []);

  const sendSubmitWord = useCallback(
    (payload: TerritoryBattleSubmitWordMessage) => {
      setRoomError(null);
      roomRef.current?.send(TERRITORY_BATTLE_EVENTS.SUBMIT_WORD, payload);
    },
    []
  );

  const leaveRoom = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    setSnapshot(null);
    setResult(null);
    setRoomId(null);
    setRoomError(null);

    if (!room) {
      setConnectionState("disconnected");
      return;
    }

    clearReconnectionToken(originRoomId);

    try {
      await room.leave(true);
    } catch (error) {
      warnTerritoryRoomCleanupFailure(
        "명시적 퇴장 처리 실패, 강제 퇴장으로 전환",
        error
      );
      try {
        await room.leave(false);
      } catch (fallbackError) {
        warnTerritoryRoomCleanupFailure("강제 퇴장 처리 실패", fallbackError);
      }
    } finally {
      setConnectionState("disconnected");
    }
  }, [originRoomId]);

  const rejoin = useCallback(() => {
    setConnectionState("connecting");
    setSnapshot(null);
    setResult(null);
    setRoomId(null);
    setRoomError(null);
    setRejoinToken((value) => value + 1);
  }, []);

  return useMemo(
    () => ({
      connectionState,
      snapshot,
      result,
      roomId,
      roomError,
      sendStart,
      sendSubmitWord,
      leaveRoom,
      rejoin,
    }),
    [
      connectionState,
      snapshot,
      result,
      roomId,
      roomError,
      sendStart,
      sendSubmitWord,
      leaveRoom,
      rejoin,
    ]
  );
}

export function getTerritoryPhaseLabel(phase: TerritoryBattlePhase | null) {
  const labels: Record<TerritoryBattlePhase, string> = {
    [TERRITORY_BATTLE_PHASE.WAITING]: "대기",
    [TERRITORY_BATTLE_PHASE.COUNTDOWN]: "카운트다운",
    [TERRITORY_BATTLE_PHASE.PLAYING]: "진행 중",
    [TERRITORY_BATTLE_PHASE.FINISHED]: "종료",
  };
  return phase ? labels[phase] : "연결 전";
}

export function canShowTerritoryBattleResult(input: {
  result: TerritoryBattleWinnerResult | null;
  snapshot: Pick<TerritoryBattleSnapshot, "phase"> | null;
}) {
  return (
    input.snapshot?.phase === TERRITORY_BATTLE_PHASE.FINISHED ||
    Boolean(input.result)
  );
}
