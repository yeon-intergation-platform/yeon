CREATE TABLE IF NOT EXISTS "typing_decks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "typing_decks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"owner_user_id" uuid,
	"title" varchar(120) NOT NULL,
	"description" text,
	"language_tag" varchar(16) NOT NULL,
	"visibility" varchar(16) NOT NULL,
	"source" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "typing_decks_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "typing_deck_passages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "typing_deck_passages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"deck_id" bigint NOT NULL,
	"title" varchar(120),
	"prompt" text NOT NULL,
	"text_type" varchar(16) NOT NULL,
	"difficulty" varchar(16) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "typing_deck_passages_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "typing_decks" ADD CONSTRAINT "typing_decks_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
	WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "typing_deck_passages" ADD CONSTRAINT "typing_deck_passages_deck_id_typing_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."typing_decks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
	WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "typing_decks_public_id_unique" ON "typing_decks" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "typing_deck_passages_public_id_unique" ON "typing_deck_passages" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_deck_passages_deck_order_idx" ON "typing_deck_passages" USING btree ("deck_id","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_deck_passages_deck_created_at_idx" ON "typing_deck_passages" USING btree ("deck_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_decks_owner_created_at_idx" ON "typing_decks" USING btree ("owner_user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_decks_visibility_source_language_idx" ON "typing_decks" USING btree ("visibility","source","language_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_decks_created_at_idx" ON "typing_decks" USING btree ("created_at");
