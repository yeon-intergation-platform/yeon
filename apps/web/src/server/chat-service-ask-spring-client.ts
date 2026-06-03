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

export class ChatServiceAskSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceAskSpringBackendHttpError";
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
    throw new ChatServiceAskSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? fallback
    );
  }
  return parsed;
}

export async function fetchChatServiceAskPostsFromSpring(
  currentProfileId: string
) {
  return fetchSpring(
    "/chat-service/ask",
    { method: "GET", headers: { [CHAT_PROFILE_HEADER]: currentProfileId } },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ posts: unknown[] }>;
}
export async function createChatServiceAskPostInSpring(params: {
  currentProfileId: string;
  question: string;
  kind: string;
  options?: Array<{ label: string }>;
}) {
  return fetchSpring(
    "/chat-service/ask",
    {
      method: "POST",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: params.question,
        kind: params.kind,
        options: params.options,
      }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ post: unknown }>;
}
export async function voteChatServiceAskPostInSpring(params: {
  currentProfileId: string;
  postId: string;
  optionIndex: number;
}) {
  return fetchSpring(
    `/chat-service/ask/${params.postId}/vote`,
    {
      method: "POST",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({ optionIndex: params.optionIndex }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ post: unknown }>;
}
