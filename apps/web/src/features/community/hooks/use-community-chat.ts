"use client";

import { useCallback, useEffect, useState } from "react";

import {
  chatServiceApi,
  type ChatServiceMessage,
  type ChatServiceRoom,
  type ChatServiceSession,
} from "../chat-service-api";

type ErrorState = string | null;

type UseCommunityChatOptions = {
  pollIntervalMs?: number;
};

type OtpStep = "idle" | "requested";

export function useCommunityChat({ pollIntervalMs = 6000 }: UseCommunityChatOptions = {}) {
  const [sessionState, setSessionState] = useState<ChatServiceSession>({
    authenticated: false,
    session: null,
  });
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<ErrorState>(null);

  const [rooms, setRooms] = useState<ChatServiceRoom[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [roomError, setRoomError] = useState<ErrorState>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatServiceMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState<ErrorState>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [otpChallengeId, setOtpChallengeId] = useState("");
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpRequestError, setOtpRequestError] = useState<ErrorState>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVerifyError, setOtpVerifyError] = useState<ErrorState>(null);

  const currentUser = sessionState.session?.user ?? null;

  const resetChatArea = useCallback(() => {
    setRooms([]);
    setSelectedRoomId(null);
    setMessages([]);
  }, []);

  const clearOtpState = useCallback(() => {
    setOtpStep("idle");
    setOtpChallengeId("");
    setOtpDebugCode(null);
    setOtpRequestError(null);
    setOtpVerifyError(null);
  }, []);

  const loadRooms = useCallback(async () => {
    setIsRoomsLoading(true);
    setRoomError(null);

    try {
      const response = await chatServiceApi.listRooms();
      setRooms(response.rooms);

      setSelectedRoomId((current) => {
        if (response.rooms.length === 0) {
          return null;
        }

        const stillExists = response.rooms.some((room) => room.id === current);
        return stillExists ? current : response.rooms[0]?.id ?? null;
      });
    } catch (error) {
      if (error instanceof Error) {
        setRoomError(error.message);
      } else {
        setRoomError("채팅방 목록을 불러오지 못했습니다.");
      }
      setRooms([]);
      setSelectedRoomId(null);
    } finally {
      setIsRoomsLoading(false);
    }
  }, []);

  const loadRoom = useCallback(async (roomId: string | null) => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    setIsMessagesLoading(true);
    setMessageError(null);

    try {
      const response = await chatServiceApi.getRoom(roomId);
      setMessages(response.messages);
    } catch (error) {
      if (error instanceof Error) {
        setMessageError(error.message);
      } else {
        setMessageError("채팅 내역을 불러오지 못했습니다.");
      }
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const hydrateAuthenticatedSession = useCallback(async () => {
    setIsSessionLoading(true);
    setSessionError(null);

    try {
      const response = await chatServiceApi.getSession();
      setSessionState(response);

      if (response.authenticated) {
        clearOtpState();
        await loadRooms();
      } else {
        resetChatArea();
      }
    } catch (error) {
      setSessionState({ authenticated: false, session: null });
      resetChatArea();

      if (error instanceof Error) {
        setSessionError(error.message);
      } else {
        setSessionError("채팅 세션을 확인하지 못했습니다.");
      }
    } finally {
      setIsSessionLoading(false);
    }
  }, [clearOtpState, loadRooms, resetChatArea]);

  useEffect(() => {
    void hydrateAuthenticatedSession();
  }, [hydrateAuthenticatedSession]);

  useEffect(() => {
    if (!sessionState.authenticated || !selectedRoomId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadRoom(selectedRoomId);
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [loadRoom, pollIntervalMs, selectedRoomId, sessionState.authenticated]);

  useEffect(() => {
    void loadRoom(selectedRoomId);
  }, [loadRoom, selectedRoomId]);

  const setRoom = useCallback(
    (roomId: string | null) => {
      setSelectedRoomId(roomId);
      setMessages([]);
      setMessageError(null);
    },
    [],
  );

  const requestOtp = useCallback(async (phoneNumber: string) => {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
    setOtpRequestError(null);
    setIsRequestingOtp(true);

    try {
      const response = await chatServiceApi.requestOtp(normalizedPhoneNumber);
      setOtpPhoneNumber(normalizedPhoneNumber);
      setOtpChallengeId(response.challengeId);
      setOtpDebugCode(response.debugCode);
      setOtpStep("requested");
      return response;
    } catch (error) {
      if (error instanceof Error) {
        setOtpRequestError(error.message);
      } else {
        setOtpRequestError("인증번호 전송 요청을 처리하지 못했습니다.");
      }
      throw error;
    } finally {
      setIsRequestingOtp(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      setOtpVerifyError(null);
      setIsVerifyingOtp(true);

      try {
        const response = await chatServiceApi.verifyOtp(
          otpChallengeId,
          otpPhoneNumber,
          code,
        );

        setSessionState({ authenticated: true, session: response.session });
        clearOtpState();
        await hydrateAuthenticatedSession();
      } catch (error) {
        if (error instanceof Error) {
          setOtpVerifyError(error.message);
        } else {
          setOtpVerifyError("인증번호 확인에 실패했습니다.");
        }
        throw error;
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [clearOtpState, hydrateAuthenticatedSession, otpChallengeId, otpPhoneNumber],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!selectedRoomId) {
        setMessageError("채팅방을 먼저 선택해주세요.");
        return;
      }

      setMessageError(null);
      setIsSendingMessage(true);

      try {
        const response = await chatServiceApi.sendMessage(selectedRoomId, message);

        setMessages((current) => {
          if (current.some((item) => item.id === response.message.id)) {
            return current;
          }
          return [...current, response.message];
        });

        await loadRoom(selectedRoomId);
      } catch (error) {
        if (error instanceof Error) {
          setMessageError(error.message);
        } else {
          setMessageError("메시지를 전송하지 못했습니다.");
        }
        throw error;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [loadRoom, selectedRoomId],
  );

  const reloadSession = useCallback(() => {
    void hydrateAuthenticatedSession();
  }, [hydrateAuthenticatedSession]);

  return {
    sessionState,
    currentUser,
    isSessionLoading,
    sessionError,
    rooms,
    isRoomsLoading,
    roomError,
    selectedRoomId,
    setRoom,
    messages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    otpStep,
    otpPhoneNumber,
    otpDebugCode,
    otpRequestError,
    otpVerifyError,
    isRequestingOtp,
    isVerifyingOtp,
    requestOtp,
    verifyOtp,
    sendMessage,
    reloadSession,
  };
}

export type UseCommunityChatReturn = ReturnType<typeof useCommunityChat>;
