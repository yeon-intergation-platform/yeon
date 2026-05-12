export const PARTICIPANT_ROLE = {
  MEMORIZER: "MEMORIZER",
  CHECKER: "CHECKER",
} as const;

export type ParticipantRole =
  (typeof PARTICIPANT_ROLE)[keyof typeof PARTICIPANT_ROLE];

export const CARD_ROOM_PHASE = {
  ANSWERING: "ANSWERING",
  PASSED: "PASSED",
  GIVEN_UP: "GIVEN_UP",
  REVEALED: "REVEALED",
  FINISHED: "FINISHED",
} as const;

export type CardRoomPhase =
  (typeof CARD_ROOM_PHASE)[keyof typeof CARD_ROOM_PHASE];

export const CARD_RESULT = {
  OK: "OK",
  GIVE_UP: "GIVE_UP",
} as const;

export type CardResult = (typeof CARD_RESULT)[keyof typeof CARD_RESULT];

export const CARD_ROOM_ROLE_LABELS: Record<ParticipantRole, string> = {
  [PARTICIPANT_ROLE.MEMORIZER]: "외우는 사람",
  [PARTICIPANT_ROLE.CHECKER]: "봐주는 사람",
};

export const CARD_ROOM_PHASE_LABELS: Record<CardRoomPhase, string> = {
  [CARD_ROOM_PHASE.ANSWERING]: "답변 중",
  [CARD_ROOM_PHASE.PASSED]: "OK",
  [CARD_ROOM_PHASE.GIVEN_UP]: "포기",
  [CARD_ROOM_PHASE.REVEALED]: "정답 공개",
  [CARD_ROOM_PHASE.FINISHED]: "완료",
};

export type CardRoomStudyCard = {
  id: string;
  front: string;
  back: string;
};

export type CardRoomSummary = {
  id: string;
  title: string;
  deckTitle: string;
  hostLabel: string;
  checkerCount: number;
  memorizerCount: number;
  cardCount: number;
  status: "waiting" | "studying";
  visibility: "public" | "private";
};
