import {
  createYeonUrl,
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
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

export class ChatServiceChatRoomsSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceChatRoomsSpringBackendHttpError";
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
      headers: {
        accept: "application/json",
        ...(init.headers ?? {}),
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? {
              [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim(),
            }
          : {}),
      },
    }
  );
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceChatRoomsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? fallback
    );
  }
  return parsed;
}

export async function fetchChatServiceRoomsFromSpring(
  currentProfileId: string
) {
  return fetchSpring(
    "/chat-service/chat/rooms",
    {
      method: "GET",
      headers: { [CHAT_PROFILE_HEADER]: currentProfileId },
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ rooms: unknown[] }>;
}

export async function fetchChatServiceRoomFromSpring(params: {
  currentProfileId: string;
  roomId: string;
}) {
  return fetchSpring(
    `/chat-service/chat/rooms/${params.roomId}`,
    {
      method: "GET",
      headers: { [CHAT_PROFILE_HEADER]: params.currentProfileId },
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ room: unknown; messages: unknown[] }>;
}

export async function sendChatServiceMessageInSpring(params: {
  currentProfileId: string;
  roomId: string;
  body: string;
}) {
  return fetchSpring(
    `/chat-service/chat/rooms/${params.roomId}/messages`,
    {
      method: "POST",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({ body: params.body }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ message: unknown }>;
}
