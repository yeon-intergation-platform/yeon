import { eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { typingCharacterFrameOverrides } from "@/server/db/schema";
import type { FrameSlot } from "@/features/typing-service/frame-slot";

export async function listCharacterFrameOverrides() {
  const rows = await getDb().select().from(typingCharacterFrameOverrides);
  return rows.map((row) => ({
    characterId: row.characterId,
    frameSlots: row.frameSlots as FrameSlot[],
  }));
}

export async function upsertCharacterFrameOverride(
  characterId: string,
  frameSlots: FrameSlot[],
  updatedByUserId: string
) {
  const [row] = await getDb()
    .insert(typingCharacterFrameOverrides)
    .values({
      characterId,
      frameSlots,
      updatedByUserId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: typingCharacterFrameOverrides.characterId,
      set: { frameSlots, updatedByUserId, updatedAt: new Date() },
    })
    .returning();
  return row
    ? {
        characterId: row.characterId,
        frameSlots: row.frameSlots as FrameSlot[],
      }
    : null;
}

export async function deleteCharacterFrameOverride(characterId: string) {
  await getDb()
    .delete(typingCharacterFrameOverrides)
    .where(eq(typingCharacterFrameOverrides.characterId, characterId));
}
