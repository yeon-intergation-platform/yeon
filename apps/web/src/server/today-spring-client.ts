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

export class TodaySpringBackendHttpError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "TodaySpringBackendHttpError";
    this.status = status;
    this.code = code;
  }
}

function parseJson(raw: string) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readError(payload: unknown) {
  if (!payload || typeof payload !== "object") return {};
  return {
    code:
      "code" in payload && typeof payload.code === "string"
        ? payload.code
        : undefined,
    message:
      "message" in payload && typeof payload.message === "string"
        ? payload.message
        : undefined,
  };
}

export async function requestTodaySpring(
  userId: string,
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });
  const raw = await response.text();
  const payload = parseJson(raw);

  if (!response.ok) {
    const error = readError(payload);
    throw new TodaySpringBackendHttpError(
      response.status,
      error.message ?? "Today 서버 요청을 처리하지 못했습니다.",
      error.code
    );
  }

  return { status: response.status, payload };
}
