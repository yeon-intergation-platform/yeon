"use client";

import { Client, type Room } from "@colyseus/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type StarLobbyAlertRuleDeletionResponse,
  type StarLobbyAlertRuleListResponse,
  type StarLobbyAlertRuleMutationResponse,
  type StarLobbyDiscordWebhookStatusResponse,
  type StarLobbyObservedRoomDto,
  type StarLobbyRoomListResponse,
} from "@yeon/api-contract/star-lobby";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  STAR_LOBBY_EVENTS,
  STAR_LOBBY_ROOM_NAME,
  type StarLobbyAlertMatchedEvent,
  type StarLobbyRealtimeEvent,
  type StarLobbyRoomDto,
} from "@yeon/race-shared";

import { resolveRaceServerUrl } from "@/features/typing-service/use-race-room";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";
type SaveState = "idle" | "loading" | "success" | "error";

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
const GUEST_SESSION_ID_HEADER = "X-Yeon-Guest-Session-Id";

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

function alertRuleName(includeKeywords: string[]) {
  return `${includeKeywords[0] ?? "스타 로비"} 방제 감지`;
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

function roomTime(
  room: Pick<StarLobbyObservedRoomDto, "lastSeenAt" | "observedAt">
) {
  return new Date(room.lastSeenAt || room.observedAt).getTime();
}

function sortRoomsByLatest(rooms: StarLobbyObservedRoomDto[]) {
  return [...rooms].sort((left, right) => roomTime(right) - roomTime(left));
}

function mergeObservedRoom(
  current: StarLobbyRoomListResponse | undefined,
  room: StarLobbyObservedRoomDto
): StarLobbyRoomListResponse {
  const existingRooms = current ? current.rooms : [];
  return {
    observedAt: room.observedAt,
    rooms: sortRoomsByLatest([
      room,
      ...existingRooms.filter((currentRoom) => currentRoom.id !== room.id),
    ]),
  };
}

function mergeDisappearedRoom(
  current: StarLobbyRoomListResponse | undefined,
  room: StarLobbyObservedRoomDto
): StarLobbyRoomListResponse {
  const existingRooms = current ? current.rooms : [];
  return {
    observedAt: current ? current.observedAt : room.observedAt,
    rooms: sortRoomsByLatest(
      existingRooms.map((currentRoom) =>
        currentRoom.id === room.id ? room : currentRoom
      )
    ),
  };
}

function toCurrentRoomsViewState(data: StarLobbyRoomListResponse | undefined) {
  const rooms = data ? data.rooms : [];
  const visibleRooms = rooms.filter((room) => room.status === "observed");
  return {
    rooms: visibleRooms.slice(0, MAX_VISIBLE_ITEMS),
    totalCount: visibleRooms.length,
    observedAt: data ? data.observedAt : null,
  };
}

function relativeTimeText(value: string | null) {
  if (!value) return "관측 전";
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  );
  if (diffSeconds < 5) return "방금";
  if (diffSeconds < 60) return `${diffSeconds}초 전`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}시간 전`;
}

function roomConfidenceText(room: StarLobbyObservedRoomDto) {
  if (room.matchedKeywords.length > 0) return "키워드 감지";
  if (room.rawText) return "관측됨";
  return "확인 필요";
}

function mergeSavedRules(
  current: StarLobbyAlertRuleListResponse | undefined,
  rule: StarLobbyAlertRuleMutationResponse["rule"]
): StarLobbyAlertRuleListResponse {
  const existingRules = current ? current.rules : [];
  return {
    rules: [
      rule,
      ...existingRules.filter((savedRule) => savedRule.id !== rule.id),
    ],
  };
}

function removeSavedRule(
  current: StarLobbyAlertRuleListResponse | undefined,
  ruleId: string
): StarLobbyAlertRuleListResponse {
  const existingRules = current ? current.rules : [];
  return {
    rules: existingRules.filter((savedRule) => savedRule.id !== ruleId),
  };
}

function toSavedRulesViewState(
  data: StarLobbyAlertRuleListResponse | undefined
) {
  return data ? data.rules : [];
}

function toSaveButtonViewState(isPending: boolean) {
  return {
    disabledWhileSaving: isPending,
    label: isPending ? "알림 조건 저장 중" : "이 키워드로 접속 중 알림 받기",
  };
}

function toRuleActionViewState(isPending: boolean) {
  return {
    disabled: isPending,
    statusText: isPending ? "처리 중" : null,
  };
}

function ensureGuestSessionId() {
  if (typeof window === "undefined") return null;
  const current = window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  if (current) return current;
  const next = globalThis.crypto?.randomUUID?.() ?? `guest-${Date.now()}`;
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, next);
  return next;
}

function requestHeaders(guestSessionId: string) {
  return {
    "content-type": "application/json",
    [GUEST_SESSION_ID_HEADER]: guestSessionId,
  };
}

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return body.message ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function StarLobbyLivePanel() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [includeText, setIncludeText] = useState(
    keywordText(DEFAULT_RULE.includeKeywords)
  );
  const [excludeText, setExcludeText] = useState(
    keywordText(DEFAULT_RULE.excludeKeywords)
  );
  const [discordWebhookText, setDiscordWebhookText] = useState("");
  const [discordMessage, setDiscordMessage] = useState<string | null>(null);
  const [rule, setRule] = useState<KeywordRule>(DEFAULT_RULE);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const roomRef = useRef<Room | null>(null);
  const guestSessionIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

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
    const nextGuestSessionId = ensureGuestSessionId();
    guestSessionIdRef.current = nextGuestSessionId;
    setGuestSessionId(nextGuestSessionId);
  }, []);

  const alertRulesQuery = useQuery({
    enabled: Boolean(guestSessionId),
    queryKey: ["star-lobby", "alert-rules", guestSessionId],
    queryFn: async () => {
      if (!guestSessionId) return { rules: [] };
      const response = await fetch("/api/v1/star-lobby/alert-rules", {
        cache: "no-store",
        headers: { [GUEST_SESSION_ID_HEADER]: guestSessionId },
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "저장된 알림 조건을 불러오지 못했습니다."
          )
        );
      }
      return (await response.json()) as StarLobbyAlertRuleListResponse;
    },
  });

  const discordWebhookQuery = useQuery({
    enabled: Boolean(guestSessionId),
    queryKey: ["star-lobby", "discord-webhook", guestSessionId],
    queryFn: async () => {
      if (!guestSessionId) return { connected: false, updatedAt: null };
      const response = await fetch("/api/v1/star-lobby/discord-webhook", {
        cache: "no-store",
        headers: { [GUEST_SESSION_ID_HEADER]: guestSessionId },
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "Discord 알림 연결 상태를 불러오지 못했습니다."
          )
        );
      }
      return (await response.json()) as StarLobbyDiscordWebhookStatusResponse;
    },
  });

  const currentRoomsQuery = useQuery({
    queryKey: ["star-lobby", "rooms"],
    queryFn: async () => {
      const response = await fetch("/api/v1/star-lobby/rooms", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 현재 방 목록을 불러오지 못했습니다."
          )
        );
      }
      return (await response.json()) as StarLobbyRoomListResponse;
    },
  });

  const createAlertRuleMutation = useMutation({
    mutationFn: async (nextRule: KeywordRule) => {
      const currentGuestSessionId = guestSessionIdRef.current;
      if (!currentGuestSessionId) {
        throw new Error(
          "게스트 세션을 만들지 못해 알림 조건을 저장하지 못했습니다."
        );
      }

      const response = await fetch("/api/v1/star-lobby/alert-rules", {
        method: "POST",
        headers: requestHeaders(currentGuestSessionId),
        body: JSON.stringify({
          name: alertRuleName(nextRule.includeKeywords),
          ...nextRule,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 알림 조건을 저장하지 못했습니다."
          )
        );
      }

      return (await response.json()) as StarLobbyAlertRuleMutationResponse;
    },
    onSuccess: (body) => {
      queryClient.setQueryData<StarLobbyAlertRuleListResponse>(
        ["star-lobby", "alert-rules", guestSessionIdRef.current],
        (current) => mergeSavedRules(current, body.rule)
      );
      setSaveState("success");
      setSaveMessage("알림 조건을 저장했습니다. 접속 중에는 즉시 감지합니다.");
    },
    onError: (err) => {
      setSaveState("error");
      setSaveMessage(
        err instanceof Error
          ? err.message
          : "스타 로비 알림 조건을 저장하지 못했습니다."
      );
    },
  });

  const updateAlertRuleMutation = useMutation({
    mutationFn: async (params: { ruleId: string; enabled: boolean }) => {
      const currentGuestSessionId = guestSessionIdRef.current;
      if (!currentGuestSessionId) {
        throw new Error(
          "게스트 세션을 만들지 못해 알림 조건을 수정하지 못했습니다."
        );
      }

      const response = await fetch(
        `/api/v1/star-lobby/alert-rules/${encodeURIComponent(params.ruleId)}`,
        {
          method: "PATCH",
          headers: requestHeaders(currentGuestSessionId),
          body: JSON.stringify({ enabled: params.enabled }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 알림 조건을 수정하지 못했습니다."
          )
        );
      }

      return (await response.json()) as StarLobbyAlertRuleMutationResponse;
    },
    onSuccess: (body) => {
      queryClient.setQueryData<StarLobbyAlertRuleListResponse>(
        ["star-lobby", "alert-rules", guestSessionIdRef.current],
        (current) => mergeSavedRules(current, body.rule)
      );
      setSaveState("success");
      setSaveMessage(
        body.rule.enabled
          ? "알림 조건을 다시 켰습니다."
          : "알림 조건을 껐습니다. 꺼진 조건은 매칭 알림을 받지 않습니다."
      );
    },
    onError: (err) => {
      setSaveState("error");
      setSaveMessage(
        err instanceof Error
          ? err.message
          : "스타 로비 알림 조건을 수정하지 못했습니다."
      );
    },
  });

  const deleteAlertRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const currentGuestSessionId = guestSessionIdRef.current;
      if (!currentGuestSessionId) {
        throw new Error(
          "게스트 세션을 만들지 못해 알림 조건을 삭제하지 못했습니다."
        );
      }

      const response = await fetch(
        `/api/v1/star-lobby/alert-rules/${encodeURIComponent(ruleId)}`,
        {
          method: "DELETE",
          headers: { [GUEST_SESSION_ID_HEADER]: currentGuestSessionId },
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 알림 조건을 삭제하지 못했습니다."
          )
        );
      }

      return (await response.json()) as StarLobbyAlertRuleDeletionResponse;
    },
    onSuccess: (body) => {
      queryClient.setQueryData<StarLobbyAlertRuleListResponse>(
        ["star-lobby", "alert-rules", guestSessionIdRef.current],
        (current) => removeSavedRule(current, body.deletedRuleId)
      );
      setSaveState("success");
      setSaveMessage("알림 조건을 삭제했습니다.");
    },
    onError: (err) => {
      setSaveState("error");
      setSaveMessage(
        err instanceof Error
          ? err.message
          : "스타 로비 알림 조건을 삭제하지 못했습니다."
      );
    },
  });

  const upsertDiscordWebhookMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const currentGuestSessionId = guestSessionIdRef.current;
      if (!currentGuestSessionId) {
        throw new Error(
          "게스트 세션을 만들지 못해 Discord 알림을 연결하지 못했습니다."
        );
      }

      const response = await fetch("/api/v1/star-lobby/discord-webhook", {
        method: "PUT",
        headers: requestHeaders(currentGuestSessionId),
        body: JSON.stringify({ webhookUrl }),
      });

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 Discord 알림을 연결하지 못했습니다."
          )
        );
      }

      return (await response.json()) as StarLobbyDiscordWebhookStatusResponse;
    },
    onSuccess: (body) => {
      queryClient.setQueryData<StarLobbyDiscordWebhookStatusResponse>(
        ["star-lobby", "discord-webhook", guestSessionIdRef.current],
        body
      );
      setDiscordWebhookText("");
      setDiscordMessage(
        "Discord 알림을 연결했습니다. 조건에 맞는 방이 뜨면 Discord로 전송합니다."
      );
    },
    onError: (err) => {
      setDiscordMessage(
        err instanceof Error
          ? err.message
          : "스타 로비 Discord 알림을 연결하지 못했습니다."
      );
    },
  });

  const deleteDiscordWebhookMutation = useMutation({
    mutationFn: async () => {
      const currentGuestSessionId = guestSessionIdRef.current;
      if (!currentGuestSessionId) {
        throw new Error(
          "게스트 세션을 만들지 못해 Discord 알림을 해제하지 못했습니다."
        );
      }

      const response = await fetch("/api/v1/star-lobby/discord-webhook", {
        method: "DELETE",
        headers: { [GUEST_SESSION_ID_HEADER]: currentGuestSessionId },
      });

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 Discord 알림 연결을 해제하지 못했습니다."
          )
        );
      }

      return (await response.json()) as StarLobbyDiscordWebhookStatusResponse;
    },
    onSuccess: (body) => {
      queryClient.setQueryData<StarLobbyDiscordWebhookStatusResponse>(
        ["star-lobby", "discord-webhook", guestSessionIdRef.current],
        body
      );
      setDiscordMessage("Discord 알림 연결을 해제했습니다.");
    },
    onError: (err) => {
      setDiscordMessage(
        err instanceof Error
          ? err.message
          : "스타 로비 Discord 알림 연결을 해제하지 못했습니다."
      );
    },
  });

  const savedRules = toSavedRulesViewState(alertRulesQuery.data);
  const currentRoomsViewState = toCurrentRoomsViewState(currentRoomsQuery.data);
  const currentRoomsError = currentRoomsQuery.error;
  const saveButtonViewState = toSaveButtonViewState(
    createAlertRuleMutation.isPending
  );
  const ruleActionViewState = toRuleActionViewState(
    updateAlertRuleMutation.isPending || deleteAlertRuleMutation.isPending
  );
  const discordWebhookStatus = discordWebhookQuery.data ?? {
    connected: false,
    updatedAt: null,
  };
  const discordActionPending =
    upsertDiscordWebhookMutation.isPending ||
    deleteDiscordWebhookMutation.isPending;

  useEffect(() => {
    if (alertRulesQuery.error) {
      setSaveState("error");
      setSaveMessage(
        alertRulesQuery.error instanceof Error
          ? alertRulesQuery.error.message
          : "저장된 알림 조건을 불러오지 못했습니다."
      );
    }
  }, [alertRulesQuery.error]);

  useEffect(() => {
    if (currentRoomsError) {
      setError(
        currentRoomsError instanceof Error
          ? currentRoomsError.message
          : "스타 로비 현재 방 목록을 불러오지 못했습니다."
      );
    }
  }, [currentRoomsError]);

  useEffect(() => {
    let cancelled = false;
    const client = new Client(resolveRaceServerUrl());
    const guestSessionId = guestSessionIdRef.current ?? ensureGuestSessionId();
    guestSessionIdRef.current = guestSessionId;

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
            queryClient.setQueryData<StarLobbyRoomListResponse>(
              ["star-lobby", "rooms"],
              (current) => mergeObservedRoom(current, room)
            );
            setRooms((current) =>
              [
                { ...room, receivedAt: new Date() },
                ...current.filter((item) => item.id !== room.id),
              ].slice(0, MAX_VISIBLE_ITEMS)
            );
          }
        );
        room.onMessage(
          STAR_LOBBY_EVENTS.ROOM_DISAPPEARED,
          (event: StarLobbyRealtimeEvent) => {
            const room = eventRoom(event);
            queryClient.setQueryData<StarLobbyRoomListResponse>(
              ["star-lobby", "rooms"],
              (current) => mergeDisappearedRoom(current, room)
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
  }, [queryClient]);

  useEffect(() => {
    if (connectionState === "connected") sendSubscription(rule);
  }, [connectionState, rule, sendSubscription]);

  function handleDiscordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiscordMessage("Discord 웹훅을 저장하고 있습니다.");
    upsertDiscordWebhookMutation.mutate(discordWebhookText);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRule = {
      includeKeywords: parseKeywords(includeText),
      excludeKeywords: parseKeywords(excludeText),
    };

    setRule(nextRule);
    sendSubscription(nextRule);
    setSaveState("loading");
    setSaveMessage("접속 중 알림을 갱신하고 서버에 조건을 저장합니다.");
    createAlertRuleMutation.mutate(nextRule);
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
          disabled={!canSubscribe || saveButtonViewState.disabledWhileSaving}
          type="submit"
        >
          {saveButtonViewState.label}
        </button>
      </form>

      {saveMessage ? (
        saveState === "error" ? (
          <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">
            {saveMessage}
          </p>
        ) : (
          <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">
            {saveMessage}
          </p>
        )
      ) : null}

      {savedRules.length > 0 ? (
        <section className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="font-black text-white">저장된 알림 조건</h3>
          <div className="mt-3 space-y-2">
            {savedRules.slice(0, 3).map((savedRule) => (
              <article
                className="rounded-2xl bg-white/[0.05] p-3 text-sm text-slate-200"
                key={savedRule.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{savedRule.name}</p>
                  {savedRule.enabled ? (
                    <span className="rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                      켜짐
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-black text-slate-300">
                      꺼짐
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-400">
                  포함: {keywordText(savedRule.includeKeywords)}
                </p>
                {savedRule.excludeKeywords.length > 0 ? (
                  <p className="mt-1 text-slate-500">
                    제외: {keywordText(savedRule.excludeKeywords)}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-slate-100 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={ruleActionViewState.disabled}
                    onClick={() =>
                      updateAlertRuleMutation.mutate({
                        ruleId: savedRule.id,
                        enabled: !savedRule.enabled,
                      })
                    }
                    type="button"
                  >
                    {savedRule.enabled ? "알림 끄기" : "알림 켜기"}
                  </button>
                  <button
                    className="rounded-full border border-rose-300/30 px-3 py-1 text-xs font-bold text-rose-100 transition hover:border-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={ruleActionViewState.disabled}
                    onClick={() => deleteAlertRuleMutation.mutate(savedRule.id)}
                    type="button"
                  >
                    삭제
                  </button>
                  {ruleActionViewState.statusText ? (
                    <span className="px-2 py-1 text-xs text-slate-500">
                      {ruleActionViewState.statusText}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-white">Discord 알림</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Discord 웹훅 URL을 등록하면 조건에 맞는 방이 관측될 때 Discord로
              “방 떴다” 알림을 보냅니다.
            </p>
          </div>
          {discordWebhookStatus.connected ? (
            <span className="rounded-full bg-indigo-200 px-2 py-1 text-xs font-black text-slate-950">
              연결됨
            </span>
          ) : (
            <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-black text-slate-300">
              미연결
            </span>
          )}
        </div>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={handleDiscordSubmit}
        >
          <input
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-200"
            onChange={(event) => setDiscordWebhookText(event.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            value={discordWebhookText}
          />
          <button
            className="rounded-2xl bg-indigo-200 px-4 py-3 font-black text-slate-950 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            disabled={
              discordActionPending || discordWebhookText.trim().length === 0
            }
            type="submit"
          >
            연결
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span>서버 전역 Discord 환경변수 없이 동작합니다.</span>
          {discordWebhookStatus.updatedAt ? (
            <span>
              마지막 연결: {relativeTimeText(discordWebhookStatus.updatedAt)}
            </span>
          ) : null}
          {discordWebhookStatus.connected ? (
            <button
              className="rounded-full border border-white/15 px-3 py-1 font-bold text-slate-100 transition hover:border-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={discordActionPending}
              onClick={() => deleteDiscordWebhookMutation.mutate()}
              type="button"
            >
              연결 해제
            </button>
          ) : null}
        </div>
        {discordMessage ? (
          <p className="mt-3 rounded-2xl border border-indigo-200/20 bg-slate-950/60 p-3 text-sm text-indigo-50">
            {discordMessage}
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cyan-100">현재 열린 방</p>
            <h3 className="mt-1 font-black text-white">
              관측된 방 {currentRoomsViewState.totalCount}개
            </h3>
          </div>
          <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-bold text-cyan-100">
            마지막 관측 {relativeTimeText(currentRoomsViewState.observedAt)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          관측 기반 로비 목록입니다. 일부 방은 누락되거나 늦게 반영될 수
          있습니다.
        </p>

        <div className="mt-4 space-y-3">
          {currentRoomsViewState.rooms.length === 0 ? (
            <p className="rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
              아직 현재 열린 방이 없습니다. 개발용 수동 관측 입력이나 실제 관측
              이벤트가 들어오면 여기에 표시됩니다.
            </p>
          ) : (
            currentRoomsViewState.rooms.map((room) => (
              <article
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                key={room.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white">{room.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">
                      마지막 확인 {relativeTimeText(room.lastSeenAt)} ·{" "}
                      {roomConfidenceText(room)}
                    </p>
                    {room.matchedKeywords.length > 0 ? (
                      <p className="mt-2 text-xs font-bold text-cyan-100">
                        매칭 키워드: {keywordText(room.matchedKeywords)}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-cyan-300 px-3 py-1 text-sm font-black text-slate-950">
                    {playersText(room)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

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
