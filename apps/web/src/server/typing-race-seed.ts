import { createHmac, randomInt } from "node:crypto";
import {
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  type TypingDeckDetailResponse,
  type TypingDeckPassageDto,
  type TypingRaceSeedDto,
} from "@yeon/api-contract/typing-decks";
import { ServiceError } from "@/server/errors/service-error";

const PRIVATE_DECK_LOBBY_TITLE = "비공개 덱";
const TYPING_RACE_SEED_FALLBACK_SECRET = "yeon-local-typing-race-seed-secret";

type UnsignedTypingRaceSeed = Omit<TypingRaceSeedDto, "seedToken">;

function pickPassage(
  passages: TypingDeckPassageDto[],
  requestedPassageId: string | undefined
) {
  if (requestedPassageId) {
    const requested = passages.find(
      (passage) => passage.id === requestedPassageId
    );
    if (!requested) {
      throw new ServiceError(404, "연습 문장을 찾지 못했습니다.");
    }
    return requested;
  }

  if (passages.length === 0) {
    throw new ServiceError(400, "덱에 연습 문장이 없습니다.");
  }

  return passages[randomInt(passages.length)]!;
}

function getTypingRaceSeedSigningSecret() {
  return (
    process.env.TYPING_RACE_SEED_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    TYPING_RACE_SEED_FALLBACK_SECRET
  );
}

function raceSeedSigningPayload(seed: UnsignedTypingRaceSeed) {
  return JSON.stringify({
    passageId: seed.passageId,
    prompt: seed.prompt,
    roundLabel: seed.roundLabel,
    deckId: seed.deckId,
    deckVisibility: seed.deckVisibility,
    lobbyDeckTitle: seed.lobbyDeckTitle,
    participantDeckTitle: seed.participantDeckTitle,
    languageTag: seed.languageTag,
  });
}

function signTypingRaceSeed(seed: UnsignedTypingRaceSeed) {
  const digest = createHmac("sha256", getTypingRaceSeedSigningSecret())
    .update(raceSeedSigningPayload(seed))
    .digest("base64url");
  return `v1.${digest}`;
}

export function createTypingRaceSeedFromDetail(
  detail: TypingDeckDetailResponse,
  requestedPassageId: string | undefined
): TypingRaceSeedDto {
  const passage = pickPassage(detail.passages, requestedPassageId);
  const seed: UnsignedTypingRaceSeed = {
    passageId: passage.id,
    prompt: passage.prompt,
    roundLabel: passage.title ?? detail.deck.title,
    deckId: detail.deck.id,
    deckVisibility:
      detail.deck.source === TYPING_DECK_SOURCE.default
        ? TYPING_DECK_SOURCE.default
        : detail.deck.visibility,
    lobbyDeckTitle:
      detail.deck.visibility === TYPING_DECK_VISIBILITY.private
        ? PRIVATE_DECK_LOBBY_TITLE
        : detail.deck.title,
    participantDeckTitle: detail.deck.title,
    languageTag: detail.deck.languageTag,
  };

  return {
    ...seed,
    seedToken: signTypingRaceSeed(seed),
  };
}
