import { describe, expect, it } from "vitest";

import {
  canMoveToNextCardRoomCard,
  canStartCardRoom,
  findCardRoomParticipant,
  isCardRoomFinished,
  isCardRoomWaiting,
  shouldShowCardRoomBack,
  type CardRoomParticipantPolicyState,
  type CardRoomStartPolicyState,
  type CardRoomStudyPolicyState,
} from "./card-room";

const host: CardRoomParticipantPolicyState = {
  id: "host",
  role: "MEMORIZER",
  isHost: true,
  isReady: true,
};

const checker: CardRoomParticipantPolicyState = {
  id: "checker",
  role: "CHECKER",
  isHost: false,
  isReady: true,
};

function startState(
  overrides: Partial<CardRoomStartPolicyState> = {}
): CardRoomStartPolicyState {
  return {
    status: "waiting",
    cards: [{ id: "card-1" }],
    participants: [host, checker],
    ...overrides,
  };
}

function studyState(
  overrides: Partial<CardRoomStudyPolicyState> = {}
): CardRoomStudyPolicyState {
  return {
    status: "in_progress",
    currentCardRevealed: false,
    currentCardResult: null,
    ...overrides,
  };
}

describe("card room policy state machine", () => {
  it("finds the current participant without inventing a fallback role", () => {
    expect(findCardRoomParticipant([host], "host")).toBe(host);
    expect(findCardRoomParticipant([host], "missing")).toBeNull();
    expect(findCardRoomParticipant([host], null)).toBeNull();
  });

  it("starts only in waiting state with host, cards, both roles, and all participants ready", () => {
    expect(canStartCardRoom(startState(), host)).toBe(true);
    expect(canStartCardRoom(startState(), checker)).toBe(false);
    expect(canStartCardRoom(startState({ cards: [] }), host)).toBe(false);
    expect(canStartCardRoom(startState({ participants: [host] }), host)).toBe(
      false
    );
    expect(
      canStartCardRoom(
        startState({
          participants: [host, { ...checker, role: "UNASSIGNED" }],
        }),
        host
      )
    ).toBe(false);
    expect(
      canStartCardRoom(
        startState({
          participants: [host, { ...checker, isReady: false }],
        }),
        host
      )
    ).toBe(false);
    expect(canStartCardRoom(startState({ status: "in_progress" }), host)).toBe(
      false
    );
  });

  it("keeps waiting and terminal room lifecycle checks explicit", () => {
    expect(isCardRoomWaiting({ status: "waiting" })).toBe(true);
    expect(isCardRoomWaiting({ status: "finished" })).toBe(false);
    expect(isCardRoomFinished({ status: "finished" })).toBe(true);
    expect(isCardRoomFinished({ status: "closed" })).toBe(true);
    expect(isCardRoomFinished({ status: "waiting" })).toBe(false);
  });

  it("shows the back side when the current card is revealed or resolved", () => {
    expect(shouldShowCardRoomBack(studyState())).toBe(false);
    expect(
      shouldShowCardRoomBack(studyState({ currentCardRevealed: true }))
    ).toBe(true);
    expect(
      shouldShowCardRoomBack(studyState({ currentCardResult: "OK" }))
    ).toBe(true);
  });

  it("moves to the next card only after the current card has a result", () => {
    expect(canMoveToNextCardRoomCard(studyState())).toBe(false);
    expect(
      canMoveToNextCardRoomCard(studyState({ currentCardResult: "OK" }))
    ).toBe(true);
  });
});
