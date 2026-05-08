const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class PublicCheckSessionsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PublicCheckSessionsSpringBackendHttpError";
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

export async function updatePublicCheckSessionInSpring(
  spaceId: string,
  sessionId: string,
  userId: string,
  body: { status?: string; closesAt?: string | null },
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/public-check-sessions/${sessionId}`,
    {
      cache: "no-store",
      method: "PATCH",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new PublicCheckSessionsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed;
}

export async function createPublicCheckSessionInSpring(
  spaceId: string,
  userId: string,
  body: {
    title: string;
    checkMode: string;
    enabledMethods: string[];
    opensAt?: string | null;
    closesAt?: string | null;
    locationLabel?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radiusMeters?: number | null;
  },
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/public-check-sessions`,
    {
      cache: "no-store",
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new PublicCheckSessionsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed;
}
