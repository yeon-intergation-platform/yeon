import {
  isTypingRoomGuestParticipant,
  isTypingRoomHostParticipant,
  type TypingRoomParticipantSnapshot,
} from "@yeon/race-shared";

export const TYPING_ROOM_SCREEN_MODE = {
  CREATE: "create",
  JOIN: "join",
} as const;

export type TypingRoomScreenMode =
  (typeof TYPING_ROOM_SCREEN_MODE)[keyof typeof TYPING_ROOM_SCREEN_MODE];

export type TypingRoomParticipantSlot = TypingRoomParticipantSnapshot | null;

export function isTypingRoomCreateMode(mode: TypingRoomScreenMode): boolean {
  return mode === TYPING_ROOM_SCREEN_MODE.CREATE;
}

export function isTypingRoomJoinMode(mode: TypingRoomScreenMode): boolean {
  return mode === TYPING_ROOM_SCREEN_MODE.JOIN;
}

export function buildTypingRoomInviteCopyError(
  inviteUrl: string,
  unsupportedMessage: string
): Error {
  return new Error(
    `${unsupportedMessage} 초대 링크 길이: ${inviteUrl.length}자.`
  );
}

export function getTypingRoomEntryEventName(
  mode: TypingRoomScreenMode
): "room_created" | "room_joined" {
  return isTypingRoomCreateMode(mode) ? "room_created" : "room_joined";
}

export function orderTypingRoomParticipants(
  participants: readonly TypingRoomParticipantSnapshot[]
): TypingRoomParticipantSnapshot[] {
  const host = participants.find(isTypingRoomHostParticipant);
  const guests = participants.filter(isTypingRoomGuestParticipant);
  const others = participants.filter(
    (participant) =>
      !isTypingRoomHostParticipant(participant) &&
      !isTypingRoomGuestParticipant(participant)
  );

  return host ? [host, ...guests, ...others] : [...participants];
}

export function buildTypingRoomParticipantSlots(
  participants: readonly TypingRoomParticipantSnapshot[],
  maxParticipants: number
): TypingRoomParticipantSlot[] {
  const ordered = orderTypingRoomParticipants(participants);
  const maxSlots = Math.max(maxParticipants, 0);
  const padded = Array.from(
    { length: Math.max(maxSlots - ordered.length, 0) },
    () => null
  );

  return [...ordered, ...padded].slice(0, maxSlots);
}
