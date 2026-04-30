import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomDifficulty,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomStatus,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";

export const TYPING_ROOM_TEXT_TYPE_LABELS: Record<TypingRoomTextType, string> = {
  [TYPING_ROOM_TEXT_TYPE.SHORT]: "짧은 문장",
  [TYPING_ROOM_TEXT_TYPE.LONG]: "긴 글",
  [TYPING_ROOM_TEXT_TYPE.CODE]: "코드",
};

export const TYPING_ROOM_LANGUAGE_LABELS: Record<TypingRoomLanguage, string> = {
  [TYPING_ROOM_LANGUAGE.KO]: "한글",
  [TYPING_ROOM_LANGUAGE.EN]: "영어",
  [TYPING_ROOM_LANGUAGE.CODE]: "코드",
};

export const TYPING_ROOM_DIFFICULTY_LABELS: Record<TypingRoomDifficulty, string> = {
  [TYPING_ROOM_DIFFICULTY.EASY]: "쉬움",
  [TYPING_ROOM_DIFFICULTY.NORMAL]: "보통",
  [TYPING_ROOM_DIFFICULTY.HARD]: "어려움",
};

export const TYPING_ROOM_MODE_LABELS: Record<TypingRoomMode, string> = {
  [TYPING_ROOM_MODE.FINISH]: "완주 모드",
  [TYPING_ROOM_MODE.TIME_LIMIT]: "시간 제한",
};

export const TYPING_ROOM_VISIBILITY_LABELS: Record<TypingRoomVisibility, string> = {
  [TYPING_ROOM_VISIBILITY.PUBLIC]: "공개",
  [TYPING_ROOM_VISIBILITY.PRIVATE]: "비공개",
};

export const TYPING_ROOM_STATUS_LABELS: Record<TypingRoomStatus, string> = {
  [TYPING_ROOM_STATUS.WAITING]: "대기중",
  [TYPING_ROOM_STATUS.COUNTDOWN]: "카운트다운",
  [TYPING_ROOM_STATUS.LIVE]: "진행중",
  [TYPING_ROOM_STATUS.FINISHED]: "종료",
};
