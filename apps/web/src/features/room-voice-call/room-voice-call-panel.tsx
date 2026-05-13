"use client";

import { Mic, MicOff, Phone, PhoneOff, RefreshCw } from "lucide-react";

import type { RoomVoiceCallResult } from "./use-room-voice-call";

type RoomVoiceCallPanelProps = {
  title?: string;
  voiceCall: RoomVoiceCallResult;
};

const STATUS_LABELS: Record<RoomVoiceCallResult["status"], string> = {
  idle: "대기",
  calling: "발신 중",
  ringing: "수신 중",
  connecting: "연결 중",
  connected: "통화 중",
  failed: "실패",
  ended: "종료",
};

function participantLabel(
  participants: RoomVoiceCallResult["availableTargets"],
  participantId: string | null
) {
  if (!participantId) return null;
  return (
    participants.find((item) => item.id === participantId)?.label ?? "상대"
  );
}

export function RoomVoiceCallPanel({
  title = "음성통화",
  voiceCall,
}: RoomVoiceCallPanelProps) {
  const {
    isFeatureEnabled,
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
  } = voiceCall;

  const incomingLabel = participantLabel(availableTargets, incomingFrom);
  const activeLabel = participantLabel(availableTargets, activeTarget);
  const canStart =
    isFeatureEnabled &&
    isSupported &&
    status !== "calling" &&
    status !== "ringing" &&
    status !== "connecting" &&
    status !== "connected" &&
    availableTargets.length > 0;
  const canControl = status === "connected" || status === "connecting";

  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
      <audio ref={audioRef} autoPlay playsInline />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-[#111]">{title}</h2>
          <p className="mt-1 text-[12px] text-[#777]">
            1:1 브라우저 음성통화 · 텍스트 채팅은 그대로 유지됩니다.
          </p>
        </div>
        <span
          className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[11px] font-bold text-[#666]"
          data-status={status}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {!isFeatureEnabled ? (
        <p className="mt-3 rounded-xl border border-[#eee] bg-[#fafafa] px-3 py-2 text-[12px] font-semibold text-[#777]">
          음성통화 베타가 꺼져 있습니다. 운영 환경에서
          NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL=true 설정 시 활성화됩니다.
        </p>
      ) : null}

      {isFeatureEnabled && !isSupported ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
          현재 브라우저는 음성통화를 지원하지 않습니다.
        </p>
      ) : null}

      {incomingFrom && status === "ringing" ? (
        <div className="mt-3 rounded-xl border border-[#d9ead3] bg-[#eef8ea] p-3">
          <p className="text-[13px] font-bold text-[#2f7d32]">
            {incomingLabel}님이 통화를 요청했습니다.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void accept()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111] px-3 text-[12px] font-bold text-white"
            >
              <Phone size={14} /> 수락
            </button>
            <button
              type="button"
              onClick={reject}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#d7d7d7] bg-white px-3 text-[12px] font-bold text-[#555]"
            >
              <PhoneOff size={14} /> 거절
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          <select
            value={selectedTargetId ?? ""}
            onChange={(event) =>
              setSelectedTargetId(event.target.value || null)
            }
            disabled={!canStart}
            className="h-10 rounded-xl border border-[#d7d7d7] bg-white px-3 text-[13px] font-semibold text-[#333] disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
          >
            {availableTargets.length === 0 ? (
              <option value="">통화 가능한 상대 없음</option>
            ) : null}
            {availableTargets.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void start()}
              disabled={!canStart}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#111] px-3 text-[13px] font-bold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#999]"
            >
              <Phone size={15} /> 통화 시작
            </button>
            <button
              type="button"
              onClick={end}
              disabled={!canControl && status !== "calling"}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d7d7d7] bg-white px-3 text-[13px] font-bold text-[#555] disabled:cursor-not-allowed disabled:text-[#bbb]"
            >
              <PhoneOff size={15} /> 종료
            </button>
          </div>
        </div>
      )}

      {canControl ? (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#d7d7d7] bg-[#fafafa] px-3 text-[12px] font-bold text-[#555]"
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            {isMuted ? "내 마이크 꺼짐" : "내 마이크 켜짐"}
          </button>
          {isRemoteMuted ? (
            <span className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-bold text-[#777]">
              상대 마이크 꺼짐
            </span>
          ) : null}
        </div>
      ) : null}

      {activeLabel && status !== "ringing" ? (
        <p className="mt-2 text-[12px] font-semibold text-[#777]">
          상대: {activeLabel}
        </p>
      ) : null}

      {error ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-[12px] font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-red-700"
          >
            <RefreshCw size={13} /> 재시도
          </button>
        </div>
      ) : null}
    </section>
  );
}
