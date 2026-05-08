import type { CreateSpaceBody, UpdateSpaceBody } from "@yeon/api-contract/spaces";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class SpacesSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SpacesSpringBackendHttpError";
    this.status = status;
  }
}

type SpringSpace = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

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

async function fetchJson(path: string, userId: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "X-Yeon-User-Id": userId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new SpacesSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed;
}

export async function fetchSpacesFromSpring(userId: string) {
  return fetchJson("/spaces", userId) as Promise<{ spaces: SpringSpace[] }>;
}

export async function createSpaceInSpring(userId: string, body: CreateSpaceBody) {
  return fetchJson("/spaces", userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ space: SpringSpace }>;
}

export async function fetchSpaceFromSpring(userId: string, spaceId: string) {
  return fetchJson(`/spaces/${spaceId}`, userId) as Promise<{ space: SpringSpace }>;
}

export async function updateSpaceInSpring(
  userId: string,
  spaceId: string,
  body: UpdateSpaceBody,
) {
  return fetchJson(`/spaces/${spaceId}`, userId, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ space: SpringSpace }>;
}

export async function deleteSpaceInSpring(userId: string, spaceId: string) {
  return fetchJson(`/spaces/${spaceId}`, userId, {
    method: "DELETE",
  }) as Promise<{ ok: boolean }>;
}
