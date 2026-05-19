import type {
  CreateStarLobbyAlertRuleBody,
  StarLobbyAlertRuleListResponse,
  StarLobbyAlertRuleMutationResponse,
  StarLobbyDiscordWebhookAdminStatusResponse,
  StarLobbyDiscordWebhookStatusResponse,
  StarLobbyDiscordWebhookTestResponse,
  StarLobbyRoomListResponse,
  UpdateStarLobbyAlertRuleBody,
  UpsertStarLobbyDiscordWebhookBody,
} from "@yeon/api-contract/star-lobby";

import { buildSpringBffHeaders } from "./spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const GUEST_SESSION_ID_HEADER = "X-Yeon-Guest-Session-Id";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function tryParseJson(raw: string) {
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function extractMessage(parsed: unknown) {
  return typeof parsed === "object" && parsed !== null
    ? ((parsed as { message?: string }).message ??
        (parsed as { error?: string }).error)
    : null;
}

export class StarLobbySpringBackendHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "StarLobbySpringBackendHttpError";
  }
}

type StarLobbySpringInit = RequestInit & {
  userId?: string | null;
  guestSessionId?: string | null;
};

async function fetchSpring<T>(
  path: string,
  init: StarLobbySpringInit,
  fallback: string
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.guestSessionId) {
    headers.set(GUEST_SESSION_ID_HEADER, init.guestSessionId);
  }

  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(headers, { userId: init.userId }),
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new StarLobbySpringBackendHttpError(
      response.status,
      extractMessage(parsed) ?? fallback
    );
  }

  return parsed as T;
}

export function fetchStarLobbyAlertRulesFromSpring(params: {
  userId?: string | null;
  guestSessionId?: string | null;
}) {
  return fetchSpring<StarLobbyAlertRuleListResponse>(
    "/api/v1/star-lobby/alert-rules",
    {
      method: "GET",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    },
    "스타 로비 알림 조건을 불러오지 못했습니다."
  );
}

export function createStarLobbyAlertRuleInSpring(params: {
  userId?: string | null;
  guestSessionId?: string | null;
  payload: CreateStarLobbyAlertRuleBody;
}) {
  return fetchSpring<StarLobbyAlertRuleMutationResponse>(
    "/api/v1/star-lobby/alert-rules",
    {
      method: "POST",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "스타 로비 알림 조건을 저장하지 못했습니다."
  );
}

export function fetchStarLobbyRoomsFromSpring() {
  return fetchSpring<StarLobbyRoomListResponse>(
    "/api/v1/star-lobby/rooms",
    { method: "GET" },
    "스타 로비 현재 방 목록을 불러오지 못했습니다."
  );
}

export function updateStarLobbyAlertRuleInSpring(params: {
  ruleId: string;
  userId?: string | null;
  guestSessionId?: string | null;
  payload: UpdateStarLobbyAlertRuleBody;
}) {
  return fetchSpring<StarLobbyAlertRuleMutationResponse>(
    `/api/v1/star-lobby/alert-rules/${encodeURIComponent(params.ruleId)}`,
    {
      method: "PATCH",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "스타 로비 알림 조건을 수정하지 못했습니다."
  );
}

export async function deleteStarLobbyAlertRuleInSpring(params: {
  ruleId: string;
  userId?: string | null;
  guestSessionId?: string | null;
}) {
  await fetchSpring<void>(
    `/api/v1/star-lobby/alert-rules/${encodeURIComponent(params.ruleId)}`,
    {
      method: "DELETE",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    },
    "스타 로비 알림 조건을 삭제하지 못했습니다."
  );
}

export function fetchStarLobbyDiscordWebhookStatusFromSpring(params: {
  userId?: string | null;
  guestSessionId?: string | null;
}) {
  return fetchSpring<StarLobbyDiscordWebhookStatusResponse>(
    "/api/v1/star-lobby/discord-webhook",
    {
      method: "GET",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    },
    "스타 로비 Discord 알림 상태를 불러오지 못했습니다."
  );
}

export function upsertStarLobbyDiscordWebhookInSpring(params: {
  userId?: string | null;
  guestSessionId?: string | null;
  payload: UpsertStarLobbyDiscordWebhookBody;
}) {
  return fetchSpring<StarLobbyDiscordWebhookStatusResponse>(
    "/api/v1/star-lobby/discord-webhook",
    {
      method: "PUT",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "스타 로비 Discord 알림을 연결하지 못했습니다."
  );
}

export function deleteStarLobbyDiscordWebhookInSpring(params: {
  userId?: string | null;
  guestSessionId?: string | null;
}) {
  return fetchSpring<StarLobbyDiscordWebhookStatusResponse>(
    "/api/v1/star-lobby/discord-webhook",
    {
      method: "DELETE",
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    },
    "스타 로비 Discord 알림 연결을 해제하지 못했습니다."
  );
}

export function fetchStarLobbyDiscordAdminStatusFromSpring() {
  return fetchSpring<StarLobbyDiscordWebhookAdminStatusResponse>(
    "/api/v1/star-lobby/admin/discord-status",
    { method: "GET" },
    "스타 로비 Discord 운영 상태를 불러오지 못했습니다."
  );
}

export function testStarLobbyDiscordWebhookInSpring(params: {
  payload: UpsertStarLobbyDiscordWebhookBody;
}) {
  return fetchSpring<StarLobbyDiscordWebhookTestResponse>(
    "/api/v1/star-lobby/admin/discord-test",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "스타 로비 Discord 테스트 알림을 보내지 못했습니다."
  );
}
