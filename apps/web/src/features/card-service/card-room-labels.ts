export const CARD_ROOM_STATUS_LABELS = {
  waiting: "대기중",
  answering: "답변 중",
  passed: "OK",
  given_up: "포기",
  revealed: "정답 공개",
  finished: "완료",
} as const;

export const CARD_ROOM_ROLE_LABELS = {
  MEMORIZER: "외우는 사람",
  CHECKER: "봐주는 사람",
} as const;

export const CARD_ROOM_CONNECTION_STATE_LABELS: Record<string, string> = {
  idle: "입장 준비",
  connecting: "연결 중",
  connected: "연결됨",
  error: "연결 실패",
  disconnected: "연결 끊김",
} as const;
