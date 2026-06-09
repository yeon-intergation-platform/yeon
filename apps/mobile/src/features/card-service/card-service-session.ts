import { ApiClientError } from "@yeon/api-client";
import { cardServiceApi } from "../../services/card-service/client";
import {
  clearPrimaryAuthSessionToken,
  readPrimaryAuthSessionToken,
} from "../../services/primary-auth/storage";

export const CARD_SERVICE_MODE = {
  guest: "guest",
  server: "server",
} as const;

export type CardServiceMode =
  (typeof CARD_SERVICE_MODE)[keyof typeof CARD_SERVICE_MODE];

export type CardServiceSessionState = {
  mode: CardServiceMode;
  sessionToken: string | null;
  isBooting: boolean;
};

function getSessionResolutionCauseMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  return `처리할 수 없는 오류 형식(${String(error)})`;
}

function isExpiredCardServiceSessionError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    (error.status === 401 || error.status === 403)
  );
}

export class CardServiceSessionResolutionError extends Error {
  public readonly cause: unknown;

  constructor(cause: unknown) {
    super(
      `카드 서비스 세션 확인에 실패했습니다. 저장된 인증 토큰으로 서버 세션을 검증하지 못했습니다. 원인: ${getSessionResolutionCauseMessage(cause)}`
    );
    this.name = "CardServiceSessionResolutionError";
    this.cause = cause;
  }
}

export async function resolveCardServiceSession(): Promise<CardServiceSessionState> {
  const storedToken = await readPrimaryAuthSessionToken();

  if (!storedToken) {
    return {
      isBooting: false,
      mode: CARD_SERVICE_MODE.guest,
      sessionToken: null,
    };
  }

  try {
    const response = await cardServiceApi.getAuthSession(storedToken);

    if (!response.authenticated) {
      await clearPrimaryAuthSessionToken();
      return {
        isBooting: false,
        mode: CARD_SERVICE_MODE.guest,
        sessionToken: null,
      };
    }

    return {
      isBooting: false,
      mode: CARD_SERVICE_MODE.server,
      sessionToken: storedToken,
    };
  } catch (error) {
    if (isExpiredCardServiceSessionError(error)) {
      await clearPrimaryAuthSessionToken();
      return {
        isBooting: false,
        mode: CARD_SERVICE_MODE.guest,
        sessionToken: null,
      };
    }

    throw new CardServiceSessionResolutionError(error);
  }
}
