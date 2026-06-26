import { CardServiceApiError } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

type CardServiceQueryClient = {
  invalidateQueries: (options: { queryKey: readonly unknown[] }) => unknown;
};

type CardServiceAuthExpiredHandlingOptions = {
  queryClient: CardServiceQueryClient;
  markUnauthenticated: () => void;
  deckId?: string;
};

export function isCardServiceAuthExpiredError(
  error: unknown
): error is CardServiceApiError {
  return error instanceof CardServiceApiError && error.status === 401;
}

export function invalidateCardDeckQueries(
  queryClient: CardServiceQueryClient,
  isAuthenticated: boolean,
  deckId?: string
) {
  void queryClient.invalidateQueries({
    queryKey: cardServiceQueryKeys.decks(isAuthenticated),
  });

  if (deckId) {
    void queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
    });
  }
}

export function invalidateCardDeckAuthBoundaryQueries(
  queryClient: CardServiceQueryClient,
  deckId?: string
) {
  invalidateCardDeckQueries(queryClient, true, deckId);
  invalidateCardDeckQueries(queryClient, false, deckId);
}

export function handleCardServiceAuthExpiredMutationError(
  error: unknown,
  options: CardServiceAuthExpiredHandlingOptions
): boolean {
  if (!isCardServiceAuthExpiredError(error)) {
    return false;
  }

  options.markUnauthenticated();
  invalidateCardDeckAuthBoundaryQueries(options.queryClient, options.deckId);
  return true;
}

export async function withCardServiceAuthExpiredHandling<T>(
  run: () => Promise<T>,
  options: CardServiceAuthExpiredHandlingOptions
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    handleCardServiceAuthExpiredMutationError(error, options);
    throw error;
  }
}
