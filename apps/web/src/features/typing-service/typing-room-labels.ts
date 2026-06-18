import {
  type TypingRoomDifficulty,
  type TypingRoomGameType,
  type TypingRoomLifecycle,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomStatus,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import {
  TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE,
  TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE,
  TYPING_ROOM_LIFECYCLE_LABELS_BY_LOCALE,
  TYPING_ROOM_MODE_LABELS_BY_LOCALE,
  TYPING_ROOM_STATUS_LABELS_BY_LOCALE,
  TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE,
} from "./typing-service-i18n";

export const TYPING_ROOM_TEXT_TYPE_LABELS: Record<TypingRoomTextType, string> =
  TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE.ko;

export const TYPING_ROOM_LANGUAGE_LABELS: Record<TypingRoomLanguage, string> = {
  ...TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE.ko,
};

export const TYPING_ROOM_DIFFICULTY_LABELS: Record<
  TypingRoomDifficulty,
  string
> = TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE.ko;

export const TYPING_ROOM_MODE_LABELS: Record<TypingRoomMode, string> = {
  ...TYPING_ROOM_MODE_LABELS_BY_LOCALE.ko,
};

export const TYPING_ROOM_GAME_TYPE_LABELS: Record<TypingRoomGameType, string> =
  TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE.ko;

export const TYPING_ROOM_VISIBILITY_LABELS: Record<
  TypingRoomVisibility,
  string
> = TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE.ko;

export const TYPING_ROOM_STATUS_LABELS: Record<TypingRoomStatus, string> = {
  ...TYPING_ROOM_STATUS_LABELS_BY_LOCALE.ko,
};

export const TYPING_ROOM_LIFECYCLE_LABELS: Record<TypingRoomLifecycle, string> =
  TYPING_ROOM_LIFECYCLE_LABELS_BY_LOCALE.ko;
