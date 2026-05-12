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
export class HomeInsightBannerSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HomeInsightBannerSpringBackendHttpError";
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
  )
    return parsed.error.message;
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
    throw new HomeInsightBannerSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }
  return parsed;
}
export async function fetchHomeInsightBannerStateFromSpring(userId: string) {
  return fetchJson("/home/insight-banners", userId) as Promise<{
    dismissals: Array<{ bannerKey: string; hiddenUntil: string | null }>;
  }>;
}
export async function dismissHomeInsightBannerInSpring(
  userId: string,
  body: { bannerKey: string }
) {
  return fetchJson("/home/insight-banners/dismiss", userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Promise<{
    dismissal: { bannerKey: string; hiddenUntil: string | null };
  }>;
}
