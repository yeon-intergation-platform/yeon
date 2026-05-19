import type {
  CreateStarLobbyAlertRuleBody,
  StarLobbyAlertRuleListResponse,
  StarLobbyAlertRuleMutationResponse,
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
