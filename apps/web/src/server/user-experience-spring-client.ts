import {
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  adminUserCardDecksResponseSchema,
  adminUserListResponseSchema,
  experienceHistoryResponseSchema,
  userExperienceViewSchema,
} from "@yeon/api-contract/user-experience";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

export function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class UserExperienceSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UserExperienceSpringBackendHttpError";
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
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
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

// X-Yeon-User-Id는 호출자가 서버 세션에서 검증한 값만 넘긴다(IDOR 방지). 여기서 직접 신뢰하지 않는다.
async function fetchJson(path: string, userId: string, init?: YeonRequestInit) {
  const response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new UserExperienceSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }

  return parsed;
}

export async function getUserExperience(userId: string) {
  return userExperienceViewSchema.parse(
    await fetchJson("/api/v1/user-experience", userId)
  );
}

export async function getExperienceHistory(userId: string, limit?: number) {
  const query =
    limit && Number.isFinite(limit) && limit > 0
      ? `?limit=${Math.trunc(limit)}`
      : "";

  return experienceHistoryResponseSchema.parse(
    await fetchJson(`/api/v1/user-experience/history${query}`, userId)
  );
}

export async function adminListUsers(adminUserId: string) {
  return adminUserListResponseSchema.parse(
    await fetchJson("/api/v1/admin/users", adminUserId)
  );
}

export async function adminListUserCardDecks(
  adminUserId: string,
  targetUserId: string
) {
  return adminUserCardDecksResponseSchema.parse(
    await fetchJson(
      `/api/v1/admin/users/${encodeURIComponent(targetUserId)}/card-decks`,
      adminUserId
    )
  );
}
