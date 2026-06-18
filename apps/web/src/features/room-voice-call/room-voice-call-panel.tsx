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
  labels?: Partial<RoomVoiceCallPanelLabels>;
  voiceCall: RoomVoiceCallResult;
};

export type RoomVoiceCallPanelLabels = {
  title: string;
  description: string;
  status: Record<RoomVoiceCallResult["status"], string>;
  loading: string;
  unavailable: string;
  unsupported: string;
  participantFallback: string;
  incomingRequest: (label: string) => string;
  accept: string;
  reject: string;
  noTargets: string;
  start: string;
  end: string;
  muted: string;
  unmuted: string;
  remoteMuted: string;
  activeTarget: (label: string) => string;
  retry: string;
};

const DEFAULT_LABELS: RoomVoiceCallPanelLabels = {
  title: "음성통화",
  description: "1:1 브라우저 음성통화 · 텍스트 채팅은 그대로 유지됩니다.",
  status: {
    idle: "대기",
    calling: "발신 중",
    ringing: "수신 중",
    connecting: "연결 중",
    connected: "통화 중",
    failed: "실패",
    ended: "종료",
  },
  loading: "음성통화 설정을 확인하는 중입니다.",
  unavailable: "현재 방에서는 음성통화를 사용할 수 없습니다.",
  unsupported: "현재 브라우저는 음성통화를 지원하지 않습니다.",
  participantFallback: "상대",
  incomingRequest: (label) => `${label}님이 통화를 요청했습니다.`,
  accept: "수락",
  reject: "거절",
  noTargets: "통화 가능한 상대 없음",
  start: "통화 시작",
  end: "종료",
  muted: "내 마이크 꺼짐",
  unmuted: "내 마이크 켜짐",
  remoteMuted: "상대 마이크 꺼짐",
  activeTarget: (label) => `상대: ${label}`,
  retry: "재시도",
};

function participantLabel(
  participants: RoomVoiceCallResult["availableTargets"],
  participantId: string | null,
  fallback: string
) {
  if (!participantId) return null;
  return (
    participants.find((item) => item.id === participantId)?.label ?? fallback
  );
}

export function RoomVoiceCallPanel({
  title,
  labels: labelOverrides,
  voiceCall,
}: RoomVoiceCallPanelProps) {
  const labels: RoomVoiceCallPanelLabels = {
    ...DEFAULT_LABELS,
    ...labelOverrides,
    status: {
      ...DEFAULT_LABELS.status,
      ...labelOverrides?.status,
    },
  };
  const resolvedTitle = title ?? labels.title;
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

  const incomingLabel = participantLabel(
    availableTargets,
    incomingFrom,
    labels.participantFallback
  );
  const activeLabel = participantLabel(
    availableTargets,
    activeTarget,
    labels.participantFallback
  );
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
  const hasVisibleCallState =
    status === "calling" ||
    status === "ringing" ||
    status === "connecting" ||
    status === "connected" ||
    Boolean(incomingFrom || activeTarget || error);

  if (!isFeatureFlagLoading && !isFeatureEnabled && !hasVisibleCallState) {
    return null;
  }

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
            {resolvedTitle}
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text12Subtle}`}
          >
            {labels.description}
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[11px] font-bold text-[#666]"
          data-status={status}
        >
          {labels.status[status]}
        </YeonText>
      </YeonView>

      {isFeatureFlagLoading ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          {labels.loading}
        </YeonText>
      ) : null}

      {!isFeatureFlagLoading && !isFeatureEnabled ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={`mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
        >
          {labels.unavailable}
        </YeonText>
      ) : null}

      {isFeatureEnabled && !isSupported ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[12px] font-semibold text-[#111]"
        >
          {labels.unsupported}
        </YeonText>
      ) : null}

      {incomingFrom && status === "ringing" ? (
        <YeonView className="mt-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-bold text-[#111]"
          >
            {labels.incomingRequest(
              incomingLabel ?? labels.participantFallback
            )}
          </YeonText>
          <YeonView className="mt-3 flex gap-2">
            <YeonButton
              type="button"
              onClick={() => void accept()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111] px-3 text-[12px] font-bold text-white"
              variant="primary"
            >
              <YeonIcon name="phone" size={14} /> {labels.accept}
            </YeonButton>
            <YeonButton
              type="button"
              onClick={reject}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[12px] font-bold text-[#666]"
              variant="secondary"
            >
              <YeonIcon name="phone-off" size={14} /> {labels.reject}
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
              <YeonOption value="">{labels.noTargets}</YeonOption>
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
              <YeonIcon name="phone" size={15} /> {labels.start}
            </YeonButton>
            <YeonButton
              type="button"
              onClick={end}
              disabled={!canControl && status !== "calling"}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 text-[13px] font-bold text-[#666] disabled:cursor-not-allowed disabled:text-[#aaa]"
              variant="secondary"
            >
              <YeonIcon name="phone-off" size={15} /> {labels.end}
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
            {isMuted ? labels.muted : labels.unmuted}
          </YeonButton>
          {isRemoteMuted ? (
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-bold text-[#666]"
            >
              {labels.remoteMuted}
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
          {labels.activeTarget(activeLabel)}
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
            <YeonIcon name="rotate-cw" size={13} /> {labels.retry}
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}
