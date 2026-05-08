const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class CloudOAuthSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CloudOAuthSpringBackendHttpError";
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

function buildHeaders(userId?: string, includeJson = false) {
  return {
    accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(userId ? { "X-Yeon-User-Id": userId } : {}),
    ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
      ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
      : {}),
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new CloudOAuthSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed as T;
}

export async function fetchGoogleDriveOAuthUrlFromSpring(state: string) {
  const url = new URL(`${resolveSpringBackendBaseUrl()}/googledrive/oauth-url`);
  url.searchParams.set("state", state);
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(),
  });
  return readJsonResponse<{ url: string }>(response);
}

export async function exchangeGoogleDriveOAuthCodeInSpring(params: { userId: string; code: string }) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}/googledrive/oauth-callback`, {
    method: "POST",
    cache: "no-store",
    headers: buildHeaders(params.userId, true),
    body: JSON.stringify({ code: params.code }),
  });
  if (!response.ok) {
    const raw = await response.text();
    const parsed = tryParseJson(raw);
    throw new CloudOAuthSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }
}

export async function fetchOneDriveOAuthUrlFromSpring(state: string) {
  const url = new URL(`${resolveSpringBackendBaseUrl()}/onedrive/oauth-url`);
  url.searchParams.set("state", state);
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(),
  });
  return readJsonResponse<{ url: string }>(response);
}

export async function exchangeOneDriveOAuthCodeInSpring(params: { userId: string; code: string }) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}/onedrive/oauth-callback`, {
    method: "POST",
    cache: "no-store",
    headers: buildHeaders(params.userId, true),
    body: JSON.stringify({ code: params.code }),
  });
  if (!response.ok) {
    const raw = await response.text();
    const parsed = tryParseJson(raw);
    throw new CloudOAuthSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }
}
