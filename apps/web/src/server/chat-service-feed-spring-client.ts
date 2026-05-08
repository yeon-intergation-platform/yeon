const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";
const CHAT_PROFILE_HEADER = "X-Yeon-Chat-Profile-Id";

function resolveSpringBackendBaseUrl() {
  const raw = process.env.SPRING_BACKEND_BASE_URL?.trim() ?? process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class ChatServiceFeedSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceFeedSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) { try { return JSON.parse(raw); } catch { return null; } }
function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
  if ("error" in parsed && parsed.error && typeof parsed.error === "object" && "message" in parsed.error && typeof parsed.error.message === "string") return parsed.error.message;
  return null;
}
async function fetchSpring(path: string, init: RequestInit, fallback: string) {
  const response = await fetch(new URL(`${resolveSpringBackendBaseUrl()}${path}`), {
    cache: "no-store",
    ...init,
    headers: {
      accept: "application/json",
      ...(init.headers ?? {}),
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim() ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() } : {}),
    },
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceFeedSpringBackendHttpError(response.status, extractErrorMessage(parsed) ?? fallback);
  }
  return parsed;
}

export async function fetchChatServiceFeedFromSpring(currentProfileId: string) {
  return fetchSpring("/chat-service/feed", { method: "GET", headers: { [CHAT_PROFILE_HEADER]: currentProfileId } }, "Spring backend 요청에 실패했습니다.") as Promise<{ posts: unknown[] }>;
}
export async function createChatServiceFeedPostInSpring(params: { currentProfileId: string; body: string; replyToPostId?: string; }) {
  const path = params.replyToPostId ? `/chat-service/feed/${params.replyToPostId}/replies` : "/chat-service/feed";
  return fetchSpring(path, { method: "POST", headers: { [CHAT_PROFILE_HEADER]: params.currentProfileId, "content-type": "application/json" }, body: JSON.stringify({ body: params.body }) }, "Spring backend 요청에 실패했습니다.") as Promise<{ post: unknown }>;
}
export async function fetchChatServiceFeedRepliesFromSpring(params: { currentProfileId: string; postId: string; }) {
  return fetchSpring(`/chat-service/feed/${params.postId}/replies`, { method: "GET", headers: { [CHAT_PROFILE_HEADER]: params.currentProfileId } }, "Spring backend 요청에 실패했습니다.") as Promise<{ replies: unknown[] }>;
}
