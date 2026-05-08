import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_LIST_SCOPES,
  type TypingDeckDetailResponse,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckListQuery,
} from "@yeon/api-contract/typing-decks";

import { DEFAULT_TYPING_DECKS } from "@/server/services/default-typing-decks";

function languageMatches(
  deckLanguage: TypingDeckLanguageTag,
  filter: TypingDeckLanguageTag | undefined,
) {
  if (!filter) {
    return true;
  }
  if (deckLanguage === filter) {
    return true;
  }
  return (
    deckLanguage === TYPING_DECK_LANGUAGE_TAGS.mixed &&
    (filter === TYPING_DECK_LANGUAGE_TAGS.ko ||
      filter === TYPING_DECK_LANGUAGE_TAGS.en)
  );
}

export function listDefaultTypingDecks(
  languageTag: TypingDeckLanguageTag | undefined,
): TypingDeckDto[] {
  return DEFAULT_TYPING_DECKS.filter((deck) =>
    languageMatches(deck.languageTag, languageTag),
  ).map((deck) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    languageTag: deck.languageTag,
    visibility: deck.visibility,
    source: deck.source,
    passageCount: deck.passages.length,
    isOwner: false,
    canEdit: false,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  }));
}

export function getDefaultTypingDeckDetail(
  deckId: string,
): TypingDeckDetailResponse | null {
  const deck = DEFAULT_TYPING_DECKS.find((item) => item.id === deckId);
  if (!deck) {
    return null;
  }
  return {
    deck: {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      languageTag: deck.languageTag,
      visibility: deck.visibility,
      source: deck.source,
      passageCount: deck.passages.length,
      isOwner: false,
      canEdit: false,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    },
    passages: deck.passages,
  };
}

export function shouldPrependDefaultTypingDecks(query: TypingDeckListQuery) {
  return (
    query.scope === TYPING_DECK_LIST_SCOPES.all ||
    (query.scope === TYPING_DECK_LIST_SCOPES.public && query.includeDefaults)
  );
}
