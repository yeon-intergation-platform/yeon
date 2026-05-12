import type { TypingDeckListScope as TypingDeckScope } from "@yeon/api-contract/typing-decks";

export const typingServiceQueryKeys = {
  characterFrames: () => ["typing-character-frames"] as const,
  activeCharacterFrameOverrides: () =>
    ["typing-service", "character-frames", "active-overrides"] as const,
  publicWaitingRooms: () =>
    ["typing-service", "room-lobby", "public-waiting"] as const,
  deckLists: () => ["typing-decks"] as const,
  deckList: (scope: TypingDeckScope, adminMode = false) =>
    [
      ...typingServiceQueryKeys.deckLists(),
      scope,
      adminMode ? "admin" : "user",
    ] as const,
  deckDetailRoot: (deckId: string | null) => ["typing-deck", deckId] as const,
  deckDetail: (deckId: string | null, adminMode = false) =>
    [
      ...typingServiceQueryKeys.deckDetailRoot(deckId),
      adminMode ? "admin" : "user",
    ] as const,
};
