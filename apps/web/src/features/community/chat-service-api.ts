import type { z } from "zod";
import {
  chatServiceCreateFeedPostResponseSchema,
  chatServiceDeleteFeedPostBodySchema,
  chatServiceDeleteFeedPostResponseSchema,
  chatServiceGetChatRoomResponseSchema,
  chatServiceListChatRoomsResponseSchema,
  chatServiceListFeedRepliesResponseSchema,
  chatServiceListFeedResponseSchema,
  chatServiceUpdateFeedPostBodySchema,
  chatServiceUpdateFeedPostResponseSchema,
  chatServiceWriteFeedPostBodySchema,
  chatServiceRequestOtpBodySchema,
  chatServiceRequestOtpResponseSchema,
  chatServiceSessionResponseSchema,
  chatServiceSendChatMessageBodySchema,
  chatServiceSendChatMessageResponseSchema,
  chatServiceVerifyOtpBodySchema,
  chatServiceVerifyOtpResponseSchema,
  type ChatServiceChatMessageDto,
  type ChatServiceChatRoomDto,
  type ChatServiceFeedPostDto,
  type ChatServiceSessionResponse,
} from "@yeon/api-contract/chat-service";

const CHAT_SERVICE_API_BASE = "/api/v1/chat-service";

type ParsedPayload<TSchema extends z.ZodTypeAny> = z.infer<TSchema>;

type RequestBody = Record<string, unknown> | undefined;

async function parseJsonResponse<TSchema extends z.ZodTypeAny>(
  response: Response,
  schema: TSchema
): Promise<ParsedPayload<TSchema>> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof (payload as { message?: unknown })?.message === "string"
        ? (payload as { message: string }).message
        : "채팅 서비스 요청에 실패했습니다.";

    throw new Error(message);
  }

  return schema.parse(payload);
}

async function requestJson<
  TSchema extends z.ZodTypeAny,
  TBody extends RequestBody = undefined,
>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: TBody } = {},
  schema: TSchema
): Promise<ParsedPayload<TSchema>> {
  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  };

  const response = await fetch(`${CHAT_SERVICE_API_BASE}${path}`, requestInit);
  return parseJsonResponse(response, schema);
}

export const chatServiceApi = {
  async getSession() {
    return requestJson(
      "/auth/session",
      { method: "GET" },
      chatServiceSessionResponseSchema
    );
  },

  async requestOtp(phoneNumber: string) {
    const parsed = chatServiceRequestOtpBodySchema.parse({ phoneNumber });
    return requestJson(
      "/auth/request-otp",
      {
        method: "POST",
        body: parsed,
      },
      chatServiceRequestOtpResponseSchema
    );
  },

  async verifyOtp(challengeId: string, phoneNumber: string, code: string) {
    const parsed = chatServiceVerifyOtpBodySchema.parse({
      challengeId,
      phoneNumber,
      code,
    });
    return requestJson(
      "/auth/verify-otp",
      {
        method: "POST",
        body: parsed,
      },
      chatServiceVerifyOtpResponseSchema
    );
  },

  async listRooms() {
    return requestJson(
      "/chat/rooms",
      { method: "GET" },
      chatServiceListChatRoomsResponseSchema
    );
  },

  async getRoom(roomId: string) {
    return requestJson(
      `/chat/rooms/${roomId}`,
      { method: "GET" },
      chatServiceGetChatRoomResponseSchema
    );
  },

  async sendMessage(roomId: string, body: string) {
    const parsed = chatServiceSendChatMessageBodySchema.parse({ body });
    return requestJson(
      `/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        body: parsed,
      },
      chatServiceSendChatMessageResponseSchema
    );
  },

  async listFeedPosts() {
    return requestJson(
      "/feed",
      { method: "GET" },
      chatServiceListFeedResponseSchema
    );
  },

  async createFeedPost(
    body: string,
    actor?: {
      guestNickname?: string;
      guestPassword?: string;
    }
  ) {
    const parsed = chatServiceWriteFeedPostBodySchema.parse({
      body,
      ...(actor ?? {}),
    });
    return requestJson(
      "/feed",
      {
        method: "POST",
        body: parsed,
      },
      chatServiceCreateFeedPostResponseSchema
    );
  },

  async listFeedReplies(postId: string) {
    return requestJson(
      `/feed/${postId}/replies`,
      { method: "GET" },
      chatServiceListFeedRepliesResponseSchema
    );
  },

  async createFeedReply(
    postId: string,
    body: string,
    actor?: {
      guestNickname?: string;
      guestPassword?: string;
    }
  ) {
    const parsed = chatServiceWriteFeedPostBodySchema.parse({
      body,
      ...(actor ?? {}),
    });
    return requestJson(
      `/feed/${postId}/replies`,
      {
        method: "POST",
        body: parsed,
      },
      chatServiceCreateFeedPostResponseSchema
    );
  },

  async updateFeedPost(
    postId: string,
    body: string,
    actor?: {
      guestNickname?: string;
      guestPassword?: string;
    }
  ) {
    const parsed = chatServiceUpdateFeedPostBodySchema.parse({
      body,
      ...(actor ?? {}),
    });
    return requestJson(
      `/feed/${postId}`,
      {
        method: "PATCH",
        body: parsed,
      },
      chatServiceUpdateFeedPostResponseSchema
    );
  },

  async deleteFeedPost(
    postId: string,
    actor?: {
      guestNickname?: string;
      guestPassword?: string;
    }
  ) {
    const parsed = chatServiceDeleteFeedPostBodySchema.parse(actor ?? {});
    return requestJson(
      `/feed/${postId}`,
      {
        method: "DELETE",
        body: parsed,
      },
      chatServiceDeleteFeedPostResponseSchema
    );
  },

  async deleteFeedReply(
    postId: string,
    replyId: string,
    actor?: {
      guestNickname?: string;
      guestPassword?: string;
    }
  ) {
    const parsed = chatServiceDeleteFeedPostBodySchema.parse({
      ...(actor ?? {}),
    });
    return requestJson(
      `/feed/${postId}/replies`,
      {
        method: "DELETE",
        body: {
          ...parsed,
          replyId,
        },
      },
      chatServiceDeleteFeedPostResponseSchema
    );
  },
};

export type ChatServiceSession = ChatServiceSessionResponse;
export type ChatServiceSessionUser = NonNullable<
  ChatServiceSession["session"]
>["user"];
export type ChatServiceRoom = ChatServiceChatRoomDto;
export type ChatServiceMessage = ChatServiceChatMessageDto;
export type ChatServiceFeedPost = ChatServiceFeedPostDto;
