"use client";
import {
  YeonAudio,
  YeonButton,
  YeonField,
  YeonIcon,
  YeonOption,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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
  } = voiceCall;

  const incomingLabel = participantLabel(availableTargets, incomingFrom);
  const activeLabel = participantLabel(availableTargets, activeTarget);
  const canStart =
    !isFeatureFlagLoading &&
    isFeatureEnabled &&
    isSupported &&
    status !== "calling" &&
    status !== "ringing" &&
    status !== "connecting" &&
    status !== "connected" &&
    availableTargets.length > 0;
  const canControl = status === "connected" || status === "connecting";

  return (
    <YeonView as="section" className={SHARED_FEATURE_CLASS.panelCard}>
      <YeonAudio ref={audioRef} autoPlay playsInline />
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-bold text-[#111]"
          >
            {title}
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text12Subtle}`}
          >
            1:1 브라우저 음성통화 · 텍스트 채팅은 그대로 유지됩니다.
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[11px] font-bold text-[#666]"
          data-status={status}
        >
          {STATUS_LABELS[status]}
        </YeonText>
      </YeonView>

      {isFeatureFlagLoading ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          음성통화 설정을 확인하는 중입니다.
        </YeonText>
      ) : null}

      {!isFeatureFlagLoading && !isFeatureEnabled ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          음성통화 베타가 꺼져 있습니다. 운영 환경에서
          NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL=true 설정 시 활성화됩니다.
        </YeonText>
      ) : null}

      {isFeatureEnabled && !isSupported ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[12px] font-semibold text-[#111]"
        >
          현재 브라우저는 음성통화를 지원하지 않습니다.
        </YeonText>
      ) : null}

      {incomingFrom && status === "ringing" ? (
        <YeonView className="mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-bold text-[#111]"
          >
            {incomingLabel}님이 통화를 요청했습니다.
          </YeonText>
          <YeonView className="mt-3 flex gap-2">
            <YeonButton
              type="button"
              onClick={() => void accept()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111] px-3 text-[12px] font-bold text-white"
              variant="primary"
            >
              <YeonIcon name="phone" size={14} /> 수락
            </YeonButton>
            <YeonButton
              type="button"
              onClick={reject}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[12px] font-bold text-[#666]"
              variant="secondary"
            >
              <YeonIcon name="phone-off" size={14} /> 거절
            </YeonButton>
          </YeonView>
        </YeonView>
      ) : (
        <YeonView className="mt-3 grid gap-2">
          <YeonField
            as="select"
            value={selectedTargetId ?? ""}
            onChange={(event) =>
              setSelectedTargetId(event.target.value || null)
            }
            disabled={!canStart}
            className="h-10 rounded-xl border border-[#e5e5e5] bg-white px-3 text-[13px] font-semibold text-[#111] disabled:bg-[#fafafa] disabled:text-[#aaa]"
          >
            {availableTargets.length === 0 ? (
              <YeonOption value="">통화 가능한 상대 없음</YeonOption>
            ) : null}
            {availableTargets.map((participant) => (
              <YeonOption key={participant.id} value={participant.id}>
                {participant.label}
              </YeonOption>
            ))}
          </YeonField>

          <YeonView className="flex gap-2">
            <YeonButton
              type="button"
              onClick={() => void start()}
              disabled={!canStart}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#111] px-3 text-[13px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              variant="primary"
            >
              <YeonIcon name="phone" size={15} /> 통화 시작
            </YeonButton>
            <YeonButton
              type="button"
              onClick={end}
              disabled={!canControl && status !== "calling"}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 text-[13px] font-bold text-[#666] disabled:cursor-not-allowed disabled:text-[#aaa]"
              variant="secondary"
            >
              <YeonIcon name="phone-off" size={15} /> 종료
            </YeonButton>
          </YeonView>
        </YeonView>
      )}

      {canControl ? (
        <YeonView className="mt-2 flex gap-2">
          <YeonButton
            type="button"
            onClick={toggleMute}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-bold text-[#666]"
            variant="secondary"
          >
            <YeonIcon name={isMuted ? "mic-off" : "mic"} size={14} />
            {isMuted ? "내 마이크 꺼짐" : "내 마이크 켜짐"}
          </YeonButton>
          {isRemoteMuted ? (
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-bold text-[#666]"
            >
              상대 마이크 꺼짐
            </YeonText>
          ) : null}
        </YeonView>
      ) : null}

      {activeLabel && status !== "ringing" ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          상대: {activeLabel}
        </YeonText>
      ) : null}

      {error ? (
        <YeonView className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-semibold text-[#111]"
          >
            {error}
          </YeonText>
          <YeonButton
            type="button"
            onClick={retry}
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#111]"
            variant="ghost"
          >
            <YeonIcon name="rotate-cw" size={13} /> 재시도
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}
