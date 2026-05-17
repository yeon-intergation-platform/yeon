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
    if (
      error instanceof ApiClientError &&
      (error.status === 401 || error.status === 403)
    ) {
      await clearPrimaryAuthSessionToken();
    }
    return {
      isBooting: false,
      mode: CARD_SERVICE_MODE.guest,
      sessionToken: null,
    };
  }
}
