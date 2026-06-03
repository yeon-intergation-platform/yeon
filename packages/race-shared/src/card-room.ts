export type CardRoomVisibility = "public" | "private";
export type CardRoomStatus =
  | "waiting"
  | "answering"
  | "passed"
  | "given_up"
  | "revealed"
  | "finished"
  | "closed";
export type CardRoomRole = "MEMORIZER" | "CHECKER";
export type CardRoomResult = "OK" | "GIVE_UP" | "HINTED_OK";
export type CardRoomParticipantDto = {
  id: string;
  nickname: string;
  characterId: string;
  role: CardRoomRole;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string;
};
export type CardRoomCardDto = {
  id: string;
  frontText: string;
  backText: string;
  orderIndex: number;
};
export type CardRoomMessageDto = {
  id: string;
  senderParticipantId: string | null;
  senderNickname: string | null;
  content: string;
  messageType: "user" | "system";
  createdAt: string;
};
export type CardRoomResultDto = {
  id: string;
  cardId: string;
  participantId: string;
  result: CardRoomResult;
  createdAt: string;
};
export type CardRoomDetailDto = {
  id: string;
  title: string;
  deckTitle: string;
  visibility: CardRoomVisibility;
  status: CardRoomStatus;
  currentCardIndex: number;
  participants: readonly CardRoomParticipantDto[];
  cards: readonly CardRoomCardDto[];
  messages: readonly CardRoomMessageDto[];
  results: readonly CardRoomResultDto[];
};

export const CARD_ROOM_NAME = "card_room";

export const CARD_ROOM_EVENTS = {
  STATE: "card.state",
  ERROR: "card.error",
  CHAT: "card.chat",
  READY: "card.ready",
  ROLE: "card.role",
  START: "card.start",
  END: "card.end",
  REVEAL: "card.reveal",
  RESULT: "card.result",
  NEXT: "card.next",
  LEAVE: "card.leave",
} as const;

export type CardRoomRealtimeJoinOptions = {
  cardRoomId: string;
  participantId: string;
  // 서버(백엔드)가 입장 REST 응답에서 발급한 참가자 소유 증명 토큰.
  // race-server는 이 값을 검증해 임의 participantId 가장(impersonation)을 차단한다.
  // 하위호환을 위해 옵셔널: 토큰 미발급(레거시) 클라이언트도 연결 자체는 허용하되,
  // 백엔드 검증 시크릿이 설정된 환경에서는 race-server가 필수로 요구한다.
  participantToken?: string;
};

export type CardRoomRealtimeState = {
  id: string;
  title: string;
  deckTitle: string;
  visibility: CardRoomVisibility;
  status: CardRoomStatus;
  currentCardIndex: number;
  participants: readonly CardRoomParticipantDto[];
  cards: readonly CardRoomCardDto[];
  messages: readonly CardRoomMessageDto[];
  results: readonly CardRoomResultDto[];
};

export type CardRoomChatMessage = {
  content: string;
};

export type CardRoomReadyMessage = {
  isReady: boolean;
};

export type CardRoomRoleMessage = {
  role: CardRoomRole;
};

export type CardRoomResultMessage = {
  cardId: string;
  result: CardRoomResult;
};

export type CardRoomErrorMessage = {
  message: string;
};

export function toCardRoomRealtimeState(
  room: CardRoomDetailDto
): CardRoomRealtimeState {
  return {
    id: room.id,
    title: room.title,
    deckTitle: room.deckTitle,
    visibility: room.visibility,
    status: room.status,
    currentCardIndex: room.currentCardIndex,
    participants: room.participants,
    cards: room.cards,
    messages: room.messages,
    results: room.results,
  };
}
