const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";
const CHAT_PROFILE_HEADER = "X-Yeon-Chat-Profile-Id";

function resolveSpringBackendBaseUrl() {
  const raw = process.env.SPRING_BACKEND_BASE_URL?.trim() ?? process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class ChatServiceBlockSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceBlockSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try { return JSON.parse(raw); } catch { return null; }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
  if ("error" in parsed && parsed.error && typeof parsed.error === "object" && "message" in parsed.error && typeof parsed.error.message === "string") return parsed.error.message;
  return null;
}

async function send(params: { currentProfileId: string; targetProfileId: string; method: "POST" | "DELETE" }) {
  const url = new URL(`${resolveSpringBackendBaseUrl()}/chat-service/profiles/${params.targetProfileId}/block`);
  const response = await fetch(url, {
    method: params.method,
    cache: "no-store",
    headers: {
      accept: "application/json",
      [CHAT_PROFILE_HEADER]: params.currentProfileId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim() ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() } : {}),
    },
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new ChatServiceBlockSpringBackendHttpError(response.status, extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.");
  }
  return parsed as { blockedProfiles: unknown[] };
}

export function blockChatServiceProfileInSpring(currentProfileId: string, targetProfileId: string) {
  return send({ currentProfileId, targetProfileId, method: "POST" });
}

export function unblockChatServiceProfileInSpring(currentProfileId: string, targetProfileId: string) {
  return send({ currentProfileId, targetProfileId, method: "DELETE" });
}
