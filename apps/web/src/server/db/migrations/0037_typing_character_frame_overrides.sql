CREATE TABLE IF NOT EXISTS "typing_character_frame_overrides" (
	"character_id" text PRIMARY KEY,
	"frame_slots" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "typing_character_frame_overrides" ADD CONSTRAINT "typing_character_frame_overrides_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
	WHEN duplicate_table THEN null;
END $$;
