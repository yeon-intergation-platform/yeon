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

export class ChatServiceMyProfileSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceMyProfileSpringBackendHttpError";
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
    throw new ChatServiceMyProfileSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? fallback
    );
  }
  return parsed;
}

export async function fetchMyChatServiceProfileFromSpring(
  currentProfileId: string
) {
  return fetchSpring(
    "/chat-service/profile/me",
    { method: "GET", headers: { [CHAT_PROFILE_HEADER]: currentProfileId } },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{
    profile: unknown;
    blockedProfiles: unknown[];
    reports: unknown[];
  }>;
}
export async function updateMyChatServiceProfileInSpring(params: {
  currentProfileId: string;
  nickname: string;
  ageLabel: string;
  regionLabel: string;
  bio: string;
  notificationsEnabled: boolean;
}) {
  return fetchSpring(
    "/chat-service/profile/me",
    {
      method: "PATCH",
      headers: {
        [CHAT_PROFILE_HEADER]: params.currentProfileId,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nickname: params.nickname,
        ageLabel: params.ageLabel,
        regionLabel: params.regionLabel,
        bio: params.bio,
        notificationsEnabled: params.notificationsEnabled,
      }),
    },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ profile: unknown }>;
}
export async function deleteMyChatServiceProfileInSpring(
  currentProfileId: string
) {
  return fetchSpring(
    "/chat-service/profile/me",
    { method: "DELETE", headers: { [CHAT_PROFILE_HEADER]: currentProfileId } },
    "Spring backend 요청에 실패했습니다."
  ) as Promise<{ deleted: boolean }>;
}
