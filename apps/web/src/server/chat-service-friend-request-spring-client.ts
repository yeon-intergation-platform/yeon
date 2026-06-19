import { createYeonUrl, fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { extractSpringErrorCode } from "./spring-error";
const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";
const CHAT_PROFILE_HEADER = "X-Yeon-Chat-Profile-Id";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class ChatServiceFriendRequestSpringBackendHttpError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ChatServiceFriendRequestSpringBackendHttpError";
    this.status = status;
    this.code = code;
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
  if ("message" in parsed && typeof parsed.message === "string")
    return parsed.message;
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  )
    return parsed.error.message;
  return null;
}

export async function sendChatServiceFriendRequestInSpring(params: {
  currentProfileId: string;
  targetProfileId: string;
}) {
  const url = createYeonUrl(
    `${resolveSpringBackendBaseUrl()}/chat-service/friends/requests`
  );
  const response = await fetchYeon(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      [CHAT_PROFILE_HEADER]: params.currentProfileId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
    },
    body: JSON.stringify({ targetProfileId: params.targetProfileId }),
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceFriendRequestSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
      extractSpringErrorCode(parsed)
    );
  }
  return parsed as { ok: boolean };
}
