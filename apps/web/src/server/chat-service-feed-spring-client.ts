import {
  createYeonUrl,
  fetchYeon,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const CHAT_PROFILE_HEADER = "X-Yeon-Chat-Profile-Id";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class ChatServiceFeedSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceFeedSpringBackendHttpError";
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
function withOptionalProfileHeader(currentProfileId?: string | null) {
  const headers: Record<string, string> = {};
  if (currentProfileId) {
    headers[CHAT_PROFILE_HEADER] = currentProfileId;
  }
  return headers;
}

async function fetchSpring(
  path: string,
  init: YeonRequestInit,
  fallback: string
) {
  let response: YeonResponse;

  try {
    response = await fetchYeon(
      createYeonUrl(`${resolveSpringBackendBaseUrl()}${path}`),
      {
        cache: "no-store",
        ...init,
        headers: buildSpringBffHeaders(init.headers),
      }
    );
  } catch {
    throw new ChatServiceFeedSpringBackendHttpError(
      503,
      "Spring backend와 연결할 수 없습니다."
    );
  }
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceFeedSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? fallback
    );
  }
  return parsed;
}

export async function fetchChatServiceFeedFromSpring(
  currentProfileId?: string | null
) {
  return fetchSpring(
    "/chat-service/feed",
    { method: "GET", headers: withOptionalProfileHeader(currentProfileId) },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ posts: unknown[] }>;
}
export async function fetchChatServiceFeedPostFromSpring(params: {
  currentProfileId?: string | null;
  postId: string;
}) {
  return fetchSpring(
    `/chat-service/feed/${params.postId}`,
    {
      method: "GET",
      headers: withOptionalProfileHeader(params.currentProfileId),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ post: unknown }>;
}

export async function createChatServiceFeedPostInSpring(params: {
  currentProfileId: string;
  body: string;
  replyToPostId?: string;
}) {
  const path = params.replyToPostId
    ? `/chat-service/feed/${params.replyToPostId}/replies`
    : "/chat-service/feed";
  return fetchSpring(
    path,
    {
      method: "POST",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({ body: params.body }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ post: unknown }>;
}

export async function updateChatServiceFeedPostInSpring(params: {
  currentProfileId: string;
  postId: string;
  body: string;
}) {
  return fetchSpring(
    `/chat-service/feed/${params.postId}`,
    {
      method: "PATCH",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({ body: params.body }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ post: unknown }>;
}

export async function deleteChatServiceFeedPostInSpring(params: {
  currentProfileId: string;
  postId: string;
}) {
  return fetchSpring(
    `/chat-service/feed/${params.postId}`,
    {
      method: "DELETE",
      headers: { [CHAT_PROFILE_HEADER]: params.currentProfileId },
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ deleted: true; postId: string }>;
}

export async function fetchChatServiceFeedRepliesFromSpring(params: {
  currentProfileId?: string | null;
  postId: string;
}) {
  return fetchSpring(
    `/chat-service/feed/${params.postId}/replies`,
    {
      method: "GET",
      headers: withOptionalProfileHeader(params.currentProfileId),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ replies: unknown[] }>;
}
