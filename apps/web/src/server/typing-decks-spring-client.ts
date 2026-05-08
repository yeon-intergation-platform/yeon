const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class TypingDecksSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TypingDecksSpringBackendHttpError";
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

async function fetchJson(
  path: string,
  init?: RequestInit & { userId?: string | null },
) {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json");
  if (init?.userId) {
    headers.set("X-Yeon-User-Id", init.userId);
  }
  if (process.env.SPRING_INTERNAL_TOKEN?.trim()) {
    headers.set(INTERNAL_TOKEN_HEADER, process.env.SPRING_INTERNAL_TOKEN.trim());
  }

  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new TypingDecksSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed;
}

export async function fetchTypingDecksFromSpring(params: {
  userId?: string | null;
  scope: string;
  languageTag?: string;
  adminMode?: boolean;
}) {
  const search = new URLSearchParams({ scope: params.scope });
  if (params.languageTag) {
    search.set("languageTag", params.languageTag);
  }
  if (params.adminMode) {
    search.set("admin", "true");
  }
  return fetchJson(`/typing-decks?${search.toString()}`, {
    method: "GET",
    userId: params.userId,
  }) as Promise<{ decks: unknown[] }>;
}

export async function createTypingDeckInSpring(
  userId: string | null,
  body: unknown,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks${search}`, {
    method: "POST",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchTypingDeckDetailFromSpring(params: {
  userId?: string | null;
  deckId: string;
  adminMode?: boolean;
}) {
  const search = params.adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${params.deckId}${search}`, {
    method: "GET",
    userId: params.userId,
  });
}

export async function updateTypingDeckInSpring(
  userId: string | null,
  deckId: string,
  body: unknown,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}${search}`, {
    method: "PATCH",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteTypingDeckInSpring(
  userId: string | null,
  deckId: string,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}${search}`, {
    method: "DELETE",
    userId,
  });
}

export async function createTypingDeckPassageInSpring(
  userId: string | null,
  deckId: string,
  body: unknown,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}/passages${search}`, {
    method: "POST",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createTypingDeckPassagesInSpring(
  userId: string | null,
  deckId: string,
  body: unknown,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}/passages/bulk${search}`, {
    method: "POST",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateTypingDeckPassageInSpring(
  userId: string | null,
  deckId: string,
  passageId: string,
  body: unknown,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}/passages/${passageId}${search}`, {
    method: "PATCH",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteTypingDeckPassageInSpring(
  userId: string | null,
  deckId: string,
  passageId: string,
  adminMode: boolean,
) {
  const search = adminMode ? "?admin=true" : "";
  return fetchJson(`/typing-decks/${deckId}/passages/${passageId}${search}`, {
    method: "DELETE",
    userId,
  });
}

export async function createTypingRaceSeedInSpring(
  userId: string | null,
  deckId: string,
  body: unknown,
) {
  return fetchJson(`/typing-decks/${deckId}/race-seed`, {
    method: "POST",
    userId,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
