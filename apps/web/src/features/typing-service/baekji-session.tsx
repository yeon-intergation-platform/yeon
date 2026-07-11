"use client";

import { BaekjiSessionView } from "./baekji-session-view";
import { useBaekjiSession } from "./use-baekji-session";

export function BaekjiSession({ deckId }: { deckId: string | null }) {
  const state = useBaekjiSession(deckId);
  return <BaekjiSessionView deckId={deckId} state={state} />;
}
