import { describe, expect, it } from "vitest";

import {
  canEditTypingRoomSettings,
  canSendTypingRoomLobbyChat,
  canStartTypingRoom,
  canSwitchTypingRoomTeam,
  canToggleTypingRoomReady,
  findTypingRoomParticipant,
  isTypingRoomTerminal,
  isTypingRoomWaiting,
  TYPING_ROOM_GAME_TYPE,
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
});
