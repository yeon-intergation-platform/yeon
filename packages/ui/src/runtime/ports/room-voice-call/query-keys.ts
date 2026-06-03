// 룸 음성통화 queryKey SSOT.
//
// web 전용이며 단일 사용이지만 queryKey 패턴 통일을 위해 단일 출처로 둔다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: room-voice-call-query-keys)

export const roomVoiceCallConfigQueryKey = () =>
  ["room-voice-call-config"] as const;
