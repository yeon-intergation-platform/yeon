import {
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  TYPING_PASSAGE_DIFFICULTIES,
  TYPING_PASSAGE_TEXT_TYPES,
  type TypingDeckDto,
  type TypingDeckPassageDto,
} from "@yeon/api-contract/typing-decks";
import { DEFAULT_TYPING_DECK_SOURCES } from "./default-typing-deck-sources";

export type DefaultTypingDeck = Omit<
  TypingDeckDto,
  "passageCount" | "isOwner" | "canEdit" | "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  passages: TypingDeckPassageDto[];
};

const STATIC_DEFAULT_CREATED_AT = "2026-05-01T00:00:00.000Z";

function passageTextType(prompt: string) {
  return prompt.length >= 180
    ? TYPING_PASSAGE_TEXT_TYPES.long
    : TYPING_PASSAGE_TEXT_TYPES.short;
}

function passageDifficulty(prompt: string) {
  if (prompt.length < 90) {
    return TYPING_PASSAGE_DIFFICULTIES.easy;
  }
  if (prompt.length >= 180) {
    return TYPING_PASSAGE_DIFFICULTIES.hard;
  }
  return TYPING_PASSAGE_DIFFICULTIES.normal;
}

export const DEFAULT_TYPING_DECKS: readonly DefaultTypingDeck[] =
  DEFAULT_TYPING_DECK_SOURCES.map((deck) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    languageTag: deck.languageTag,
    visibility: TYPING_DECK_VISIBILITY.public,
    source: TYPING_DECK_SOURCE.default,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
    passages: deck.passages.map((passage, index) => ({
      id: passage.id,
      title: passage.title,
      prompt: passage.prompt,
      textType: passageTextType(passage.prompt),
      difficulty: passageDifficulty(passage.prompt),
      sortOrder: index,
      createdAt: STATIC_DEFAULT_CREATED_AT,
      updatedAt: STATIC_DEFAULT_CREATED_AT,
    })),
  }));
