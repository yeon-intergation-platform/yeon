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

export class LifeOsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LifeOsSpringBackendHttpError";
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
  ) {
    return parsed.error.message;
  }
  return null;
}

async function fetchJson(path: string, userId: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new LifeOsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }
  return parsed;
}

export async function fetchLifeOsDaysFromSpring(userId: string) {
  return fetchJson("/life-os/days", userId) as Promise<{ days: unknown[] }>;
}

export async function fetchLifeOsDayFromSpring(
  userId: string,
  localDate: string
) {
  return fetchJson(
    `/life-os/days/${encodeURIComponent(localDate)}`,
    userId
  ) as Promise<{ day: unknown }>;
}

export async function createLifeOsDayInSpring(userId: string, body: unknown) {
  return fetchJson("/life-os/days", userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ day: unknown }>;
}

export async function updateLifeOsDayInSpring(
  userId: string,
  localDate: string,
  body: unknown
) {
  return fetchJson(`/life-os/days/${encodeURIComponent(localDate)}`, userId, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{ day: unknown }>;
}

export async function fetchLifeOsDailyReportFromSpring(
  userId: string,
  localDate: string
) {
  return fetchJson(
    `/life-os/reports/daily?localDate=${encodeURIComponent(localDate)}`,
    userId
  ) as Promise<{ report: unknown }>;
}

export async function fetchLifeOsWeeklyReportFromSpring(
  userId: string,
  periodStart: string,
  periodEnd: string
) {
  const query = new URLSearchParams({ periodStart, periodEnd });
  return fetchJson(
    `/life-os/reports/weekly?${query.toString()}`,
    userId
  ) as Promise<{ report: unknown }>;
}
