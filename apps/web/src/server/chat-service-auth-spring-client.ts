import {
  createYeonUrl,
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const CHAT_SESSION_TOKEN_HEADER = "X-Yeon-Chat-Session-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class ChatServiceAuthSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceAuthSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string") {
    return parsed.message;
  }
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }
  return null;
}

async function fetchSpring(
  path: string,
  init: YeonRequestInit,
  fallback: string
) {
  const response = await fetchYeon(
    createYeonUrl(`${resolveSpringBackendBaseUrl()}${path}`),
    {
      cache: "no-store",
      ...init,
      headers: buildSpringBffHeaders(init.headers),
    }
  );
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceAuthSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? fallback
    );
  }
  return parsed;
}

export async function resolveChatServiceGuestProfileInSpring(params: {
  guestNickname: string;
  guestPassword: string;
}) {
  return fetchSpring(
    "/chat-service/auth/guest-profile",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ id: string }>;
}

export async function requestChatServiceOtpInSpring(params: {
  phoneNumber: string;
}) {
  return fetchSpring(
    "/chat-service/auth/request-otp",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params),
    },
    "Spring backend 요청에 실패했습니다."
  );
}

export async function verifyChatServiceOtpInSpring(params: {
  challengeId: string;
  phoneNumber: string;
  code: string;
}) {
  return fetchSpring(
    "/chat-service/auth/verify-otp",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params),
    },
    "Spring backend 요청에 실패했습니다."
  );
}

export async function fetchChatServiceSessionFromSpring(
  sessionToken: string | null
) {
  return fetchSpring(
    "/chat-service/auth/session",
    {
      method: "GET",
      headers: sessionToken
        ? { [CHAT_SESSION_TOKEN_HEADER]: sessionToken }
        : {},
    },
    "Spring backend 요청에 실패했습니다."
  );
}

export async function logoutChatServiceSessionInSpring(
  sessionToken: string | null
) {
  return fetchSpring(
    "/chat-service/auth/session",
    {
      method: "DELETE",
      headers: sessionToken
        ? { [CHAT_SESSION_TOKEN_HEADER]: sessionToken }
        : {},
    },
    "Spring backend 요청에 실패했습니다."
  );
}
