const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class PublicCheckRuntimeSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PublicCheckRuntimeSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try { return JSON.parse(raw); } catch { return null; }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
  if ("error" in parsed && parsed.error && typeof parsed.error === "object" && "message" in parsed.error && typeof parsed.error.message === "string") {
    return parsed.error.message;
  }
  return null;
}

async function fetchJson(path: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
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
    throw new PublicCheckRuntimeSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }
  return parsed;
}

export async function fetchPublicCheckSessionFromSpring(params: {
  token: string;
  entry: string | null;
  remembered: Array<{ spaceId: string; memberId: string }>;
}) {
  const search = new URLSearchParams();
  if (params.entry) search.set("entry", params.entry);
  for (const item of params.remembered) {
    search.append("remembered", `${item.spaceId}:${item.memberId}`);
  }
  return fetchJson(`/public-check-sessions/${params.token}${search.size > 0 ? `?${search.toString()}` : ""}`) as Promise<{
    spaceId: string;
    session: unknown;
    shouldClearRememberedIdentity: boolean;
  }>;
}

export async function verifyPublicCheckIdentityInSpring(token: string, body: { name: string; phoneLast4: string; }) {
  return fetchJson(`/public-check-sessions/${token}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ spaceId: string; result: unknown; rememberedMemberId: string | null }>;
}

export async function submitPublicCheckInSpring(token: string, body: {
  method: string;
  name?: string | null;
  phoneLast4?: string | null;
  assignmentStatus?: string;
  assignmentLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  remembered?: string[];
}) {
  return fetchJson(`/public-check-sessions/${token}/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ spaceId: string; result: unknown; rememberedMemberId: string | null; shouldClearRememberedIdentity: boolean }>;
}
