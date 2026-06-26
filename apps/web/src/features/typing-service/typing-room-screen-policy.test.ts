import { describe, expect, it } from "vitest";
import {
  TYPING_ROOM_PARTICIPANT_ROLE,
  type TypingRoomParticipantSnapshot,
} from "@yeon/race-shared";
import {
  buildTypingRoomInviteCopyError,
  buildTypingRoomParticipantSlots,
  getTypingRoomEntryEventName,
  isTypingRoomCreateMode,
  isTypingRoomJoinMode,
  orderTypingRoomParticipants,
} from "./typing-room-screen-policy";

function participant(
  id: string,
  role: TypingRoomParticipantSnapshot["role"]
): TypingRoomParticipantSnapshot {
  return {
    id,
    label: id,
    role,
    isReady: false,
    progress: 0,
    cpm: 0,
    wpm: 0,
    accuracy: 100,
    mistakeCount: 0,
    elapsedTimeMs: 0,
    finishedAt: null,
    score: 0,
    rank: null,
  };
}

describe("typing room screen policy", () => {
  it("names route modes through helpers", () => {
    expect(isTypingRoomCreateMode("create")).toBe(true);
    expect(isTypingRoomJoinMode("join")).toBe(true);
    expect(getTypingRoomEntryEventName("create")).toBe("room_created");
    expect(getTypingRoomEntryEventName("join")).toBe("room_joined");
  });

  it("orders host first and pads empty participant slots", () => {
    const guest = participant("guest", TYPING_ROOM_PARTICIPANT_ROLE.GUEST);
    const host = participant("host", TYPING_ROOM_PARTICIPANT_ROLE.HOST);

    expect(orderTypingRoomParticipants([guest, host])).toEqual([host, guest]);
    expect(buildTypingRoomParticipantSlots([guest, host], 4)).toEqual([
      host,
      guest,
      null,
      null,
    ]);
  });

  it("adds invite link length to copy failure diagnostics", () => {
    expect(
      buildTypingRoomInviteCopyError("https://yeon.world/r", "복사 불가")
        .message
    ).toBe("복사 불가 초대 링크 길이: 20자.");
  });
});
