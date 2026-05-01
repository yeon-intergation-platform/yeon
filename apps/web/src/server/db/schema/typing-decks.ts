import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const typingDecks = pgTable(
  "typing_decks",
  {
    id: bigint("id", { mode: "bigint" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    publicId: text("public_id").notNull().unique(),
    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    languageTag: varchar("language_tag", { length: 16 }).notNull(),
    visibility: varchar("visibility", { length: 16 }).notNull(),
    source: varchar("source", { length: 16 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("typing_decks_owner_created_at_idx").on(
      table.ownerUserId,
      table.createdAt,
    ),
    index("typing_decks_visibility_source_language_idx").on(
      table.visibility,
      table.source,
      table.languageTag,
    ),
    index("typing_decks_created_at_idx").on(table.createdAt),
  ],
);
