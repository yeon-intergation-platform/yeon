import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { typingDecks } from "./typing-decks";

export const typingDeckPassages = pgTable(
  "typing_deck_passages",
  {
    id: bigint("id", { mode: "bigint" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    publicId: text("public_id").notNull().unique(),
    deckId: bigint("deck_id", { mode: "bigint" })
      .notNull()
      .references(() => typingDecks.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }),
    prompt: text("prompt").notNull(),
    textType: varchar("text_type", { length: 16 }).notNull(),
    difficulty: varchar("difficulty", { length: 16 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("typing_deck_passages_deck_order_idx").on(
      table.deckId,
      table.sortOrder,
    ),
    index("typing_deck_passages_deck_created_at_idx").on(
      table.deckId,
      table.createdAt,
    ),
  ],
);
