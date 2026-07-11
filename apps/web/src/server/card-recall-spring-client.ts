import type {
  CreateCardDeckAiPreviewBody,
  CreateCardDeckWithItemsBody,
  CreateRecallAttemptBody,
} from "@yeon/api-contract/recall";
import {
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "./spring-bff-client";
import { extractSpringErrorCode } from "./spring-error";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const FALLBACK_ERROR_MESSAGE = "백지 학습 요청에 실패했습니다.";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

function parseJson(raw: string): unknown {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function extractMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as { message?: unknown; error?: { message?: unknown } };
  if (typeof payload.message === "string") return payload.message;
  return typeof payload.error?.message === "string"
    ? payload.error.message
    : null;
}

export class CardRecallSpringBackendHttpError extends Error {
  readonly code?: string;

  constructor(
    readonly status: number,
    message: string,
    code?: string
  ) {
    super(message);
    this.name = "CardRecallSpringBackendHttpError";
    this.code = code;
  }
}

async function fetchSpring(
  path: string,
  userId: string,
  init?: YeonRequestInit
): Promise<unknown> {
  const response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });
  const payload = parseJson(await response.text());
  if (!response.ok) {
    throw new CardRecallSpringBackendHttpError(
      response.status,
      extractMessage(payload) ?? FALLBACK_ERROR_MESSAGE,
      extractSpringErrorCode(payload)
    );
  }
  return payload;
}

function jsonPost(body: unknown): YeonRequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function createRecallAttemptInSpring(
  userId: string,
  deckId: string,
  itemId: string,
  body: CreateRecallAttemptBody
) {
  return fetchSpring(
    `/card-decks/${encodeURIComponent(deckId)}/items/${encodeURIComponent(itemId)}/recall-attempts`,
    userId,
    jsonPost(body)
  );
}

export function fetchRecallAttemptsFromSpring(
  userId: string,
  deckId: string,
  limit: number
) {
  const search = new URLSearchParams({ limit: String(limit) });
  return fetchSpring(
    `/card-decks/${encodeURIComponent(deckId)}/recall-attempts?${search.toString()}`,
    userId
  );
}

export function createCardDeckAiPreviewInSpring(
  userId: string,
  body: CreateCardDeckAiPreviewBody
) {
  return fetchSpring("/card-decks/ai-previews", userId, jsonPost(body));
}

export function createCardDeckWithItemsInSpring(
  userId: string,
  body: CreateCardDeckWithItemsBody
) {
  return fetchSpring("/card-decks/bulk", userId, jsonPost(body));
}
