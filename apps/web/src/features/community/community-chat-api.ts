import type { z } from "zod";
import {
  communityChatListMessagesResponseSchema,
  communityChatSendMessageBodySchema,
  communityChatSendMessageResponseSchema,
  type CommunityChatMessageDto,
} from "@yeon/api-contract/community-chat";
import {
  fetchYeon,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const COMMUNITY_CHAT_API_BASE = "/api/v1/community-chat/messages";

type ParsedPayload<TSchema extends z.ZodTypeAny> = z.infer<TSchema>;

type RequestBody = Record<string, unknown> | undefined;

async function parseJsonResponse<TSchema extends z.ZodTypeAny>(
  response: YeonResponse,
  schema: TSchema,
  fallbackMessage: string
): Promise<ParsedPayload<TSchema>> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof (payload as { message?: unknown })?.message === "string"
        ? (payload as { message: string }).message
        : fallbackMessage;

    throw new Error(
      normalizeCommunityChatErrorMessage(message, fallbackMessage)
    );
  }

  return schema.parse(payload);
}

function normalizeCommunityChatErrorMessage(
  message: string,
  fallbackMessage: string
) {
  const normalized = message.trim();
  if (!normalized) {
    return fallbackMessage;
  }

  if (normalized.includes("로그인") || normalized.includes("chat-service")) {
    return fallbackMessage;
  }

  return normalized;
}

async function requestJson<
  TSchema extends z.ZodTypeAny,
  TBody extends RequestBody = undefined,
>(
  init: Omit<YeonRequestInit, "body"> & { body?: TBody } = {},
  schema: TSchema,
  fallbackMessage: string
): Promise<ParsedPayload<TSchema>> {
  const response = await fetchYeon(COMMUNITY_CHAT_API_BASE, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  return parseJsonResponse(response, schema, fallbackMessage);
}

export const communityChatApi = {
  async listMessages() {
    return requestJson(
      { method: "GET" },
      communityChatListMessagesResponseSchema,
      "채팅을 불러오지 못했습니다."
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
      communityChatSendMessageResponseSchema,
      "메시지를 전송하지 못했습니다."
    );
  },
};

export type CommunityChatMessage = CommunityChatMessageDto;
