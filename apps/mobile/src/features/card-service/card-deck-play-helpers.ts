import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
} from "./card-service-session";

export const CARD_DECK_PLAY_OPERATION = {
  detail: "카드 학습 상세 조회",
  guestDetail: "비회원 카드 학습 상세 조회",
  review: "카드 복습 저장",
} as const;

export type CardDeckPlayOperation =
  (typeof CARD_DECK_PLAY_OPERATION)[keyof typeof CARD_DECK_PLAY_OPERATION];

export class CardDeckPlayInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardDeckPlayInputError";
  }
}

export function getModeBadge(mode: CardServiceMode): string {
  return mode === CARD_SERVICE_MODE.server
    ? CARD_SERVICE_TEXT.play.modeAuthenticatedLabel
    : CARD_SERVICE_TEXT.play.modeGuestLabel;
}

export function requirePlayDeckId(
  deckId: string | undefined,
  operation: CardDeckPlayOperation
): string {
  const normalizedDeckId = deckId?.trim();
  if (!normalizedDeckId) {
    throw new CardDeckPlayInputError(
      `${operation}를 실행할 수 없습니다. 화면 경로에 덱 ID가 없습니다.`
    );
  }
  return normalizedDeckId;
}
