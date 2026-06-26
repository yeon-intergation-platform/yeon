import type { CardRoomDetailDto } from "@yeon/race-shared";
import { mergeSpringInternalHeaders } from "./spring-backend-headers";

type CardRoomResponse = { room: CardRoomDetailDto };
type CardRoomBackendErrorBody = {
  message?: unknown;
  code?: unknown;
  [key: string]: unknown;
};

type CardRoomBackendRequestInit = Omit<RequestInit, "headers"> & {
  headers?: RequestInit["headers"];
  participantId?: string;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

export class CardRoomBackendHttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: CardRoomBackendErrorBody;

  constructor({
    status,
    message,
    code,
    detail,
  }: {
    status: number;
    message: string;
    code?: string;
    detail?: CardRoomBackendErrorBody;
  }) {
    super(message);
    this.name = "CardRoomBackendHttpError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function backendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ||
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function mergeSpringHeaders(
  participantId?: string,
  headers?: RequestInit["headers"]
) {
  return mergeSpringInternalHeaders(
    { "X-Yeon-Participant-Id": participantId },
    headers
  );
}

function parseCardRoomBackendJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function normalizeCardRoomBackendErrorBody(
  parsed: unknown
): CardRoomBackendErrorBody | undefined {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }
  return parsed as CardRoomBackendErrorBody;
}

function getCardRoomBackendErrorMessage(
  errorBody: CardRoomBackendErrorBody | undefined
) {
  return typeof errorBody?.message === "string" && errorBody.message.trim()
    ? errorBody.message
    : "카드방 서버 요청에 실패했습니다.";
}

function getCardRoomBackendErrorCode(
  errorBody: CardRoomBackendErrorBody | undefined
) {
  return typeof errorBody?.code === "string" && errorBody.code.trim()
    ? errorBody.code
    : undefined;
}

async function readCardRoomBackendJson<T>(
  path: string,
  { headers, participantId, ...init }: CardRoomBackendRequestInit = {}
) {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: mergeSpringHeaders(participantId, headers),
  });
  const text = await response.text();
  const parsed = parseCardRoomBackendJson(text);
  if (!response.ok) {
    const errorBody = normalizeCardRoomBackendErrorBody(parsed);
    throw new CardRoomBackendHttpError({
      status: response.status,
      message: getCardRoomBackendErrorMessage(errorBody),
      code: getCardRoomBackendErrorCode(errorBody),
      detail: errorBody,
    });
  }
  return parsed as T;
}

export function requestCardRoomBackend(
  path: string,
  participantId: string,
  init: Omit<CardRoomBackendRequestInit, "participantId"> = {}
) {
  return readCardRoomBackendJson<unknown>(path, {
    ...init,
    participantId,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
}

export async function loadCardRoomDetail(cardRoomId: string) {
  const response = await readCardRoomBackendJson<CardRoomResponse>(
    `/api/v1/card-rooms/${cardRoomId}`
  );
  return response.room;
}
