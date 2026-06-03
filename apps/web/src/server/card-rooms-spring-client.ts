import type {
  CardRoomListResponse,
  CardRoomResponse,
  CardRoomParticipantResponse,
  CardRoomMessagesResponse,
  CardRoomResultResponse,
  CreateCardRoomBody,
  JoinCardRoomBody,
  UpdateCardRoomParticipantBody,
  CreateCardRoomMessageBody,
  SubmitCardRoomResultBody,
} from "@yeon/api-contract/card-rooms";
import {
  createYeonHeaders,
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "./spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function tryParseJson(raw: string) {
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function extractMessage(parsed: unknown) {
  return typeof parsed === "object" && parsed !== null
    ? ((parsed as { message?: string }).message ??
        (parsed as { error?: string }).error)
    : null;
}

export class CardRoomsSpringBackendHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "CardRoomsSpringBackendHttpError";
  }
}

type SpringInit = YeonRequestInit & {
  userId?: string | null;
  guestId?: string | null;
  participantId?: string | null;
};

async function fetchSpring<T>(
  path: string,
  init: SpringInit,
  fallback: string
): Promise<T> {
  const headers = createYeonHeaders(init.headers);
  headers.set("accept", "application/json");
  if (init.userId) headers.set("X-Yeon-User-Id", init.userId);
  if (init.guestId) headers.set("X-Yeon-Guest-Id", init.guestId);
  if (init.participantId)
    headers.set("X-Yeon-Participant-Id", init.participantId);

  const response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(headers),
  });
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new CardRoomsSpringBackendHttpError(
      response.status,
      extractMessage(parsed) ?? fallback
    );
  }
  return parsed as T;
}

export function fetchCardRoomsFromSpring() {
  return fetchSpring<CardRoomListResponse>(
    "/api/v1/card-rooms",
    { method: "GET" },
    "카드방 목록을 불러오지 못했습니다."
  );
}

export function createCardRoomInSpring(params: {
  userId?: string | null;
  guestId?: string | null;
  payload: CreateCardRoomBody;
}) {
  return fetchSpring<CardRoomResponse>(
    "/api/v1/card-rooms",
    {
      method: "POST",
      userId: params.userId,
      guestId: params.guestId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "카드방을 만들지 못했습니다."
  );
}

export function fetchCardRoomFromSpring(roomId: string) {
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(roomId)}`,
    { method: "GET" },
    "카드방을 불러오지 못했습니다."
  );
}

export function joinCardRoomInSpring(params: {
  roomId: string;
  userId?: string | null;
  guestId?: string | null;
  payload: JoinCardRoomBody;
}) {
  return fetchSpring<CardRoomParticipantResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(params.roomId)}/participants`,
    {
      method: "POST",
      userId: params.userId,
      guestId: params.guestId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "카드방에 입장하지 못했습니다."
  );
}

export function updateCardRoomParticipantInSpring(params: {
  roomId: string;
  participantId: string;
  userId?: string | null;
  guestId?: string | null;
  payload: UpdateCardRoomParticipantBody;
}) {
  // finding 165(IDOR): Spring이 호출자 소유권을 검증할 수 있도록 userId/guestId를 함께 전달한다.
  return fetchSpring<CardRoomParticipantResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(params.roomId)}/participants/${encodeURIComponent(params.participantId)}`,
    {
      method: "PATCH",
      userId: params.userId,
      guestId: params.guestId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "참가자 상태를 저장하지 못했습니다."
  );
}

export function leaveCardRoomInSpring(params: {
  roomId: string;
  participantId: string;
  userId?: string | null;
  guestId?: string | null;
}) {
  // finding 165(IDOR): 퇴장도 본인 participant만 가능해야 하므로 userId/guestId를 전달한다.
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(params.roomId)}/participants/${encodeURIComponent(params.participantId)}`,
    { method: "DELETE", userId: params.userId, guestId: params.guestId },
    "카드방에서 나가지 못했습니다."
  );
}

export function startCardRoomInSpring(roomId: string, participantId: string) {
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(roomId)}/start`,
    { method: "POST", participantId },
    "카드방 학습을 시작하지 못했습니다."
  );
}

export function endCardRoomInSpring(roomId: string, participantId: string) {
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(roomId)}/end`,
    { method: "POST", participantId },
    "카드방을 종료하지 못했습니다."
  );
}

export function createCardRoomMessageInSpring(params: {
  roomId: string;
  participantId: string;
  payload: CreateCardRoomMessageBody;
}) {
  return fetchSpring<CardRoomMessagesResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(params.roomId)}/messages`,
    {
      method: "POST",
      participantId: params.participantId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "메시지를 보내지 못했습니다."
  );
}

export function submitCardRoomResultInSpring(params: {
  roomId: string;
  participantId: string;
  payload: SubmitCardRoomResultBody;
}) {
  return fetchSpring<CardRoomResultResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(params.roomId)}/results`,
    {
      method: "POST",
      participantId: params.participantId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "카드 결과를 저장하지 못했습니다."
  );
}

export function revealCardRoomInSpring(roomId: string, participantId: string) {
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(roomId)}/reveal`,
    { method: "POST", participantId },
    "정답을 공개하지 못했습니다."
  );
}

export function nextCardRoomCardInSpring(
  roomId: string,
  participantId: string
) {
  return fetchSpring<CardRoomResponse>(
    `/api/v1/card-rooms/${encodeURIComponent(roomId)}/next`,
    { method: "POST", participantId },
    "다음 카드로 이동하지 못했습니다."
  );
}
