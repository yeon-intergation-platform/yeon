export const CARD_ROOM_STATUS_LABELS = {
  waiting: "대기중",
  in_progress: "진행 중",
  finished: "완료",
  closed: "종료",
} as const;

export const CARD_ROOM_ROLE_LABELS = {
  UNASSIGNED: "역할 미정",
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
