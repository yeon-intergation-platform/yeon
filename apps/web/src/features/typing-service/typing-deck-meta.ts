import {
  TYPING_DECK_LANGUAGE_OPTIONS,
  TYPING_DECK_VISIBILITY_OPTIONS,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckScope,
  type TypingDeckVisibility,
} from "./use-typing-decks";

export type TypingDeckScopeTab = {
  value: TypingDeckScope;
  label: string;
  help: string;
};

export const TYPING_DECK_SCOPE_TABS: TypingDeckScopeTab[] = [
  {
    value: "default",
    label: "기본 덱",
    help: "YEON이 제공하는 읽기 전용 문단",
  },
  { value: "mine", label: "내 덱", help: "직접 만든 비공개/공개 덱" },
  { value: "public", label: "공개 덱", help: "다른 사용자가 공개한 덱" },
];

function getOptionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function typingDeckLanguageLabel(languageTag: TypingDeckLanguageTag) {
  return getOptionLabel(TYPING_DECK_LANGUAGE_OPTIONS, languageTag);
}

export function typingDeckVisibilityLabel(visibility: TypingDeckVisibility) {
  return getOptionLabel(TYPING_DECK_VISIBILITY_OPTIONS, visibility);
}

export function typingDeckBadge(deck: TypingDeckDto) {
  if (deck.source === "default") {
    return "기본";
  }
  return typingDeckVisibilityLabel(deck.visibility);
}
