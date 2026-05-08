const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class PublicCheckLocationsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PublicCheckLocationsSpringBackendHttpError";
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

export async function fetchPublicCheckLocationsFromSpring(params: {
  userId: string;
  spaceId: string;
  query: string;
}) {
  const url = new URL(
    `${resolveSpringBackendBaseUrl()}/spaces/${params.spaceId}/public-check-locations`,
  );
  url.searchParams.set("query", params.query);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "X-Yeon-User-Id": params.userId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
    },
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new PublicCheckLocationsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }
  return parsed as {
    results: Array<{
      id: string;
      label: string;
      placeName: string | null;
      roadAddressName: string | null;
      addressName: string | null;
      latitude: number;
      longitude: number;
      source: "keyword" | "address";
    }>;
  };
}
