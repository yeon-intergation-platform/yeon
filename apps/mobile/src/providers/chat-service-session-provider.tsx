import type { ChatServiceSessionDto } from "@yeon/api-contract/chat-service";
import { ApiClientError } from "@yeon/api-client";
import {
  getYeonNow,
  getYeonRandom,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { isAnonymousApp } from "../lib/mobile-app-mode";
import { chatServiceApi } from "../services/chat-service/client";
import {
  clearChatServiceSessionToken,
  readChatServiceSessionToken,
  writeChatServiceSessionToken,
} from "../services/chat-service/storage";

const CHAT_SERVICE_GUEST_SESSION_PREFIX = "guest:";
const CHAT_SERVICE_GUEST_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function buildGuestProfileFallback(profileId: string) {
  return {
    ageLabel: "게스트",
    avatarUrl: null,
    bio: "",
    id: profileId,
    nickname: "익명 사용자",
    points: 0,
    regionLabel: "익명",
  };
}

function buildGuestSessionToken(profileId: string) {
  return `${CHAT_SERVICE_GUEST_SESSION_PREFIX}${profileId}`;
}

function parseGuestProfileId(sessionToken: string) {
  if (!sessionToken.startsWith(CHAT_SERVICE_GUEST_SESSION_PREFIX)) {
    return null;
  }

  const profileId = sessionToken.slice(
    CHAT_SERVICE_GUEST_SESSION_PREFIX.length
  );

  return profileId.length > 0 ? profileId : null;
}

function buildGuestIdentity() {
  const suffix = `${getYeonNow()}-${getYeonRandom().toString(36).slice(2, 10)}`;

  return {
    guestNickname: `익명친구 ${suffix}`,
    guestPassword: suffix,
  };
}

type ChallengeState = {
  challengeId: string;
  phoneNumber: string;
  expiresAt: string;
  acceptAnyCode: boolean;
  debugCode: string | null;
};

type ChatServiceSessionStatus =
  | "booting"
  | "signed_out"
  | "awaiting_otp"
  | "signed_in";

type ChatServiceSessionContextValue = {
  status: ChatServiceSessionStatus;
  session: ChatServiceSessionDto | null;
  challenge: ChallengeState | null;
  requestOtp: (phoneNumber: string) => Promise<ChallengeState>;
  verifyOtp: (code: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const ChatServiceSessionContext =
  createContext<ChatServiceSessionContextValue | null>(null);

type ChatServiceSessionProviderProps = {
  children: ReactNode;
};

export function ChatServiceSessionProvider({
  children,
}: ChatServiceSessionProviderProps) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<ChatServiceSessionDto | null>(null);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [status, setStatus] = useState<ChatServiceSessionStatus>("booting");
  const skipPhoneVerification =
    isAnonymousApp &&
    process.env.EXPO_PUBLIC_SKIP_ANONYMOUS_CHAT_PHONE_AUTH !== "false";

  async function hydrateGuestSession(profileId: string) {
    const guestSession: ChatServiceSessionDto = {
      token: buildGuestSessionToken(profileId),
      expiresAt: new Date(
        getYeonNow() + CHAT_SERVICE_GUEST_SESSION_TTL_MS
      ).toISOString(),
      user: buildGuestProfileFallback(profileId),
    };

    setSession(guestSession);
    setChallenge(null);
    setStatus("signed_in");

    try {
      const response = await chatServiceApi.getChatServiceProfile(
        guestSession.token,
        profileId
      );
      setSession((next) =>
        next
          ? {
              ...next,
              user: response.profile,
            }
          : null
      );
    } catch {
      // 프로필 미조회 상태라도 익명 세션은 유지합니다.
    }
  }

  async function bootstrapGuestSession() {
    const existingToken = await readChatServiceSessionToken();
    const existingGuestProfileId = parseGuestProfileId(existingToken ?? "");

    if (existingGuestProfileId) {
      await hydrateGuestSession(existingGuestProfileId);
      return;
    }

    const guestIdentity = buildGuestIdentity();
    const response =
      await chatServiceApi.resolveChatServiceGuestProfile(guestIdentity);
    const guestToken = buildGuestSessionToken(response.id);

    await writeChatServiceSessionToken(guestToken);
    await hydrateGuestSession(response.id);
  }

  function setRealSession(
    sessionToken: string,
    sessionData: ChatServiceSessionDto
  ) {
    if (!sessionData) {
      return;
    }

    const nextSession: ChatServiceSessionDto = {
      token: sessionToken,
      expiresAt: sessionData.expiresAt,
      user: sessionData.user,
    };

    setSession(nextSession);
    setChallenge(null);
    setStatus("signed_in");
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const token = await readChatServiceSessionToken();

      if (!token) {
        if (skipPhoneVerification) {
          await bootstrapGuestSession();
          return;
        }
        setStatus("signed_out");
        return;
      }

      await restoreSession(token);
    } catch {
      if (skipPhoneVerification) {
        await bootstrapGuestSession();
      } else {
        setSession(null);
        setChallenge(null);
        setStatus("signed_out");
      }
    }
  }

  async function restoreSession(token: string) {
    const guestProfileId = parseGuestProfileId(token);

    if (guestProfileId) {
      await hydrateGuestSession(guestProfileId);
      return;
    }

    try {
      const response = await chatServiceApi.getChatServiceSession(token);

      if (!response.authenticated || !response.session) {
        await clearChatServiceSessionToken();
        setSession(null);
        if (skipPhoneVerification) {
          await bootstrapGuestSession();
        } else {
          setStatus("signed_out");
        }
        return;
      }

      setRealSession(token, response.session);
      await writeChatServiceSessionToken(response.session.token);
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 403)
      ) {
        await clearChatServiceSessionToken();
      }

      setSession(null);
      if (skipPhoneVerification) {
        await bootstrapGuestSession();
      } else {
        setStatus("signed_out");
      }
    }
  }

  async function requestOtp(phoneNumber: string) {
    const response = await chatServiceApi.requestChatServiceOtp({
      phoneNumber,
    });

    const nextChallenge = {
      challengeId: response.challengeId,
      phoneNumber,
      expiresAt: response.expiresAt,
      acceptAnyCode: response.acceptAnyCode,
      debugCode: response.debugCode,
    };

    setChallenge(nextChallenge);
    setStatus("awaiting_otp");
    return nextChallenge;
  }

  async function verifyOtp(code: string) {
    if (!challenge) {
      throw new Error("인증 요청이 먼저 필요합니다.");
    }

    const response = await chatServiceApi.verifyChatServiceOtp({
      challengeId: challenge.challengeId,
      phoneNumber: challenge.phoneNumber,
      code,
    });

    await writeChatServiceSessionToken(response.session.token);
    setChallenge(null);
    setRealSession(response.session.token, response.session);
    setStatus("signed_in");
    queryClient.clear();
  }

  async function refreshSession() {
    const token = await readChatServiceSessionToken();

    if (!token) {
      if (skipPhoneVerification) {
        await bootstrapGuestSession();
      } else {
        setSession(null);
        setStatus("signed_out");
      }
      return;
    }

    await restoreSession(token);
  }

  async function logout() {
    const token = session?.token;

    if (token && !parseGuestProfileId(token)) {
      try {
        await chatServiceApi.logoutChatService(token);
      } catch {
        // noop - local sign-out should still win
      }
    }

    await clearChatServiceSessionToken();
    queryClient.clear();

    if (skipPhoneVerification) {
      await bootstrapGuestSession();
      return;
    }

    setSession(null);
    setChallenge(null);
    setStatus("signed_out");
  }

  return (
    <ChatServiceSessionContext.Provider
      value={{
        status,
        session,
        challenge,
        requestOtp,
        verifyOtp,
        refreshSession,
        logout,
      }}
    >
      {children}
    </ChatServiceSessionContext.Provider>
  );
}

export function useChatServiceSession() {
  const context = useContext(ChatServiceSessionContext);

  if (!context) {
    throw new Error(
      "ChatServiceSessionProvider 내부에서만 사용할 수 있습니다."
    );
  }

  return context;
}
