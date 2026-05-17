import { type Client, Room } from "@colyseus/core";
import {
  CARD_ROOM_EVENTS,
  VOICE_EVENTS,
  type VoiceAnswerMessage,
  type VoiceEndMessage,
  type VoiceIceCandidateLike,
  type VoiceIceCandidateMessage,
  type VoiceMuteToggleMessage,
  type VoiceOfferMessage,
  toCardRoomRealtimeState,
  type CardRoomChatMessage,
  type CardRoomReadyMessage,
  type CardRoomRealtimeJoinOptions,
  type CardRoomResultMessage,
  type CardRoomRoleMessage,
} from "@yeon/race-shared";

type CardRoomResponse = { room: import("@yeon/race-shared").CardRoomDetailDto };
type JsonObject = Record<string, unknown>;
type ClockTimer = { clear: () => void };
type VoiceSession = {
  participants: Set<string>;
  timeout: ClockTimer | null;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const MAX_CHAT_MESSAGE_LENGTH = 500;
const VOICE_SESSION_TIMEOUT_MS = 30_000;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseVoiceBase(
  payload: unknown
): Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId"> | null {
  const obj = payload as JsonObject | null;
  if (!obj) return null;
  if (
    !isNonEmptyString(obj.sessionId) ||
    !isNonEmptyString(obj.targetParticipantId)
  )
    return null;
  return {
    sessionId: obj.sessionId.trim(),
    targetParticipantId: obj.targetParticipantId.trim(),
  };
}

function parseVoiceOffer(
  payload: unknown
): Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId" | "sdp"> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;
  const obj = payload as JsonObject;
  if (typeof obj.sdp !== "string" || obj.sdp.trim().length === 0) return null;
  return {
    ...base,
    sdp: obj.sdp,
  };
}

function parseVoiceAnswer(
  payload: unknown
): Pick<
  VoiceAnswerMessage,
  "sessionId" | "targetParticipantId" | "sdp"
> | null {
  return parseVoiceOffer(payload);
}

function parseVoiceCandidate(
  payload: unknown
): Pick<
  VoiceIceCandidateMessage,
  "sessionId" | "targetParticipantId" | "candidate"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;

  const candidateObj = (payload as JsonObject | null)?.candidate;
  if (!candidateObj || typeof candidateObj !== "object") return null;
  if (!isNonEmptyString((candidateObj as JsonObject).candidate)) return null;

  return {
    ...base,
    candidate: {
      candidate: (candidateObj as JsonObject).candidate as string,
      sdpMid:
        typeof (candidateObj as JsonObject).sdpMid === "string"
          ? ((candidateObj as JsonObject).sdpMid as string)
          : null,
      sdpMLineIndex:
        typeof (candidateObj as JsonObject).sdpMLineIndex === "number"
          ? ((candidateObj as JsonObject).sdpMLineIndex as number)
          : null,
      usernameFragment:
        typeof (candidateObj as JsonObject).usernameFragment === "string"
          ? ((candidateObj as JsonObject).usernameFragment as string)
          : null,
    },
  };
}

function parseVoiceEnd(
  payload: unknown
): Pick<
  VoiceEndMessage,
  "sessionId" | "targetParticipantId" | "reason"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;

  const reason = (payload as JsonObject | null)?.reason;
  return {
    ...base,
    reason:
      reason === "hangup" ||
      reason === "timeout" ||
      reason === "rejected" ||
      reason === "error" ||
      reason === "network"
        ? reason
        : undefined,
  };
}

function parseVoiceMute(
  payload: unknown
): Pick<
  VoiceMuteToggleMessage,
  "sessionId" | "targetParticipantId" | "muted"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;
  const muted = (payload as JsonObject | null)?.muted;
  if (typeof muted !== "boolean") return null;
  return {
    ...base,
    muted,
  };
}

function isValidSessionId(sessionId: string | null | undefined) {
  return isNonEmptyString(sessionId);
}

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
  private readonly participantToVoiceSession = new Map<string, string>();
  private readonly voiceSessions = new Map<string, VoiceSession>();

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

    this.onMessage(CARD_ROOM_EVENTS.START, async (client) => {
      await this.withParticipant(client, async (participantId) => {
        await this.spring(
          `/api/v1/card-rooms/${this.cardRoomId}/start`,
          participantId,
          { method: "POST" }
        );
      });
    });

    this.onMessage(CARD_ROOM_EVENTS.END, async (client) => {
      await this.withParticipant(client, async (participantId) => {
        await this.spring(
          `/api/v1/card-rooms/${this.cardRoomId}/end`,
          participantId,
          { method: "POST" }
        );
      });
    });

    this.onMessage(CARD_ROOM_EVENTS.LEAVE, async (client) => {
      await this.leaveExplicitly(client);
    });

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

    this.onMessage(VOICE_EVENTS.OFFER, (client, payload) => {
      this.onVoiceOffer(client, parseVoiceOffer(payload));
    });
    this.onMessage(VOICE_EVENTS.ANSWER, (client, payload) => {
      this.onVoiceAnswer(client, parseVoiceAnswer(payload));
    });
    this.onMessage(VOICE_EVENTS.ICE_CANDIDATE, (client, payload) => {
      this.onVoiceIceCandidate(client, parseVoiceCandidate(payload));
    });
    this.onMessage(VOICE_EVENTS.END, (client, payload) => {
      this.onVoiceEnd(client, parseVoiceEnd(payload));
    });
    this.onMessage(VOICE_EVENTS.MUTE_TOGGLE, (client, payload) => {
      this.onVoiceMuteToggle(client, parseVoiceMute(payload));
    });
  }

  async onJoin(client: Client, options: Partial<CardRoomRealtimeJoinOptions>) {
    if (!options.participantId) throw new Error("참가자 식별자가 필요합니다.");
    this.participants.set(client.sessionId, options.participantId);
    await this.refreshState();
  }

  async onLeave(client: Client) {
    const participantId = this.participants.get(client.sessionId);
    this.participants.delete(client.sessionId);
    this.cleanupVoiceSessionByParticipant(participantId, "network");
    if (!participantId || !this.cardRoomId) return;

    if (this.participants.size === 0) {
      void this.setPrivate(true);
      void this.disconnect();
      return;
    }

    await this.refreshState();
  }

  private async leaveExplicitly(client: Client) {
    const participantId = this.participants.get(client.sessionId);
    this.participants.delete(client.sessionId);
    this.cleanupVoiceSessionByParticipant(participantId, "hangup");
    if (!participantId || !this.cardRoomId) return;

    try {
      await this.spring(
        `/api/v1/card-rooms/${this.cardRoomId}/participants/${participantId}`,
        participantId,
        { method: "DELETE" }
      );
      await client.leave();
      if (this.participants.size === 0) {
        void this.setPrivate(true);
        void this.disconnect();
        return;
      }
      await this.refreshState();
    } catch (error) {
      client.send(CARD_ROOM_EVENTS.ERROR, {
        message:
          error instanceof Error
            ? error.message
            : "카드방에서 나가지 못했습니다.",
      });
    }
  }

  private onVoiceOffer(
    client: Client,
    payload:
      | (Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId"> & {
          sdp: string;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) {
      this.sendVoiceError(client, {
        message: senderParticipantId
          ? "통화 요청 형식이 올바르지 않습니다."
          : "참가자 정보를 찾지 못했습니다.",
      });
      return;
    }

    if (senderParticipantId === payload.targetParticipantId) {
      this.sendVoiceError(client, {
        message: "통화 대상은 본인이 될 수 없습니다.",
      });
      return;
    }

    if (!this.isParticipantInRoom(payload.targetParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "상대를 찾을 수 없습니다.",
      });
      return;
    }

    if (this.participantToVoiceSession.has(senderParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "이미 통화 진행 중입니다.",
      });
      return;
    }

    const targetSession = this.participantToVoiceSession.get(
      payload.targetParticipantId
    );
    if (targetSession) {
      this.sendVoiceError(client, {
        sessionId: targetSession,
        targetParticipantId: payload.targetParticipantId,
        message: "상대가 통화 중입니다.",
      });
      return;
    }

    if (!isValidSessionId(payload.sessionId)) {
      this.sendVoiceError(client, {
        message: "통화 세션 정보가 유효하지 않습니다.",
      });
      return;
    }

    const existingSession = this.voiceSessions.get(payload.sessionId);
    if (existingSession && existingSession.participants.size > 0) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "동일한 통화 요청이 이미 진행 중입니다.",
      });
      return;
    }

    this.ensureVoiceSession(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    this.resetVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      payload.targetParticipantId,
      VOICE_EVENTS.OFFER,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId: payload.targetParticipantId,
        sdp: payload.sdp,
      }
    );
  }

  private onVoiceAnswer(
    client: Client,
    payload:
      | (Pick<VoiceAnswerMessage, "sessionId" | "targetParticipantId"> & {
          sdp: string;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) {
      this.sendVoiceError(client, {
        message: senderParticipantId
          ? "통화 응답 형식이 올바르지 않습니다."
          : "참가자 정보를 찾지 못했습니다.",
      });
      return;
    }

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "통화 세션이 유효하지 않습니다.",
      });
      return;
    }

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "통화 대상이 일치하지 않습니다.",
      });
      return;
    }

    this.clearVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.ANSWER,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        sdp: payload.sdp,
      }
    );
  }

  private onVoiceIceCandidate(
    client: Client,
    payload:
      | (Pick<VoiceIceCandidateMessage, "sessionId" | "targetParticipantId"> & {
          candidate: VoiceIceCandidateLike;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) return;

    this.resetVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.ICE_CANDIDATE,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        candidate: payload.candidate,
      }
    );
  }

  private onVoiceEnd(
    client: Client,
    payload:
      | (Pick<VoiceEndMessage, "sessionId" | "targetParticipantId"> & {
          reason?: VoiceEndMessage["reason"];
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    this.terminateVoiceSession(payload.sessionId, payload.reason ?? "hangup");
  }

  private onVoiceMuteToggle(
    client: Client,
    payload:
      | (Pick<VoiceMuteToggleMessage, "sessionId" | "targetParticipantId"> & {
          muted: boolean;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) return;

    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.MUTE_TOGGLE,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        muted: payload.muted,
      }
    );
  }

  private ensureVoiceSession(
    sessionId: string,
    firstParticipantId: string,
    secondParticipantId: string
  ) {
    const existing = this.voiceSessions.get(sessionId);
    if (existing) {
      existing.participants.add(firstParticipantId);
      existing.participants.add(secondParticipantId);
      this.participantToVoiceSession.set(firstParticipantId, sessionId);
      this.participantToVoiceSession.set(secondParticipantId, sessionId);
      this.resetVoiceTimeout(sessionId);
      return;
    }

    const timeout = this.clock.setTimeout(() => {
      this.terminateVoiceSession(sessionId, "timeout");
    }, VOICE_SESSION_TIMEOUT_MS);

    this.voiceSessions.set(sessionId, {
      participants: new Set([firstParticipantId, secondParticipantId]),
      timeout,
    });
    this.participantToVoiceSession.set(firstParticipantId, sessionId);
    this.participantToVoiceSession.set(secondParticipantId, sessionId);
  }

  private resetVoiceTimeout(sessionId: string) {
    const state = this.voiceSessions.get(sessionId);
    if (!state || !state.timeout) return;
    state.timeout?.clear();
    state.timeout = this.clock.setTimeout(() => {
      this.terminateVoiceSession(sessionId, "timeout");
    }, VOICE_SESSION_TIMEOUT_MS);
  }

  private clearVoiceTimeout(sessionId: string) {
    const state = this.voiceSessions.get(sessionId);
    if (!state) return;
    state.timeout?.clear();
    state.timeout = null;
  }

  private cleanupVoiceSessionByParticipant(
    participantId: string | undefined,
    reason: VoiceEndMessage["reason"]
  ) {
    if (!participantId) return;

    const sessionId = this.participantToVoiceSession.get(participantId);
    if (!sessionId) return;

    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      this.participantToVoiceSession.delete(participantId);
      return;
    }

    this.sendVoiceEndToSession(sessionId, reason);
    this.clearVoiceSession(sessionId);
  }

  private terminateVoiceSession(
    sessionId: string,
    reason: VoiceEndMessage["reason"]
  ) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    this.sendVoiceEndToSession(sessionId, reason);
    this.clearVoiceSession(sessionId);
  }

  private sendVoiceEndToSession(
    sessionId: string,
    reason: VoiceEndMessage["reason"]
  ) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    for (const participantId of session.participants) {
      const target =
        [...session.participants].find((id) => id !== participantId) ??
        participantId;
      this.sendVoicePayloadToParticipant(participantId, VOICE_EVENTS.END, {
        sessionId,
        fromParticipantId: target,
        targetParticipantId: participantId,
        reason: reason ?? "hangup",
      });
    }
  }

  private clearVoiceSession(sessionId: string) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    session.timeout?.clear();
    this.voiceSessions.delete(sessionId);
    for (const participantId of session.participants) {
      this.participantToVoiceSession.delete(participantId);
    }
  }

  private resolveVoiceTarget(
    sessionId: string,
    senderParticipantId: string,
    fallbackTargetParticipantId: string
  ) {
    const state = this.voiceSessions.get(sessionId);
    if (!state) return null;

    if (
      state.participants.has(fallbackTargetParticipantId) &&
      fallbackTargetParticipantId !== senderParticipantId
    ) {
      return fallbackTargetParticipantId;
    }

    const fallback = [...state.participants].find(
      (participantId) => participantId !== senderParticipantId
    );
    return fallback ?? null;
  }

  private getParticipantId(client: Client) {
    return this.participants.get(client.sessionId);
  }

  private isParticipantInRoom(participantId: string) {
    return [...this.participants.values()].includes(participantId);
  }

  private getClientByParticipantId(participantId: string) {
    const sessionId = [...this.participants.entries()].find(
      ([, storedParticipantId]) => storedParticipantId === participantId
    )?.[0];
    return (
      this.clients.find((client) => client.sessionId === sessionId) ?? null
    );
  }

  private sendVoicePayloadToParticipant(
    participantId: string,
    event: (typeof VOICE_EVENTS)[keyof typeof VOICE_EVENTS],
    payload: Record<string, unknown>
  ) {
    const targetClient = this.getClientByParticipantId(participantId);
    if (!targetClient) return;
    targetClient.send(event, payload);
  }

  private sendVoiceError(
    client: Client,
    payload: {
      sessionId?: string;
      targetParticipantId?: string;
      message: string;
    }
  ) {
    client.send(VOICE_EVENTS.ERROR, {
      ...payload,
      message: payload.message,
    });
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
