const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export type SpringActivityLog = {
  id: string;
  memberId: string;
  spaceId: string;
  type: string;
  status: string | null;
  recordedAt: string;
  source: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export class ActivityLogsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ActivityLogsSpringBackendHttpError";
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
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
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

async function fetchJsonFromSpring(path: string, userId: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      accept: "application/json",
      "X-Yeon-User-Id": userId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
      ...(init?.headers ?? {}),
    },
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new ActivityLogsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed;
}

export async function fetchActivityLogsFromSpring(
  spaceId: string,
  memberId: string,
  userId: string,
  params: { type?: string | null; limit?: number },
): Promise<{ logs: SpringActivityLog[]; totalCount: number }> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  return fetchJsonFromSpring(
    `/spaces/${spaceId}/members/${memberId}/activity-logs${search.size > 0 ? `?${search.toString()}` : ""}`,
    userId,
  ) as Promise<{ logs: SpringActivityLog[]; totalCount: number }>;
}

export async function createActivityLogInSpring(
  spaceId: string,
  memberId: string,
  userId: string,
  body: { text: string; authorLabel?: string | null },
): Promise<{ log: SpringActivityLog }> {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members/${memberId}/activity-logs`, userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as Promise<{ log: SpringActivityLog }>;
}
