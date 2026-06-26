export type CardRoomVisibility = "public" | "private";
// 방 수준 라이프사이클만 표현한다(finding 20). 카드 단위 진행 상태는
// currentCardRevealed / currentCardResult로 분리한다.
export type CardRoomStatus = "waiting" | "in_progress" | "finished" | "closed";
export type CardRoomRole = "UNASSIGNED" | "MEMORIZER" | "CHECKER";
export type CardRoomResult = "OK" | "GIVE_UP" | "HINTED_OK";
export const CARD_ROOM_LOBBY_FILTER = {
  ALL: "all",
  PUBLIC: "public",
  AVAILABLE: "available",
} as const;
export type CardRoomLobbyFilter =
  (typeof CARD_ROOM_LOBBY_FILTER)[keyof typeof CARD_ROOM_LOBBY_FILTER];
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
  // finding 20: 현재 카드의 진행 상태(방 status와 분리).
  currentCardRevealed: boolean;
  currentCardResult: CardRoomResult | null;
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
  // finding 20: 현재 카드의 진행 상태(방 status와 분리).
  currentCardRevealed: boolean;
  currentCardResult: CardRoomResult | null;
  participants: readonly CardRoomParticipantDto[];
  cards: readonly CardRoomCardDto[];
  messages: readonly CardRoomMessageDto[];
  results: readonly CardRoomResultDto[];
};

export type CardRoomParticipantPolicyState = Pick<
  CardRoomParticipantDto,
  "id" | "role" | "isHost" | "isReady"
>;

export type CardRoomLifecyclePolicyState = {
  status: CardRoomStatus;
};

export type CardRoomLobbySummaryPolicyState = CardRoomLifecyclePolicyState & {
  visibility: CardRoomVisibility;
  title: string;
  deckTitle: string;
  hostLabel: string;
};

export type CardRoomStudyPolicyState = CardRoomLifecyclePolicyState & {
  currentCardRevealed: boolean;
  currentCardResult: CardRoomResult | null;
};

export type CardRoomStartPolicyState = CardRoomLifecyclePolicyState & {
  cards: readonly unknown[];
  participants: readonly CardRoomParticipantPolicyState[];
};

export function findCardRoomParticipant<
  T extends CardRoomParticipantPolicyState,
>(participants: readonly T[], participantId: string | null): T | null {
  if (!participantId) {
    return null;
  }

  return (
    participants.find((participant) => participant.id === participantId) ?? null
  );
}

export function isCardRoomWaiting(
  state: CardRoomLifecyclePolicyState | null | undefined
): boolean {
  return state?.status === "waiting";
}

export function isCardRoomFinished(
  state: CardRoomLifecyclePolicyState | null | undefined
): boolean {
  return state?.status === "finished" || state?.status === "closed";
}

export function canEndCardRoom(
  state: CardRoomLifecyclePolicyState | null | undefined
): boolean {
  return Boolean(state && state.status !== "closed");
}

export function isCardRoomPublic(
  room: Pick<CardRoomLobbySummaryPolicyState, "visibility">
): boolean {
  return room.visibility === "public";
}

export function isCardRoomLobbyAvailable(
  room: CardRoomLifecyclePolicyState
): boolean {
  return isCardRoomWaiting(room);
}

export function matchesCardRoomLobbyFilter(
  room: CardRoomLobbySummaryPolicyState,
  selectedFilter: CardRoomLobbyFilter
): boolean {
  if (selectedFilter === CARD_ROOM_LOBBY_FILTER.ALL) {
    return true;
  }

  if (selectedFilter === CARD_ROOM_LOBBY_FILTER.PUBLIC) {
    return isCardRoomPublic(room);
  }

  return isCardRoomLobbyAvailable(room);
}

export function matchesCardRoomLobbySearchKeyword(
  room: CardRoomLobbySummaryPolicyState,
  normalizedKeyword: string
): boolean {
  return (
    normalizedKeyword.length === 0 ||
    room.title.toLowerCase().includes(normalizedKeyword) ||
    room.deckTitle.toLowerCase().includes(normalizedKeyword) ||
    room.hostLabel.toLowerCase().includes(normalizedKeyword)
  );
}

export function filterCardRoomLobbyRooms<
  T extends CardRoomLobbySummaryPolicyState,
>(
  rooms: readonly T[],
  selectedFilter: CardRoomLobbyFilter,
  searchKeyword: string
): T[] {
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  return rooms.filter(
    (room) =>
      matchesCardRoomLobbyFilter(room, selectedFilter) &&
      matchesCardRoomLobbySearchKeyword(room, normalizedKeyword)
  );
}

export function countCardRoomParticipantsByRole(
  participants: readonly CardRoomParticipantPolicyState[],
  role: CardRoomRole
): number {
  return participants.filter((participant) => participant.role === role).length;
}

export function getCardRoomParticipantRoleCounts(
  participants: readonly CardRoomParticipantPolicyState[]
): { memorizer: number; checker: number } {
  return {
    memorizer: countCardRoomParticipantsByRole(participants, "MEMORIZER"),
    checker: countCardRoomParticipantsByRole(participants, "CHECKER"),
  };
}

export function isCardRoomCurrentCardResolved(
  state: CardRoomStudyPolicyState | null | undefined
): boolean {
  return Boolean(state && state.currentCardResult !== null);
}

export function shouldShowCardRoomBack(
  state: CardRoomStudyPolicyState | null | undefined
): boolean {
  return (
    Boolean(state?.currentCardRevealed) || isCardRoomCurrentCardResolved(state)
  );
}

export function canMoveToNextCardRoomCard(
  state: CardRoomStudyPolicyState | null | undefined
): boolean {
  return isCardRoomCurrentCardResolved(state);
}

export function canStartCardRoom(
  state: CardRoomStartPolicyState | null | undefined,
  participant: CardRoomParticipantPolicyState | null | undefined
): boolean {
  if (!state || !participant || !isCardRoomWaiting(state)) {
    return false;
  }

  if (!participant.isHost || state.cards.length === 0) {
    return false;
  }

  const hasMemorizer = state.participants.some(
    (candidate) => candidate.role === "MEMORIZER"
  );
  const hasChecker = state.participants.some(
    (candidate) => candidate.role === "CHECKER"
  );
  const allReady = state.participants.every((candidate) => candidate.isReady);

  return hasMemorizer && hasChecker && allReady;
}

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
    currentCardRevealed: room.currentCardRevealed,
    currentCardResult: room.currentCardResult,
    participants: room.participants,
    cards: room.cards,
    messages: room.messages,
    results: room.results,
  };
}
