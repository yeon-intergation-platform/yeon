import { chatServiceSessionResponseSchema } from "@yeon/api-contract/chat-service";
import type { ErrorResponseMeta } from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createErrorResponseBody } from "@/server/bff-error";
import { fetchChatServiceSessionFromSpring } from "@/server/chat-service-auth-spring-client";
import { ServiceError } from "@/server/errors/service-error";

export const CHAT_SERVICE_SESSION_COOKIE_NAME = "chat-service-session";

export function jsonChatServiceError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json(createErrorResponseBody(message, status, detail), {
    status,
  });
}

export function getChatServiceSessionToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return request.cookies.get(CHAT_SERVICE_SESSION_COOKIE_NAME)?.value ?? null;
}

async function resolveChatServiceSession(request: NextRequest) {
  const sessionToken = getChatServiceSessionToken(request);

  if (!sessionToken) {
    return null;
  }

  const sessionState = chatServiceSessionResponseSchema.parse(
    await fetchChatServiceSessionFromSpring(sessionToken)
  );

  if (!sessionState.authenticated || !sessionState.session) {
    return null;
  }

  return {
    sessionToken,
    profile: sessionState.session.user,
  };
}

export async function requireChatServiceAuth(request: NextRequest) {
  const auth = await resolveChatServiceSession(request);

  if (!auth) {
    throw new ServiceError(401, "chat-service 로그인이 필요합니다.", {
      code: "CHAT_SERVICE_AUTH_REQUIRED",
    });
  }

  return auth;
}

export async function getOptionalChatServiceAuth(request: NextRequest) {
  return resolveChatServiceSession(request);
}

export async function parseJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new ServiceError(400, "요청 본문 JSON 형식이 올바르지 않습니다.", {
      code: "INVALID_JSON_BODY",
    });
  }
}

export function clearChatServiceSessionCookie(response: NextResponse) {
  response.cookies.set(CHAT_SERVICE_SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
  });
}
