import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

type TodaySpringEnvironment = Readonly<Record<string, string | undefined>>;

export function resolveTodaySpringBackendBaseUrl(
  environment: TodaySpringEnvironment = process.env
) {
  const raw = [
    environment.SPRING_BACKEND_BASE_URL,
    environment.SPRING_BOOTSTRAP_BASE_URL,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value));

  return raw ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
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
  init?: RequestInit,
  options: { timeoutMs?: number } = {}
) {
  const controller = new AbortController();
  const timeoutMs = Math.max(
    1,
    options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
  );
  let timedOut = false;
  const abortFromCaller = () => controller.abort(init?.signal?.reason);
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error("Today Spring 요청 시간이 초과되었습니다."));
  }, timeoutMs);

  if (init?.signal?.aborted) abortFromCaller();
  else init?.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(
      `${resolveTodaySpringBackendBaseUrl()}${path}`,
      {
        ...init,
        cache: "no-store",
        headers: buildSpringBffHeaders(init?.headers, { userId }),
        signal: controller.signal,
      }
    );
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
  } catch (error) {
    if (timedOut) {
      throw new TodaySpringBackendHttpError(
        504,
        "Today 서버 응답 시간이 초과되었습니다.",
        "TODAY_BACKEND_TIMEOUT"
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    init?.signal?.removeEventListener("abort", abortFromCaller);
  }
}
