export const STAR_LOBBY_ROOM_NAME = "star_lobby" as const;

export const STAR_LOBBY_EVENTS = {
  SUBSCRIBE: "star-lobby.subscribe",
  ROOM_OBSERVED: "star-lobby.room_observed",
  ROOM_DISAPPEARED: "star-lobby.room_disappeared",
  ALERT_MATCHED: "star-lobby.alert_matched",
  ERROR: "star-lobby.error",
} as const;

export const STAR_LOBBY_LIVE_EVENT_TYPE = {
  ROOM_OBSERVED: "room_observed",
  ROOM_DISAPPEARED: "room_disappeared",
  ALERT_MATCHED: "alert_matched",
} as const;

export type StarLobbyLiveEventType =
  (typeof STAR_LOBBY_LIVE_EVENT_TYPE)[keyof typeof STAR_LOBBY_LIVE_EVENT_TYPE];

export type StarLobbyRoomStatus = "observed" | "disappeared";
export type StarLobbyAlertMatchStatus = "matched" | "suppressed";

export type StarLobbyRoomDto = {
  id: string;
  title: string;
  currentPlayers: number | null;
  maxPlayers: number | null;
  status: StarLobbyRoomStatus;
  observedAt: string;
  lastSeenAt: string;
  disappearedAt: string | null;
  matchedKeywords: string[];
  rawText: string | null;
};

export type StarLobbyAlertRuleDto = {
  id: string;
  name: string;
  includeKeywords: string[];
  excludeKeywords: string[];
  minPlayers: number | null;
  maxPlayers: number | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StarLobbyAlertMatchDto = {
  id: string;
  ruleId: string;
  roomId: string;
  status: StarLobbyAlertMatchStatus;
  matchedKeyword: string | null;
  suppressedKeyword: string | null;
  matchedAt: string;
};

export type StarLobbyRealtimeRecipient = {
  ownerUserId?: string | null;
  guestSessionId?: string | null;
};

export type StarLobbyRealtimeJoinOptions = StarLobbyRealtimeRecipient & {
  includeKeywords?: string[];
  excludeKeywords?: string[];
};

export type StarLobbySubscribeMessage = {
  includeKeywords?: string[];
  excludeKeywords?: string[];
};

export type StarLobbyRoomObservedEvent = {
  type: typeof STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED;
  room: StarLobbyRoomDto;
};

export type StarLobbyRoomDisappearedEvent = {
  type: typeof STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED;
  room: StarLobbyRoomDto;
};

export type StarLobbyAlertMatchedEvent = {
  type: typeof STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED;
  room: StarLobbyRoomDto;
  match: StarLobbyAlertMatchDto;
  rule: StarLobbyAlertRuleDto;
  recipient?: StarLobbyRealtimeRecipient;
};

export type StarLobbyRealtimeEvent =
  | StarLobbyRoomObservedEvent
  | StarLobbyRoomDisappearedEvent
  | StarLobbyAlertMatchedEvent;
