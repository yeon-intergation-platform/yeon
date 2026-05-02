import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const typingCharacterFrameOverrides = pgTable(
  "typing_character_frame_overrides",
  {
    characterId: text("character_id").primaryKey(),
    frameSlots: jsonb("frame_slots").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedByUserId: uuid("updated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  }
);
