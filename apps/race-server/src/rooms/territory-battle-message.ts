import type { TerritoryBattleSubmitWordMessage } from "@yeon/race-shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseTerritoryBattleSubmitWordMessage(
  payload: unknown
): TerritoryBattleSubmitWordMessage | null {
  if (!isRecord(payload) || typeof payload.word !== "string") return null;

  return {
    word: payload.word,
    cellId: typeof payload.cellId === "string" ? payload.cellId : undefined,
    submittedAt:
      typeof payload.submittedAt === "number" ? payload.submittedAt : undefined,
  };
}
