export const cardServiceQueryKeys = {
  all: ["card-service"] as const,
  deck: (deckId: string, isSignedIn: boolean) =>
    ["card-service", "deck", isSignedIn ? "server" : "guest", deckId] as const,
  decks: (isSignedIn: boolean) =>
    ["card-service", "decks", isSignedIn ? "server" : "guest"] as const,
};
