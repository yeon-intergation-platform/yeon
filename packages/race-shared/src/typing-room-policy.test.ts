import { describe, expect, it } from "vitest";

import {
  canShowTypingRoomResults,
  canEditTypingRoomSettings,
  canSendTypingRoomLobbyChat,
  canStartTypingRoom,
  canSwitchTypingRoomTeam,
  canToggleTypingRoomReady,
  findTypingRoomParticipant,
  isRetryableTypingRoomConnectionState,
  isTypingRoomTerminal,
  isTypingRoomWaiting,
  resolveTypingRoomDisconnectAction,
  shouldRetrySameTypingRaceSeed,
  TYPING_ROOM_DISCONNECT_ACTION,
  TYPING_ROOM_GAME_TYPE,
  type TypingResultSnapshot,
  type TypingRoomLobbyPolicyState,
  type TypingRoomParticipantPolicyState,
} from "./typing-race";

const host: TypingRoomParticipantPolicyState = {
  id: "host",
  role: "host",
  isReady: true,
  team: "red",
};

const guest: TypingRoomParticipantPolicyState = {
  id: "guest",
  role: "guest",
  isReady: false,
  team: "blue",
};

function room(
  overrides: Partial<TypingRoomLobbyPolicyState> = {}
): TypingRoomLobbyPolicyState {
  return {
    status: "waiting",
    canStart: true,
    gameType: TYPING_ROOM_GAME_TYPE.STANDARD,
    participants: [host, guest],
    ...overrides,
  };
}

function result(overrides: Partial<TypingResultSnapshot> = {}) {
  return {
    userId: "guest",
    label: "Guest",
    cpm: 320,
    wpm: 64,
    accuracy: 98,
    mistakeCount: 1,
    elapsedTimeMs: 15_000,
    score: 314,
    rank: 1,
    finishedAt: 1_000,
    ...overrides,
  } satisfies TypingResultSnapshot;
}

describe("typing room lobby policy state machine", () => {
  it("finds the current participant without a fallback identity", () => {
    expect(findTypingRoomParticipant([host], "host")).toBe(host);
    expect(findTypingRoomParticipant([host], "missing")).toBeNull();
    expect(findTypingRoomParticipant([host], null)).toBeNull();
  });

  it("keeps waiting and terminal lifecycle checks explicit", () => {
    expect(isTypingRoomWaiting(room())).toBe(true);
    expect(isTypingRoomWaiting(room({ status: "live" }))).toBe(false);
    expect(isTypingRoomTerminal(room({ status: "finished" }))).toBe(true);
    expect(isTypingRoomTerminal(room({ status: "closed" }))).toBe(true);
    expect(isTypingRoomTerminal(room())).toBe(false);
  });

  it("allows settings edits only for the host while waiting", () => {
    expect(canEditTypingRoomSettings(room(), host)).toBe(true);
    expect(canEditTypingRoomSettings(room(), guest)).toBe(false);
    expect(canEditTypingRoomSettings(room({ status: "live" }), host)).toBe(
      false
    );
    expect(canEditTypingRoomSettings(room(), null)).toBe(false);
  });

  it("allows ready toggles only while waiting and after participant identity is known", () => {
    expect(canToggleTypingRoomReady(room(), guest)).toBe(true);
    expect(canToggleTypingRoomReady(room({ status: "live" }), guest)).toBe(
      false
    );
    expect(canToggleTypingRoomReady(room(), null)).toBe(false);
  });

  it("allows team switching only in territory waiting rooms", () => {
    expect(
      canSwitchTypingRoomTeam(
        room({ gameType: TYPING_ROOM_GAME_TYPE.TERRITORY }),
        guest
      )
    ).toBe(true);
    expect(canSwitchTypingRoomTeam(room(), guest)).toBe(false);
    expect(
      canSwitchTypingRoomTeam(
        room({ gameType: TYPING_ROOM_GAME_TYPE.TERRITORY, status: "live" }),
        guest
      )
    ).toBe(false);
  });

  it("starts only when the host is in a waiting room whose server snapshot canStart is true", () => {
    expect(canStartTypingRoom(room(), host)).toBe(true);
    expect(canStartTypingRoom(room(), guest)).toBe(false);
    expect(canStartTypingRoom(room({ canStart: false }), host)).toBe(false);
    expect(canStartTypingRoom(room({ status: "live" }), host)).toBe(false);
  });

  it("sends lobby chat only while waiting with nonblank content under the max length", () => {
    expect(canSendTypingRoomLobbyChat(room(), " hello ", 10)).toBe(true);
    expect(canSendTypingRoomLobbyChat(room(), "   ", 10)).toBe(false);
    expect(canSendTypingRoomLobbyChat(room(), "too long", 3)).toBe(false);
    expect(
      canSendTypingRoomLobbyChat(room({ status: "live" }), "hello", 10)
    ).toBe(false);
  });

  it("separates retryable connection states from transient and successful states", () => {
    expect(isRetryableTypingRoomConnectionState("error")).toBe(true);
    expect(isRetryableTypingRoomConnectionState("disconnected")).toBe(true);
    expect(isRetryableTypingRoomConnectionState("connecting")).toBe(false);
    expect(isRetryableTypingRoomConnectionState("connected")).toBe(false);
    expect(isRetryableTypingRoomConnectionState("idle")).toBe(false);
  });

  it("retries the same remote seed only when the signed passage repeats", () => {
    expect(
      shouldRetrySameTypingRaceSeed({
        seedToken: "signed",
        passageId: "p1",
        excludedPassageId: "p1",
      })
    ).toBe(true);
    expect(
      shouldRetrySameTypingRaceSeed({
        seedToken: null,
        passageId: "p1",
        excludedPassageId: "p1",
      })
    ).toBe(false);
    expect(
      shouldRetrySameTypingRaceSeed({
        seedToken: "signed",
        passageId: "p2",
        excludedPassageId: "p1",
      })
    ).toBe(false);
  });

  it("shows results only after the current participant has a result or the room is finished", () => {
    expect(
      canShowTypingRoomResults(
        { status: "live", results: [result({ userId: "guest" })] },
        "guest"
      )
    ).toBe(true);
    expect(
      canShowTypingRoomResults(
        { status: "live", results: [result({ userId: "guest" })] },
        "host"
      )
    ).toBe(false);
    expect(
      canShowTypingRoomResults({ status: "finished", results: [] }, "host")
    ).toBe(true);
    expect(canShowTypingRoomResults(null, "host")).toBe(false);
  });

  it("resolves leave and reconnect cleanup actions without mixing explicit leave and network loss", () => {
    expect(
      resolveTypingRoomDisconnectAction({
        isExplicitLeave: true,
        lobbyMode: true,
        hasParticipant: true,
        hasParticipantId: true,
      })
    ).toBe(TYPING_ROOM_DISCONNECT_ACTION.REFRESH_LIFECYCLE);
    expect(
      resolveTypingRoomDisconnectAction({
        isExplicitLeave: false,
        lobbyMode: true,
        hasParticipant: true,
        hasParticipantId: true,
      })
    ).toBe(TYPING_ROOM_DISCONNECT_ACTION.SCHEDULE_RECONNECT_CLEANUP);
    expect(
      resolveTypingRoomDisconnectAction({
        isExplicitLeave: false,
        lobbyMode: false,
        hasParticipant: false,
        hasParticipantId: true,
      })
    ).toBe(TYPING_ROOM_DISCONNECT_ACTION.REMOVE_PARTICIPANT);
    expect(
      resolveTypingRoomDisconnectAction({
        isExplicitLeave: false,
        lobbyMode: false,
        hasParticipant: false,
        hasParticipantId: false,
      })
    ).toBe(TYPING_ROOM_DISCONNECT_ACTION.SYNC_ONLY);
  });
});
