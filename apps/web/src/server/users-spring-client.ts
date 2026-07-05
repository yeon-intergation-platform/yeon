import {
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  createUserResponseSchema,
  deleteUserResponseSchema,
  invalidateUserSessionsResponseSchema,
  listUsersResponseSchema,
  updateUserResponseSchema,
  type UpdateUserBody,
  type UpdateUserRoleBody,
} from "@yeon/api-contract/users";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class UsersSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UsersSpringBackendHttpError";
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

async function fetchJson(path: string, userId: string, init?: YeonRequestInit) {
  const response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new UsersSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }

  return parsed;
}

export async function fetchUsersFromSpring(userId: string) {
  return listUsersResponseSchema.parse(await fetchJson("/users", userId));
}

export async function createUserInSpring(
  userId: string,
  body: { email: string; displayName?: string }
) {
  return createUserResponseSchema.parse(
    await fetchJson("/users", userId, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function updateUserInSpring(
  userId: string,
  targetUserId: string,
  body: UpdateUserBody
) {
  return updateUserResponseSchema.parse(
    await fetchJson(`/users/${encodeURIComponent(targetUserId)}`, userId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function updateUserRoleInSpring(
  userId: string,
  targetUserId: string,
  body: UpdateUserRoleBody
) {
  return updateUserResponseSchema.parse(
    await fetchJson(`/users/${encodeURIComponent(targetUserId)}/role`, userId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function invalidateUserSessionsInSpring(
  userId: string,
  targetUserId: string
) {
  return invalidateUserSessionsResponseSchema.parse(
    await fetchJson(
      `/users/${encodeURIComponent(targetUserId)}/sessions/invalidate`,
      userId,
      {
        method: "POST",
      }
    )
  );
}

export async function deleteUserInSpring(userId: string, targetUserId: string) {
  return deleteUserResponseSchema.parse(
    await fetchJson(`/users/${encodeURIComponent(targetUserId)}`, userId, {
      method: "DELETE",
    })
  );
}

export async function withdrawCurrentUserInSpring(userId: string) {
  return deleteUserResponseSchema.parse(
    await fetchJson("/users/me", userId, {
      method: "DELETE",
    })
  );
}
