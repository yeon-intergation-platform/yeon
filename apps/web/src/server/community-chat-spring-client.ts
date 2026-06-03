import type {
  CommunityChatListMessagesResponse,
  CommunityChatSendMessageBody,
  CommunityChatSendMessageResponse,
} from "@yeon/api-contract/community-chat";
import {
  fetchYeon,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

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
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  if ("message" in parsed && typeof parsed.message === "string") {
    return parsed.message;
  }

  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }

  return null;
}

export class CommunityChatSpringBackendHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "CommunityChatSpringBackendHttpError";
  }
}

type SpringInit = YeonRequestInit & {
  userId?: string | null;
};

async function fetchSpring<T>(
  path: string,
  init: SpringInit,
  fallbackMessage: string
): Promise<T> {
  let response: YeonResponse;

  try {
    response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers: buildSpringBffHeaders(init.headers, { userId: init.userId }),
    });
  } catch {
    throw new CommunityChatSpringBackendHttpError(
      503,
      "Spring backend와 연결할 수 없습니다."
    );
  }

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new CommunityChatSpringBackendHttpError(
      response.status,
      extractMessage(parsed) ?? fallbackMessage
    );
  }

  return parsed as T;
}

export function fetchCommunityChatMessagesFromSpring() {
  return fetchSpring<CommunityChatListMessagesResponse>(
    "/api/v1/community-chat/messages",
    { method: "GET" },
    "커뮤니티 채팅을 불러오지 못했습니다."
  );
}

export function sendCommunityChatMessageToSpring(params: {
  userId?: string | null;
  payload: CommunityChatSendMessageBody;
}) {
  return fetchSpring<CommunityChatSendMessageResponse>(
    "/api/v1/community-chat/messages",
    {
      method: "POST",
      userId: params.userId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params.payload),
    },
    "커뮤니티 채팅 메시지를 전송하지 못했습니다."
  );
}
