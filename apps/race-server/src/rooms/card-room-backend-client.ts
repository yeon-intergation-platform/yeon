import type { CardRoomDetailDto } from "@yeon/race-shared";

type CardRoomResponse = { room: CardRoomDetailDto };

type CardRoomBackendRequestInit = Omit<RequestInit, "headers"> & {
  headers?: RequestInit["headers"];
  participantId?: string;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

function backendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ||
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function springHeaders(participantId?: string) {
  const headers: Record<string, string> = { accept: "application/json" };
  const token = process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (token) headers["X-Yeon-Internal-Token"] = token;
  if (participantId) headers["X-Yeon-Participant-Id"] = participantId;
  return headers;
}

function mergeSpringHeaders(
  participantId?: string,
  headers?: RequestInit["headers"]
) {
  const merged = new Headers(springHeaders(participantId));
  if (headers) {
    new Headers(headers).forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
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
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(parsed?.message || "카드방 서버 요청에 실패했습니다.");
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
