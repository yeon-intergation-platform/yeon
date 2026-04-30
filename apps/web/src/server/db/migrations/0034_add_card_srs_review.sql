ALTER TABLE IF EXISTS "users"
  ADD COLUMN IF NOT EXISTS "card_study_mode" varchar(24) DEFAULT 'flashcard' NOT NULL;
--> statement-breakpoint
ALTER TABLE IF EXISTS "card_deck_items"
  ADD COLUMN IF NOT EXISTS "review_difficulty" varchar(16);
--> statement-breakpoint
ALTER TABLE IF EXISTS "card_deck_items"
  ADD COLUMN IF NOT EXISTS "last_reviewed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE IF EXISTS "card_deck_items"
  ADD COLUMN IF NOT EXISTS "next_review_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_deck_items_deck_next_review_idx" ON "card_deck_items" USING btree ("deck_id","next_review_at");
