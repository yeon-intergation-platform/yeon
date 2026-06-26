import { describe, expect, it } from "vitest";

import { resolveMergeGuestCleanupPublicIds } from "./use-merge-guest";

describe("merge guest deck cleanup policy", () => {
  it("clears only the dumped guest snapshot when server created every deck", () => {
    expect(
      resolveMergeGuestCleanupPublicIds({ createdDeckCount: 2 }, [
        "guest-a",
        "guest-b",
      ])
    ).toEqual(["guest-a", "guest-b"]);
  });

  it("keeps local guest decks when the server result is partial or ambiguous", () => {
    expect(
      resolveMergeGuestCleanupPublicIds({ createdDeckCount: 1 }, [
        "guest-a",
        "guest-b",
      ])
    ).toEqual([]);
  });
});
