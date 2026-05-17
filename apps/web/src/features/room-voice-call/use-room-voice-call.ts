"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { Room } from "@colyseus/sdk";
import {
  VOICE_EVENTS,
  type VoiceAnswerMessage,
  type VoiceEndMessage,
  type VoiceIceCandidateLike,
  type VoiceMuteToggleMessage,
  type VoiceOfferMessage,
} from "@yeon/race-shared";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302"] },
];

const BUILD_TIME_FEATURE_FLAG =
  process.env.NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL?.toLowerCase() === "true";
const VOICE_CALL_CONFIG_ENDPOINT = "/api/v1/room-voice-call-config";
const roomVoiceCallConfigQueryKey = () => ["room-voice-call-config"] as const;

const MESSAGES = {
  unsupported: "현재 브라우저는 음성통화를 지원하지 않습니다.",
  loading: "음성통화 설정을 확인하는 중입니다.",
  disabled: "음성통화 베타가 비활성화되어 있습니다.",
  missingRoom: "룸 연결 후 음성통화를 시작할 수 있습니다.",
  missingParticipant: "참가자 정보를 확인할 수 없습니다.",
  missingTarget: "통화할 상대를 선택해 주세요.",
  alreadyActive: "이미 통화 진행 중입니다.",
  permissionDenied:
    "마이크 권한이 거부되어 통화를 시작할 수 없습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요.",
  mediaFailed: "마이크를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  signalFailed:
    "통화 연결을 처리하지 못했습니다. 텍스트 채팅은 계속 사용할 수 있습니다.",
  rejected: "상대가 통화 요청을 거절했습니다.",
  ended: "통화가 종료되었습니다.",
  timeout: "상대 응답이 없어 통화가 종료되었습니다.",
  network: "상대 연결이 끊겨 통화가 종료되었습니다.",
} as const;

type SessionRef = {
  sessionId: string;
  targetParticipantId: string;
};

type IncomingOffer = Pick<
  VoiceOfferMessage,
  "sessionId" | "fromParticipantId" | "targetParticipantId" | "sdp"
>;

type IncomingAnswer = Pick<
  VoiceAnswerMessage,
  "sessionId" | "fromParticipantId" | "sdp"
>;

type IncomingCandidate = {
  sessionId: string;
  fromParticipantId?: string;
  candidate: VoiceIceCandidateLike;
};

type IncomingEnd = {
  sessionId: string;
  fromParticipantId?: string;
  targetParticipantId: string;
  reason?: VoiceEndMessage["reason"];
};

type CleanupOptions = {
  status?: VoiceCallStatus;
  error?: string | null;
};

export type VoiceCallParticipant = {
  id: string;
  label: string;
};

export type VoiceCallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "failed"
  | "ended";

export type RoomVoiceCallOptions = {
  room: Room | null;
  localParticipantId: string | null;
  participants: readonly VoiceCallParticipant[];
  enabled?: boolean;
};

export type RoomVoiceCallResult = {
  isFeatureEnabled: boolean;
  isFeatureFlagLoading: boolean;
  isSupported: boolean;
  status: VoiceCallStatus;
  selectedTargetId: string | null;
  isMuted: boolean;
  isRemoteMuted: boolean;
  error: string | null;
  incomingFrom: string | null;
  activeTarget: string | null;
  availableTargets: readonly VoiceCallParticipant[];
  audioRef: RefObject<HTMLAudioElement | null>;
  start: (targetId?: string) => Promise<void>;
  accept: () => Promise<void>;
  reject: () => void;
  end: () => void;
  retry: () => void;
  setSelectedTargetId: (next: string | null) => void;
  toggleMute: () => void;
  isStarted: boolean;
};

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function hasWebRtcSupport() {
  return (
    typeof window !== "undefined" &&
    typeof window.RTCPeerConnection !== "undefined" &&
    Boolean(window.navigator.mediaDevices?.getUserMedia)
  );
}

function isActiveStatus(status: VoiceCallStatus) {
  return (
    status === "calling" ||
    status === "ringing" ||
    status === "connecting" ||
    status === "connected"
  );
}

function toCandidateInit(
  candidate: VoiceIceCandidateLike
): RTCIceCandidateInit {
  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid ?? undefined,
    sdpMLineIndex: candidate.sdpMLineIndex ?? undefined,
    usernameFragment: candidate.usernameFragment ?? undefined,
  };
}

function normalizeMediaError(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError"
    ? MESSAGES.permissionDenied
    : MESSAGES.mediaFailed;
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseOffer(payload: unknown): IncomingOffer | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<IncomingOffer>;
  if (
    !isNonEmptyText(message.sessionId) ||
    !isNonEmptyText(message.fromParticipantId) ||
    !isNonEmptyText(message.targetParticipantId) ||
    !isNonEmptyText(message.sdp)
  ) {
    return null;
  }
  return {
    sessionId: message.sessionId.trim(),
    fromParticipantId: message.fromParticipantId.trim(),
    targetParticipantId: message.targetParticipantId.trim(),
    sdp: message.sdp,
  };
}

function parseAnswer(payload: unknown): IncomingAnswer | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<IncomingAnswer>;
  if (
    !isNonEmptyText(message.sessionId) ||
    !isNonEmptyText(message.fromParticipantId) ||
    !isNonEmptyText(message.sdp)
  ) {
    return null;
  }
  return {
    sessionId: message.sessionId.trim(),
    fromParticipantId: message.fromParticipantId.trim(),
    sdp: message.sdp,
  };
}

function parseCandidate(payload: unknown): IncomingCandidate | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<IncomingCandidate>;
  if (
    !isNonEmptyText(message.sessionId) ||
    !message.candidate ||
    typeof message.candidate !== "object" ||
    !isNonEmptyText(message.candidate.candidate)
  ) {
    return null;
  }
  return {
    sessionId: message.sessionId.trim(),
    fromParticipantId: isNonEmptyText(message.fromParticipantId)
      ? message.fromParticipantId.trim()
      : undefined,
    candidate: {
      candidate: message.candidate.candidate,
      sdpMid: message.candidate.sdpMid ?? null,
      sdpMLineIndex: message.candidate.sdpMLineIndex ?? null,
      usernameFragment: message.candidate.usernameFragment ?? null,
    },
  };
}

function parseEnd(payload: unknown): IncomingEnd | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<IncomingEnd>;
  if (!isNonEmptyText(message.sessionId)) return null;
  return {
    sessionId: message.sessionId.trim(),
    fromParticipantId: isNonEmptyText(message.fromParticipantId)
      ? message.fromParticipantId.trim()
      : undefined,
    targetParticipantId: isNonEmptyText(message.targetParticipantId)
      ? message.targetParticipantId.trim()
      : "",
    reason: message.reason,
  };
}

function endReasonMessage(reason: VoiceEndMessage["reason"] | undefined) {
  if (reason === "rejected") return MESSAGES.rejected;
  if (reason === "timeout") return MESSAGES.timeout;
  if (reason === "network") return MESSAGES.network;
  return MESSAGES.ended;
}

async function fetchRoomVoiceCallConfig() {
  const response = await fetch(VOICE_CALL_CONFIG_ENDPOINT, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("음성통화 설정을 불러오지 못했습니다.");
  }
  const payload = (await response.json()) as { enabled?: unknown };
  return payload.enabled === true;
}

export function useRoomVoiceCall({
  room,
  localParticipantId,
  participants,
  enabled = true,
}: RoomVoiceCallOptions): RoomVoiceCallResult {
  const runtimeFeatureFlagQuery = useQuery({
    queryKey: roomVoiceCallConfigQueryKey(),
    queryFn: fetchRoomVoiceCallConfig,
    staleTime: 30_000,
    retry: 1,
  });
  const runtimeFeatureFlag = runtimeFeatureFlagQuery.isError
    ? BUILD_TIME_FEATURE_FLAG
    : runtimeFeatureFlagQuery.data;
  const resolvedFeatureFlag = runtimeFeatureFlag ?? BUILD_TIME_FEATURE_FLAG;
  const isFeatureFlagLoading =
    runtimeFeatureFlagQuery.isPending && !BUILD_TIME_FEATURE_FLAG;
  const isFeatureEnabled = resolvedFeatureFlag && enabled;
  const isSupported = hasWebRtcSupport();

  const audioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<Room | null>(null);
  const localParticipantIdRef = useRef<string | null>(null);
  const statusRef = useRef<VoiceCallStatus>("idle");
  const sessionRef = useRef<SessionRef | null>(null);
  const incomingOfferRef = useRef<IncomingOffer | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const candidateQueueRef = useRef<Map<string, VoiceIceCandidateLike[]>>(
    new Map()
  );

  const [status, setStatus] = useState<VoiceCallStatus>("idle");
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const availableTargets = useMemo(
    () => participants.filter((item) => item.id !== localParticipantId),
    [localParticipantId, participants]
  );

  const setCallStatus = useCallback((next: VoiceCallStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const sendPayload = useCallback((event: string, payload: object) => {
    roomRef.current?.send(event, payload);
  }, []);

  const clearConnection = useCallback(
    ({
      status: nextStatus = "idle",
      error: nextError = null,
    }: CleanupOptions = {}) => {
      const peerConnection = peerConnectionRef.current;
      if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.close();
      }

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      peerConnectionRef.current = null;
      sessionRef.current = null;
      incomingOfferRef.current = null;
      candidateQueueRef.current.clear();

      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }

      setIncomingFrom(null);
      setActiveTarget(null);
      setIsMuted(false);
      setIsRemoteMuted(false);
      setIsStarted(false);
      setError(nextError);
      setCallStatus(nextStatus);
    },
    [setCallStatus]
  );

  const sendEndForCurrentSession = useCallback(
    (reason: VoiceEndMessage["reason"]) => {
      const session = sessionRef.current;
      const offer = incomingOfferRef.current;
      const sessionId = session?.sessionId ?? offer?.sessionId;
      const targetParticipantId =
        session?.targetParticipantId ?? offer?.fromParticipantId;
      if (!sessionId || !targetParticipantId) return;

      sendPayload(VOICE_EVENTS.END, {
        sessionId,
        fromParticipantId: localParticipantIdRef.current,
        targetParticipantId,
        reason,
      });
    },
    [sendPayload]
  );

  const failCall = useCallback(
    (message: string) => {
      sendEndForCurrentSession("error");
      clearConnection({ status: "failed", error: message });
    },
    [clearConnection, sendEndForCurrentSession]
  );

  const flushCandidateQueue = useCallback(async (sessionId: string) => {
    const connection = peerConnectionRef.current;
    if (!connection?.remoteDescription) return;

    const queued = candidateQueueRef.current.get(sessionId);
    if (!queued?.length) return;
    candidateQueueRef.current.delete(sessionId);

    for (const candidate of queued) {
      await connection.addIceCandidate(toCandidateInit(candidate));
    }
  }, []);

  const queueOrApplyCandidate = useCallback(
    async (message: IncomingCandidate) => {
      const activeSessionId =
        sessionRef.current?.sessionId ?? incomingOfferRef.current?.sessionId;
      if (message.sessionId !== activeSessionId) return;

      const connection = peerConnectionRef.current;
      if (!connection?.remoteDescription) {
        const existing = candidateQueueRef.current.get(message.sessionId);
        candidateQueueRef.current.set(message.sessionId, [
          ...(existing ? existing : []),
          message.candidate,
        ]);
        return;
      }

      await connection.addIceCandidate(toCandidateInit(message.candidate));
    },
    []
  );

  const createPeerConnection = useCallback(
    (sessionId: string, targetParticipantId: string) => {
      const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      connection.onicecandidate = (event) => {
        if (!event.candidate) return;
        sendPayload(VOICE_EVENTS.ICE_CANDIDATE, {
          sessionId,
          fromParticipantId: localParticipantIdRef.current,
          targetParticipantId,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment,
          },
        });
      };

      connection.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream && audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      };

      const handleConnectionDrop = () => {
        if (
          isActiveStatus(statusRef.current) &&
          (connection.connectionState === "failed" ||
            connection.connectionState === "disconnected" ||
            connection.connectionState === "closed" ||
            connection.iceConnectionState === "failed" ||
            connection.iceConnectionState === "disconnected")
        ) {
          failCall(MESSAGES.signalFailed);
        }
      };
      connection.onconnectionstatechange = handleConnectionDrop;
      connection.oniceconnectionstatechange = handleConnectionDrop;

      return connection;
    },
    [failCall, sendPayload]
  );

  const attachLocalStream = useCallback((connection: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return false;
    stream.getTracks().forEach((track) => connection.addTrack(track, stream));
    return true;
  }, []);

  const start = useCallback(
    async (targetId?: string) => {
      if (isFeatureFlagLoading) {
        setError(MESSAGES.loading);
        return;
      }
      if (!isFeatureEnabled) {
        setError(MESSAGES.disabled);
        return;
      }
      if (!isSupported) {
        setError(MESSAGES.unsupported);
        return;
      }
      if (!roomRef.current) {
        setError(MESSAGES.missingRoom);
        return;
      }
      if (!localParticipantIdRef.current) {
        setError(MESSAGES.missingParticipant);
        return;
      }

      const targetParticipantId = targetId ?? selectedTargetId;
      if (
        !targetParticipantId ||
        !availableTargets.some((item) => item.id === targetParticipantId)
      ) {
        setError(MESSAGES.missingTarget);
        return;
      }
      if (isActiveStatus(statusRef.current)) {
        setError(MESSAGES.alreadyActive);
        return;
      }

      const sessionId = createSessionId();
      clearConnection({ status: "calling" });
      sessionRef.current = { sessionId, targetParticipantId };
      setActiveTarget(targetParticipantId);
      setIsStarted(true);

      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const connection = createPeerConnection(sessionId, targetParticipantId);
        peerConnectionRef.current = connection;
        if (!attachLocalStream(connection)) {
          throw new Error("LOCAL_TRACK_ATTACH_FAILED");
        }

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        sendPayload(VOICE_EVENTS.OFFER, {
          sessionId,
          fromParticipantId: localParticipantIdRef.current,
          targetParticipantId,
          sdp: offer.sdp ?? "",
        });
      } catch (mediaError) {
        failCall(normalizeMediaError(mediaError));
      }
    },
    [
      attachLocalStream,
      availableTargets,
      clearConnection,
      createPeerConnection,
      failCall,
      isFeatureEnabled,
      isFeatureFlagLoading,
      isSupported,
      selectedTargetId,
      sendPayload,
    ]
  );

  const accept = useCallback(async () => {
    const offer = incomingOfferRef.current;
    if (!offer || !isFeatureEnabled || !isSupported) return;

    clearConnection({ status: "connecting" });
    sessionRef.current = {
      sessionId: offer.sessionId,
      targetParticipantId: offer.fromParticipantId,
    };
    setActiveTarget(offer.fromParticipantId);
    setIsStarted(true);

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const connection = createPeerConnection(
        offer.sessionId,
        offer.fromParticipantId
      );
      peerConnectionRef.current = connection;
      if (!attachLocalStream(connection)) {
        throw new Error("LOCAL_TRACK_ATTACH_FAILED");
      }

      await connection.setRemoteDescription({ type: "offer", sdp: offer.sdp });
      await flushCandidateQueue(offer.sessionId);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      sendPayload(VOICE_EVENTS.ANSWER, {
        sessionId: offer.sessionId,
        fromParticipantId: localParticipantIdRef.current,
        targetParticipantId: offer.fromParticipantId,
        sdp: answer.sdp ?? "",
      });
      setCallStatus("connected");
      setIncomingFrom(null);
      setError(null);
    } catch (mediaError) {
      failCall(normalizeMediaError(mediaError));
    }
  }, [
    attachLocalStream,
    clearConnection,
    createPeerConnection,
    failCall,
    flushCandidateQueue,
    isFeatureEnabled,
    isSupported,
    sendPayload,
    setCallStatus,
  ]);

  const reject = useCallback(() => {
    const offer = incomingOfferRef.current;
    if (offer) {
      sendPayload(VOICE_EVENTS.END, {
        sessionId: offer.sessionId,
        fromParticipantId: localParticipantIdRef.current,
        targetParticipantId: offer.fromParticipantId,
        reason: "rejected" as VoiceEndMessage["reason"],
      });
    }
    clearConnection({ status: "ended", error: "통화 요청을 거절했습니다." });
  }, [clearConnection, sendPayload]);

  const end = useCallback(() => {
    sendEndForCurrentSession("hangup");
    clearConnection({ status: "ended", error: MESSAGES.ended });
  }, [clearConnection, sendEndForCurrentSession]);

  const retry = useCallback(() => {
    clearConnection({ status: "idle" });
  }, [clearConnection]);

  const toggleMute = useCallback(() => {
    const session = sessionRef.current;
    const stream = localStreamRef.current;
    if (!session || !stream) return;

    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    sendPayload(VOICE_EVENTS.MUTE_TOGGLE, {
      sessionId: session.sessionId,
      fromParticipantId: localParticipantIdRef.current,
      targetParticipantId: session.targetParticipantId,
      muted: nextMuted,
    });
  }, [isMuted, sendPayload]);

  useEffect(() => {
    roomRef.current = room;
    localParticipantIdRef.current = localParticipantId;

    if (!room || !isFeatureEnabled) {
      if (!room) clearConnection({ status: "idle" });
      return;
    }

    if (!isSupported) {
      setError(MESSAGES.unsupported);
      return;
    }

    const unsubscribeOffer = room.onMessage(VOICE_EVENTS.OFFER, (payload) => {
      const offer = parseOffer(payload);
      if (!offer) return;

      if (isActiveStatus(statusRef.current)) {
        sendPayload(VOICE_EVENTS.END, {
          sessionId: offer.sessionId,
          fromParticipantId: localParticipantIdRef.current,
          targetParticipantId: offer.fromParticipantId,
          reason: "rejected" as VoiceEndMessage["reason"],
        });
        return;
      }

      incomingOfferRef.current = offer;
      setIncomingFrom(offer.fromParticipantId);
      setActiveTarget(offer.fromParticipantId);
      setError(null);
      setCallStatus("ringing");
    });

    const unsubscribeAnswer = room.onMessage(VOICE_EVENTS.ANSWER, (payload) => {
      const answer = parseAnswer(payload);
      const session = sessionRef.current;
      const connection = peerConnectionRef.current;
      if (!answer || !session || !connection) return;
      if (answer.sessionId !== session.sessionId) return;

      void connection
        .setRemoteDescription({ type: "answer", sdp: answer.sdp })
        .then(() => flushCandidateQueue(answer.sessionId))
        .then(() => {
          setCallStatus("connected");
          setError(null);
        })
        .catch(() => failCall(MESSAGES.signalFailed));
    });

    const unsubscribeCandidate = room.onMessage(
      VOICE_EVENTS.ICE_CANDIDATE,
      (payload) => {
        const candidate = parseCandidate(payload);
        if (!candidate) return;
        void queueOrApplyCandidate(candidate).catch(() =>
          failCall(MESSAGES.signalFailed)
        );
      }
    );

    const unsubscribeEnd = room.onMessage(VOICE_EVENTS.END, (payload) => {
      const message = parseEnd(payload);
      const currentSessionId =
        sessionRef.current?.sessionId ?? incomingOfferRef.current?.sessionId;
      if (!message || message.sessionId !== currentSessionId) return;
      clearConnection({
        status: "ended",
        error: endReasonMessage(message.reason),
      });
    });

    const unsubscribeMute = room.onMessage(
      VOICE_EVENTS.MUTE_TOGGLE,
      (payload) => {
        if (!payload || typeof payload !== "object") return;
        const message = payload as Partial<VoiceMuteToggleMessage>;
        const session = sessionRef.current;
        if (
          !session ||
          message.sessionId !== session.sessionId ||
          message.fromParticipantId === localParticipantIdRef.current ||
          typeof message.muted !== "boolean"
        ) {
          return;
        }
        setIsRemoteMuted(message.muted);
      }
    );

    const unsubscribeError = room.onMessage(VOICE_EVENTS.ERROR, (payload) => {
      if (!payload || typeof payload !== "object") return;
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string") {
        setError(message);
        setCallStatus("failed");
      }
    });

    return () => {
      sendEndForCurrentSession("network");
      unsubscribeOffer();
      unsubscribeAnswer();
      unsubscribeCandidate();
      unsubscribeEnd();
      unsubscribeMute();
      unsubscribeError();
      clearConnection({ status: "idle" });
    };
  }, [
    clearConnection,
    failCall,
    flushCandidateQueue,
    isFeatureEnabled,
    isSupported,
    localParticipantId,
    queueOrApplyCandidate,
    room,
    sendEndForCurrentSession,
    sendPayload,
    setCallStatus,
  ]);

  useEffect(() => {
    if (
      selectedTargetId &&
      availableTargets.some((item) => item.id === selectedTargetId)
    ) {
      return;
    }
    setSelectedTargetId(availableTargets[0]?.id ?? null);
  }, [availableTargets, selectedTargetId]);

  return useMemo<RoomVoiceCallResult>(
    () => ({
      isFeatureEnabled,
      isFeatureFlagLoading,
      isSupported,
      status,
      selectedTargetId,
      isMuted,
      isRemoteMuted,
      error,
      incomingFrom,
      activeTarget,
      availableTargets,
      audioRef,
      start,
      accept,
      reject,
      end,
      retry,
      setSelectedTargetId,
      toggleMute,
      isStarted,
    }),
    [
      isFeatureEnabled,
      isFeatureFlagLoading,
      isSupported,
      status,
      selectedTargetId,
      isMuted,
      isRemoteMuted,
      error,
      incomingFrom,
      activeTarget,
      availableTargets,
      start,
      accept,
      reject,
      end,
      retry,
      toggleMute,
      isStarted,
    ]
  );
}
