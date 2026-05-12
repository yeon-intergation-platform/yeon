import type { z } from "zod";
import {
  communityChatListMessagesResponseSchema,
  communityChatSendMessageBodySchema,
  communityChatSendMessageResponseSchema,
  type CommunityChatMessageDto,
} from "@yeon/api-contract/community-chat";

const COMMUNITY_CHAT_API_BASE = "/api/v1/community-chat/messages";

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
        : "커뮤니티 채팅 요청에 실패했습니다.";

    throw new Error(message);
  }

  return schema.parse(payload);
}

async function requestJson<
  TSchema extends z.ZodTypeAny,
  TBody extends RequestBody = undefined,
>(
  init: Omit<RequestInit, "body"> & { body?: TBody } = {},
  schema: TSchema
): Promise<ParsedPayload<TSchema>> {
  const response = await fetch(COMMUNITY_CHAT_API_BASE, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  return parseJsonResponse(response, schema);
}

export const communityChatApi = {
  async listMessages() {
    return requestJson(
      { method: "GET" },
      communityChatListMessagesResponseSchema
    );
  },

  async sendMessage(params: {
    body: string;
    guestSessionId: string;
    guestNickname?: string;
  }) {
    const parsed = communityChatSendMessageBodySchema.parse(params);
    return requestJson(
      {
        method: "POST",
        body: parsed,
      },
      communityChatSendMessageResponseSchema
    );
  },
};

export type CommunityChatMessage = CommunityChatMessageDto;
