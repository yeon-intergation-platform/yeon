import { createYeonUrl, fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
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

export class ChatServiceFriendsOverviewSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceFriendsOverviewSpringBackendHttpError";
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

export async function fetchChatServiceFriendsOverviewFromSpring(
  currentProfileId: string
) {
  const url = createYeonUrl(
    `${resolveSpringBackendBaseUrl()}/chat-service/friends/overview`
  );
  const response = await fetchYeon(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      accept: "application/json",
      [CHAT_PROFILE_HEADER]: currentProfileId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
    },
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceFriendsOverviewSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }
  return parsed as {
    friends: unknown[];
    pendingSent: unknown[];
    pendingReceived: unknown[];
    suggested: unknown[];
    blocked: unknown[];
  };
}
