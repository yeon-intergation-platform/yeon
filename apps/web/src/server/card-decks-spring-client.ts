const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class CardDecksSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "CardDecksSpringBackendHttpError";
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

async function fetchJson(path: string, userId: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "X-Yeon-User-Id": userId,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim() ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new CardDecksSpringBackendHttpError(response.status, extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.");
  }
  return parsed;
}

export const fetchCardDecksFromSpring = (userId: string) =>
  fetchJson("/card-decks", userId) as Promise<{ decks: unknown[] }>;
export const createCardDeckInSpring = (userId: string, body: unknown) =>
  fetchJson("/card-decks", userId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const fetchCardDeckDetailFromSpring = (userId: string, deckId: string) =>
  fetchJson(`/card-decks/${deckId}`, userId);
export const updateCardDeckInSpring = (userId: string, deckId: string, body: unknown) =>
  fetchJson(`/card-decks/${deckId}`, userId, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const deleteCardDeckInSpring = (userId: string, deckId: string) =>
  fetchJson(`/card-decks/${deckId}`, userId, { method: "DELETE" });
export const createCardDeckItemInSpring = (userId: string, deckId: string, body: unknown) =>
  fetchJson(`/card-decks/${deckId}/items`, userId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const createCardDeckItemsInSpring = (userId: string, deckId: string, body: unknown) =>
  fetchJson(`/card-decks/${deckId}/items/bulk`, userId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const updateCardDeckItemInSpring = (userId: string, deckId: string, itemId: string, body: unknown) =>
  fetchJson(`/card-decks/${deckId}/items/${itemId}`, userId, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const deleteCardDeckItemInSpring = (userId: string, deckId: string, itemId: string) =>
  fetchJson(`/card-decks/${deckId}/items/${itemId}`, userId, { method: "DELETE" });
export const fetchCardStudyPreferenceFromSpring = (userId: string) =>
  fetchJson("/card-decks/study-preference", userId) as Promise<{ studyMode: string }>;
export const updateCardStudyPreferenceInSpring = (userId: string, body: unknown) =>
  fetchJson("/card-decks/study-preference", userId, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
export const reviewCardDeckItemInSpring = (userId: string, deckId: string, itemId: string, body: unknown) =>
  fetchJson(`/card-decks/${deckId}/items/${itemId}/review`, userId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
