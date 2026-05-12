export const cardServiceQueryKeys = {
  decks: (isAuthenticated: boolean) =>
    ["card-decks", isAuthenticated ? "server" : "guest"] as const,
  deckDetail: (isAuthenticated: boolean, deckId: string) =>
    ["card-decks", isAuthenticated ? "server" : "guest", deckId] as const,
};
