import { describe, expect, it, vi } from "vitest";
import { CardServiceApiError } from "../card-service-fetch";
import {
  handleCardServiceAuthExpiredMutationError,
  invalidateCardDeckAuthBoundaryQueries,
  withCardServiceAuthExpiredHandling,
} from "./card-service-mutation-policy";

function createQueryClient() {
  return {
    invalidateQueries: vi.fn(),
  };
}

describe("card-service mutation policy", () => {
  it("인증 경계 invalidation은 server/guest list와 detail을 함께 무효화한다", () => {
    const queryClient = createQueryClient();

    invalidateCardDeckAuthBoundaryQueries(queryClient, "deck-1");

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["card-service", "decks", "server"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["card-service", "decks", "server", "deck-1"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["card-service", "decks", "guest"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["card-service", "decks", "guest", "deck-1"],
    });
  });

  it("401 CardServiceApiError만 인증 만료 처리한다", () => {
    const queryClient = createQueryClient();
    const markUnauthenticated = vi.fn();

    expect(
      handleCardServiceAuthExpiredMutationError(
        new CardServiceApiError(401, "로그인 만료"),
        { queryClient, markUnauthenticated, deckId: "deck-1" }
      )
    ).toBe(true);
    expect(markUnauthenticated).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4);

    expect(
      handleCardServiceAuthExpiredMutationError(
        new CardServiceApiError(403, "권한 없음"),
        { queryClient, markUnauthenticated, deckId: "deck-1" }
      )
    ).toBe(false);
    expect(markUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("run 실패 원인은 보존하면서 401 cleanup을 실행한다", async () => {
    const queryClient = createQueryClient();
    const markUnauthenticated = vi.fn();
    const error = new CardServiceApiError(401, "로그인 만료");

    await expect(
      withCardServiceAuthExpiredHandling(
        async () => {
          throw error;
        },
        { queryClient, markUnauthenticated, deckId: "deck-1" }
      )
    ).rejects.toBe(error);

    expect(markUnauthenticated).toHaveBeenCalledTimes(1);
  });
});
