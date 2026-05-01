import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("display_name", { length: 80 }),
  avatarUrl: varchar("avatar_url", { length: 2048 }),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  cardStudyMode: varchar("card_study_mode", { length: 24 })
    .notNull()
    .default("flashcard"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
