import { getCardServiceCauseMessage } from "../error-message";

const CARD_ROOM_NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "load failed",
  "econnrefused",
] as const;

export function normalizeCardRoomConnectionError(error: unknown) {
  const message = getCardServiceCauseMessage(error);
  const lower = message.toLowerCase();
  if (CARD_ROOM_NETWORK_ERROR_PATTERNS.some((p) => lower.includes(p))) {
    return "카드방 연결에 실패했습니다. 잠시 후 다시 입장해 주세요.";
  }
  return message || "카드방에 연결하지 못했습니다.";
}
