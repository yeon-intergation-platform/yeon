import {
  type CardRoomListResponse,
  type CardRoomParticipantResponse,
  type CardRoomResponse,
  type CreateCardRoomBody,
  type JoinCardRoomBody,
  cardRoomListResponseSchema,
  cardRoomParticipantResponseSchema,
  cardRoomResponseSchema,
} from "@yeon/api-contract/card-rooms";
import { getMobileApiBaseUrl } from "../api-base-url";

// 카드방은 게스트 ID + 프로필로 식별(토큰 인증 불필요). 웹과 동일한 Next BFF 라우트를 사용.
export class CardRoomApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "CardRoomApiError";
  }
}

async function cardRoomFetch<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
  schema: { parse: (value: unknown) => T }
): Promise<T> {
  const response = await fetch(`${getMobileApiBaseUrl()}${path}`, init);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = fallbackMessage;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message && !/spring|backend/i.test(parsed.message)) {
        message = parsed.message;
      }
    } catch {
      // 본문 파싱 실패는 fallback 사용.
    }
    throw new CardRoomApiError(response.status, message);
  }

  return schema.parse(await response.json());
}

function guestHeaders(guestId: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "X-Yeon-Guest-Id": guestId,
  };
}

export const cardRoomApi = {
  listRooms(): Promise<CardRoomListResponse> {
    return cardRoomFetch(
      "/api/v1/card-rooms",
      { method: "GET" },
      "카드방 목록을 불러오지 못했습니다.",
      cardRoomListResponseSchema
    );
  },

  createRoom(
    body: CreateCardRoomBody,
    guestId: string
  ): Promise<CardRoomResponse> {
    return cardRoomFetch(
      "/api/v1/card-rooms",
      {
        method: "POST",
        headers: guestHeaders(guestId),
        body: JSON.stringify(body),
      },
      "카드방을 만들지 못했습니다.",
      cardRoomResponseSchema
    );
  },

  joinRoom(
    roomId: string,
    body: JoinCardRoomBody,
    guestId: string
  ): Promise<CardRoomParticipantResponse> {
    return cardRoomFetch(
      `/api/v1/card-rooms/${encodeURIComponent(roomId)}/participants`,
      {
        method: "POST",
        headers: guestHeaders(guestId),
        body: JSON.stringify(body),
      },
      "카드방에 입장하지 못했습니다.",
      cardRoomParticipantResponseSchema
    );
  },
};
