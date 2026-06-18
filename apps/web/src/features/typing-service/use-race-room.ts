"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type RoomTeamChangeMessage,
  type RoomErrorMessage,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingResultSnapshot,
  type TypingRoomCreateMessage,
  type TypingRoomSnapshot,
} from "@yeon/race-shared";
import { delayYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  createYeonRealtimeClient,
  ensureYeonRealtimeSeatReservationCompat,
  type YeonRealtimeRoom,
} from "@yeon/ui/runtime/YeonRealtimeClient";
import {
  loadTypingRaceUserToken,
  type TypingRaceUserToken,
} from "./typing-service-fetch";

export type RaceConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export type UseRaceRoomConnectionOptions = {
  enabled: boolean;
  roomId?: string | null;
};

export type UseRaceRoomPlayerOptions = {
  playerLabel: string;
  playerId: string | null;
  characterId?: string;
  locale: "ko" | "en";
};

export type UseRaceRoomCreationOptions = {
  createRoom?: TypingRoomCreateMessage | null;
  quickRoom?: TypingRoomCreateMessage | null;
};

export type UseRaceRoomOptions = UseRaceRoomConnectionOptions &
  UseRaceRoomPlayerOptions &
  UseRaceRoomCreationOptions;

export type UseRaceRoomConnectionResult = {
  room: YeonRealtimeRoom | null;
  connectionState: RaceConnectionState;
  roomId: string | null;
  roomError: string | null;
};

export type UseRaceRoomSnapshotResult = {
  snapshot: TypingRaceSnapshot | null;
  roomSnapshot: TypingRoomSnapshot | null;
  results: readonly TypingResultSnapshot[];
  prompt: string | null;
  countdownRemaining: number;
  stage: TypingRaceStage;
  mySeat: string | null;
};

export type UseRaceRoomMessageActions = {
  sendProgress: (payload: RaceProgressMessage) => void;
  sendFinish: (payload: RaceFinishMessage) => void;
  sendReady: (isReady: boolean) => void;
  sendStart: (payload?: RoomStartMessage) => void;
  sendChat: (content: string) => void;
  sendTeamChange: (payload?: RoomTeamChangeMessage) => void;
  sendRoomSettings: (payload: RoomSettingsUpdateMessage) => void;
};

export type UseRaceRoomLifecycleActions = {
  leaveRoom: () => Promise<void>;
  rejoin: () => void;
};

export type UseRaceRoomResult = UseRaceRoomConnectionResult &
  UseRaceRoomSnapshotResult &
  UseRaceRoomMessageActions &
  UseRaceRoomLifecycleActions;

const DEFAULT_SERVER_URL = "ws://localhost:2567";
const EXPLICIT_LEAVE_FLUSH_DELAY_MS = 80;

const ROOM_ERROR_MESSAGES = {
  started: "이미 시작된 방입니다.",
  full: "방이 가득 찼습니다.",
  notFound: "존재하지 않는 방입니다.",
  network: "서버와의 연결이 끊어졌습니다.",
  unknown: "타자방에 연결할 수 없습니다.",
} as const;

function warnRaceRoomCleanupFailure(context: string, error: unknown) {
  console.warn(`[typing-race] ${context}`, error);
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
  const [room, setRoom] = useState<YeonRealtimeRoom | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [results, setResults] = useState<readonly TypingResultSnapshot[]>([]);
  const [mySeat, setMySeat] = useState<string | null>(null);
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [rejoinToken, setRejoinToken] = useState(0);

  const roomRef = useRef<YeonRealtimeRoom | null>(null);
  // 전용 토큰 엔드포인트 결과를 한 번만 받아 보관한다(재연결마다 중복 fetch 방지).
  const userTokenPromiseRef = useRef<Promise<TypingRaceUserToken> | null>(null);
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
    setRoom(null);

    ensureYeonRealtimeSeatReservationCompat();
    const client = createYeonRealtimeClient(resolveRaceServerUrl());

    // 시드와 무관한 전용 토큰 엔드포인트에서 로그인 사용자 토큰을 받아 모든 join 경로
    // (create/quickRoom/joinById)에 균일하게 userId/userToken 을 주입한다. 이렇게 해야 방을 만든 host
    // 뿐 아니라 기존 방에 입장(joinById)하는 참가자도 경험치 적립 대상이 된다.
    // best-effort: loadTypingRaceUserToken 은 실패 시 { null, null } 을 돌려주므로 토큰이 없어도
    // 레이스 진행은 깨지지 않고 적립만 누락된다. 비로그인은 서버가 null 을 반환 → join 옵션에서 빠진다.
    if (!userTokenPromiseRef.current) {
      userTokenPromiseRef.current = loadTypingRaceUserToken();
    }

    const joinPromise = userTokenPromiseRef.current.then((userAuth) => {
      const joinOptions = {
        playerLabel: playerLabelRef.current,
        playerId,
        characterId,
        locale,
        ...(userAuth.userId ? { userId: userAuth.userId } : {}),
        ...(userAuth.userToken ? { userToken: userAuth.userToken } : {}),
      };
      const createOptions: TypingRoomCreateMessage | null = createRoom
        ? {
            ...createRoom,
            ...joinOptions,
            roomMode: "lobby",
          }
        : null;

      return createOptions
        ? client.create<unknown>(TYPING_RACE_ROOM_NAME, createOptions)
        : roomId
          ? client.joinById<unknown>(roomId, joinOptions)
          : client.joinOrCreate<unknown>(TYPING_RACE_ROOM_NAME, {
              ...quickRoom,
              ...joinOptions,
              roomMode: "quick",
            });
    });

    joinPromise
      .then((room) => {
        if (cancelled) {
          try {
            void room.leave(false);
          } catch (error) {
            warnRaceRoomCleanupFailure("취소된 접속의 룸 정리 실패", error);
          }
          return;
        }

        roomRef.current = room;
        setRoom(room);
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
      setRoom(null);
      if (room) {
        try {
          void room.leave(false);
        } catch (error) {
          warnRaceRoomCleanupFailure("언마운트 룸 정리 실패", error);
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

  const sendTeamChange = useCallback((payload?: RoomTeamChangeMessage) => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_TEAM, payload ?? {});
  }, []);

  const sendRoomSettings = useCallback((payload: RoomSettingsUpdateMessage) => {
    setRoomError(null);
    roomRef.current?.send(RACE_EVENTS.ROOM_SETTINGS, payload);
  }, []);

  const leaveRoom = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    setRoom(null);
    setRoomError(null);

    if (!room) {
      setConnectionState("disconnected");
      return;
    }

    try {
      room.send(RACE_EVENTS.ROOM_LEAVE, {});
      await delayYeon(EXPLICIT_LEAVE_FLUSH_DELAY_MS);
      await room.leave(true);
    } catch (error) {
      warnRaceRoomCleanupFailure(
        "명시적 퇴장 처리 실패, 강제 퇴장으로 전환",
        error
      );
      try {
        await room.leave(false);
      } catch (fallbackError) {
        warnRaceRoomCleanupFailure("강제 퇴장 처리 실패", fallbackError);
      }
    } finally {
      setConnectionState("disconnected");
    }
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
    setRoom(null);
    setRejoinToken((v) => v + 1);
  }, []);

  return useMemo<UseRaceRoomResult>(
    () => ({
      room,
      connectionState,
      snapshot,
      roomSnapshot,
      results: roomSnapshot ? roomSnapshot.results : results,
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
      sendTeamChange,
      sendRoomSettings,
      leaveRoom,
      rejoin,
    }),
    [
      room,
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
      sendTeamChange,
      sendRoomSettings,
      leaveRoom,
      rejoin,
    ]
  );
}
