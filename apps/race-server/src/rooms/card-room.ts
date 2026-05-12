import { type Client, Room } from "@colyseus/core";
import {
  CARD_ROOM_EVENTS,
  toCardRoomRealtimeState,
  type CardRoomChatMessage,
  type CardRoomReadyMessage,
  type CardRoomRealtimeJoinOptions,
  type CardRoomResultMessage,
  type CardRoomRoleMessage,
} from "@yeon/race-shared";
type CardRoomResponse = { room: import("@yeon/race-shared").CardRoomDetailDto };

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const MAX_CHAT_MESSAGE_LENGTH = 500;

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

async function readJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...springHeaders(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(parsed?.message || "카드방 서버 요청에 실패했습니다.");
  }
  return parsed as T;
}

export class CardRoom extends Room {
  private cardRoomId: string | null = null;
  private participants = new Map<string, string>();

  async onCreate(options: Partial<CardRoomRealtimeJoinOptions>) {
    const cardRoomId = options.cardRoomId;
    if (!cardRoomId) throw new Error("카드방 식별자가 필요합니다.");
    this.cardRoomId = cardRoomId;
    await this.refreshState();

    this.onMessage(
      CARD_ROOM_EVENTS.CHAT,
      async (client, payload: CardRoomChatMessage) => {
        await this.withParticipant(client, async (participantId) => {
          const content = payload.content
            ?.trim()
            .slice(0, MAX_CHAT_MESSAGE_LENGTH);
          if (!content) return;
          await this.spring(
            `/api/v1/card-rooms/${this.cardRoomId}/messages`,
            participantId,
            { method: "POST", body: JSON.stringify({ content }) }
          );
        });
      }
    );

    this.onMessage(
      CARD_ROOM_EVENTS.READY,
      async (client, payload: CardRoomReadyMessage) => {
        await this.patchParticipant(client, {
          isReady: Boolean(payload.isReady),
        });
      }
    );

    this.onMessage(
      CARD_ROOM_EVENTS.ROLE,
      async (client, payload: CardRoomRoleMessage) => {
        await this.patchParticipant(client, { role: payload.role });
      }
    );

    this.onMessage(CARD_ROOM_EVENTS.REVEAL, async (client) => {
      await this.withParticipant(client, async (participantId) => {
        await this.spring(
          `/api/v1/card-rooms/${this.cardRoomId}/reveal`,
          participantId,
          { method: "POST" }
        );
      });
    });

    this.onMessage(
      CARD_ROOM_EVENTS.RESULT,
      async (client, payload: CardRoomResultMessage) => {
        await this.withParticipant(client, async (participantId) => {
          await this.spring(
            `/api/v1/card-rooms/${this.cardRoomId}/results`,
            participantId,
            { method: "POST", body: JSON.stringify(payload) }
          );
        });
      }
    );

    this.onMessage(CARD_ROOM_EVENTS.NEXT, async (client) => {
      await this.withParticipant(client, async (participantId) => {
        await this.spring(
          `/api/v1/card-rooms/${this.cardRoomId}/next`,
          participantId,
          { method: "POST" }
        );
      });
    });
  }

  async onJoin(client: Client, options: Partial<CardRoomRealtimeJoinOptions>) {
    if (!options.participantId) throw new Error("참가자 식별자가 필요합니다.");
    this.participants.set(client.sessionId, options.participantId);
    await this.refreshState();
  }

  async onLeave(client: Client) {
    this.participants.delete(client.sessionId);
  }

  private async patchParticipant(client: Client, payload: object) {
    await this.withParticipant(client, async (participantId) => {
      await this.spring(
        `/api/v1/card-rooms/${this.cardRoomId}/participants/${participantId}`,
        participantId,
        { method: "PATCH", body: JSON.stringify(payload) }
      );
    });
  }

  private async withParticipant(
    client: Client,
    task: (participantId: string) => Promise<void>
  ) {
    const participantId = this.participants.get(client.sessionId);
    if (!participantId) {
      client.send(CARD_ROOM_EVENTS.ERROR, {
        message: "참가자 상태를 찾지 못했습니다.",
      });
      return;
    }
    try {
      await task(participantId);
      await this.refreshState();
    } catch (error) {
      client.send(CARD_ROOM_EVENTS.ERROR, {
        message:
          error instanceof Error
            ? error.message
            : "카드방 요청에 실패했습니다.",
      });
    }
  }

  private async spring(path: string, participantId: string, init: RequestInit) {
    return readJson<unknown>(path, {
      ...init,
      headers: {
        ...springHeaders(participantId),
        "content-type": "application/json",
      },
    });
  }

  private async refreshState() {
    if (!this.cardRoomId) return;
    const response = await readJson<CardRoomResponse>(
      `/api/v1/card-rooms/${this.cardRoomId}`
    );
    const state = toCardRoomRealtimeState(response.room);
    this.setState(state as never);
    this.broadcast(CARD_ROOM_EVENTS.STATE, state);
  }
}
