-- Legacy web Drizzle schema parity for Spring/Flyway ownership.
-- Generated from apps/web/src/server/db/migrations/meta/0038_snapshot.json before removing web Drizzle runtime.
-- Spring repository contracts override historical web-only column types where ownership has moved.
-- Idempotent by design so it can run after historical Drizzle migrations or on a fresh database.

CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "member_id" bigint NOT NULL,
  "space_id" bigint NOT NULL,
  "type" varchar(30) NOT NULL,
  "status" varchar(30),
  "recorded_at" timestamp with time zone NOT NULL,
  "source" varchar(30) DEFAULT 'manual' NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "type" varchar(30);
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "status" varchar(30);
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "recorded_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "source" varchar(30) DEFAULT 'manual';
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
ALTER TABLE IF EXISTS "public"."activity_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."auth_sessions" (
  "id" uuid NOT NULL PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "session_token_hash" varchar(64) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "session_token_hash" varchar(64);
ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."auth_sessions" ADD COLUMN IF NOT EXISTS "last_accessed_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."card_deck_items" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "deck_id" bigint NOT NULL,
  "front_text" text NOT NULL,
  "back_text" text NOT NULL,
  "image_storage_key" text,
  "review_difficulty" varchar(16),
  "last_reviewed_at" timestamp with time zone,
  "next_review_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "deck_id" bigint;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "front_text" text;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "back_text" text;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "image_storage_key" text;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "review_difficulty" varchar(16);
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "last_reviewed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "next_review_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."card_deck_items" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."card_decks" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "owner_user_id" uuid NOT NULL,
  "title" varchar(120) NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "title" varchar(120);
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."card_decks" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_ask_posts" (
  "id" uuid NOT NULL PRIMARY KEY,
  "author_id" uuid NOT NULL,
  "question" varchar(240) NOT NULL,
  "kind" varchar(16) NOT NULL,
  "options_json" text DEFAULT '[]' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "author_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "question" varchar(240);
ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "kind" varchar(16);
ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "options_json" text DEFAULT '[]';
ALTER TABLE IF EXISTS "public"."chat_service_ask_posts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_ask_votes" (
  "id" uuid NOT NULL PRIMARY KEY,
  "post_id" uuid NOT NULL,
  "voter_id" uuid NOT NULL,
  "option_index" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_ask_votes" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_ask_votes" ADD COLUMN IF NOT EXISTS "post_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_ask_votes" ADD COLUMN IF NOT EXISTS "voter_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_ask_votes" ADD COLUMN IF NOT EXISTS "option_index" integer;
ALTER TABLE IF EXISTS "public"."chat_service_ask_votes" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_auth_challenges" (
  "id" uuid NOT NULL PRIMARY KEY,
  "phone_number" varchar(20) NOT NULL,
  "code_hash" varchar(64) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "phone_number" varchar(20);
ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "code_hash" varchar(64);
ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "consumed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."chat_service_auth_challenges" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_auth_sessions" (
  "id" uuid NOT NULL PRIMARY KEY,
  "profile_id" uuid NOT NULL,
  "session_token_hash" varchar(64) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "profile_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "session_token_hash" varchar(64);
ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."chat_service_auth_sessions" ADD COLUMN IF NOT EXISTS "last_accessed_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_blocks" (
  "id" uuid NOT NULL PRIMARY KEY,
  "blocker_id" uuid NOT NULL,
  "blocked_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_blocks" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_blocks" ADD COLUMN IF NOT EXISTS "blocker_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_blocks" ADD COLUMN IF NOT EXISTS "blocked_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_blocks" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_chat_messages" (
  "id" uuid NOT NULL PRIMARY KEY,
  "room_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_chat_messages" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_messages" ADD COLUMN IF NOT EXISTS "room_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_messages" ADD COLUMN IF NOT EXISTS "sender_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_messages" ADD COLUMN IF NOT EXISTS "body" text;
ALTER TABLE IF EXISTS "public"."chat_service_chat_messages" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_chat_rooms" (
  "id" uuid NOT NULL PRIMARY KEY,
  "room_key" varchar(80) NOT NULL,
  "user_a_id" uuid NOT NULL,
  "user_b_id" uuid NOT NULL,
  "unlocked_by_payment" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "room_key" varchar(80);
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "user_a_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "user_b_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "unlocked_by_payment" boolean DEFAULT false;
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."chat_service_chat_rooms" ADD COLUMN IF NOT EXISTS "last_message_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_demo_meta" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "seed_version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_demo_meta" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."chat_service_demo_meta" ADD COLUMN IF NOT EXISTS "seed_version" integer DEFAULT 1;
ALTER TABLE IF EXISTS "public"."chat_service_demo_meta" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_dm_unlocks" (
  "id" uuid NOT NULL PRIMARY KEY,
  "room_id" uuid NOT NULL,
  "opener_id" uuid NOT NULL,
  "target_id" uuid NOT NULL,
  "amount" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "room_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "opener_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "target_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "amount" integer;
ALTER TABLE IF EXISTS "public"."chat_service_dm_unlocks" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_feed_posts" (
  "id" uuid NOT NULL PRIMARY KEY,
  "author_id" uuid NOT NULL,
  "reply_to_post_id" uuid,
  "body" varchar(400) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_feed_posts" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_feed_posts" ADD COLUMN IF NOT EXISTS "author_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_feed_posts" ADD COLUMN IF NOT EXISTS "reply_to_post_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_feed_posts" ADD COLUMN IF NOT EXISTS "body" varchar(400);
ALTER TABLE IF EXISTS "public"."chat_service_feed_posts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_friend_links" (
  "id" uuid NOT NULL PRIMARY KEY,
  "requester_id" uuid NOT NULL,
  "addressee_id" uuid NOT NULL,
  "status" varchar(16) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "requester_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "addressee_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "status" varchar(16);
ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."chat_service_friend_links" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_profiles" (
  "id" uuid NOT NULL PRIMARY KEY,
  "phone_number" varchar(20) NOT NULL,
  "nickname" varchar(40) NOT NULL,
  "age_label" varchar(20) NOT NULL,
  "region_label" varchar(40) NOT NULL,
  "avatar_url" varchar(2048),
  "bio" varchar(160) DEFAULT '' NOT NULL,
  "points" integer DEFAULT 1000 NOT NULL,
  "notifications_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "phone_number" varchar(20);
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "nickname" varchar(40);
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "age_label" varchar(20);
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "region_label" varchar(40);
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "bio" varchar(160) DEFAULT '';
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 1000;
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT true;
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."chat_service_profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."chat_service_reports" (
  "id" uuid NOT NULL PRIMARY KEY,
  "reporter_id" uuid NOT NULL,
  "target_type" varchar(24) NOT NULL,
  "target_id" text NOT NULL,
  "reason" varchar(240) NOT NULL,
  "status" varchar(16) DEFAULT 'received' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "reporter_id" uuid;
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "target_type" varchar(24);
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "target_id" text;
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "reason" varchar(240);
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "status" varchar(16) DEFAULT 'received';
ALTER TABLE IF EXISTS "public"."chat_service_reports" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."counseling_records" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "created_by_user_id" uuid NOT NULL,
  "student_name" varchar(80) NOT NULL,
  "session_title" varchar(160) NOT NULL,
  "counseling_type" varchar(40) NOT NULL,
  "counselor_name" varchar(80),
  "status" varchar(20) NOT NULL,
  "record_source" varchar(30) DEFAULT 'audio_upload' NOT NULL,
  "audio_original_name" varchar(255) NOT NULL,
  "audio_mime_type" varchar(120) NOT NULL,
  "audio_byte_size" integer NOT NULL,
  "audio_duration_ms" integer,
  "audio_storage_path" varchar(1024) NOT NULL,
  "audio_sha256" varchar(64) NOT NULL,
  "language" varchar(12),
  "stt_model" varchar(64),
  "transcript_text" text DEFAULT '' NOT NULL,
  "transcript_segment_count" integer DEFAULT 0 NOT NULL,
  "processing_stage" varchar(30) DEFAULT 'queued' NOT NULL,
  "processing_progress" integer DEFAULT 0 NOT NULL,
  "processing_message" text,
  "processing_chunk_count" integer DEFAULT 0 NOT NULL,
  "processing_chunk_completed_count" integer DEFAULT 0 NOT NULL,
  "transcription_attempt_count" integer DEFAULT 0 NOT NULL,
  "transcription_chunks" jsonb,
  "analysis_status" varchar(20) DEFAULT 'idle' NOT NULL,
  "analysis_progress" integer DEFAULT 0 NOT NULL,
  "analysis_error_message" text,
  "analysis_attempt_count" integer DEFAULT 0 NOT NULL,
  "space_id" bigint,
  "member_id" bigint,
  "analysis_result" jsonb,
  "assistant_messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "error_message" text,
  "transcription_completed_at" timestamp with time zone,
  "analysis_completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "student_name" varchar(80);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "session_title" varchar(160);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "counseling_type" varchar(40);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "counselor_name" varchar(80);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "status" varchar(20);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "record_source" varchar(30) DEFAULT 'audio_upload';
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_original_name" varchar(255);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_mime_type" varchar(120);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_byte_size" integer;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_duration_ms" integer;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_storage_path" varchar(1024);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "audio_sha256" varchar(64);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "language" varchar(12);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "stt_model" varchar(64);
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "transcript_text" text DEFAULT '';
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "transcript_segment_count" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "processing_stage" varchar(30) DEFAULT 'queued';
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "processing_progress" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "processing_message" text;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "processing_chunk_count" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "processing_chunk_completed_count" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "transcription_attempt_count" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "transcription_chunks" jsonb;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_status" varchar(20) DEFAULT 'idle';
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_progress" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_error_message" text;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_attempt_count" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_result" jsonb;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "assistant_messages" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "error_message" text;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "transcription_completed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "analysis_completed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."counseling_records" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."counseling_transcript_segments" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "record_id" bigint NOT NULL,
  "segment_index" integer NOT NULL,
  "start_ms" integer,
  "end_ms" integer,
  "speaker_label" varchar(40) NOT NULL,
  "speaker_tone" varchar(20) NOT NULL,
  "text" text NOT NULL
);

ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "record_id" bigint;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "segment_index" integer;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "start_ms" integer;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "end_ms" integer;
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "speaker_label" varchar(40);
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "speaker_tone" varchar(20);
ALTER TABLE IF EXISTS "public"."counseling_transcript_segments" ADD COLUMN IF NOT EXISTS "text" text;

CREATE TABLE IF NOT EXISTS "public"."email_verification_tokens" (
  "token" uuid NOT NULL PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."email_verification_tokens" ADD COLUMN IF NOT EXISTS "token" uuid;
ALTER TABLE IF EXISTS "public"."email_verification_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."email_verification_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."email_verification_tokens" ADD COLUMN IF NOT EXISTS "consumed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."email_verification_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."googledrive_tokens" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "access_token_encrypted" text,
  "refresh_token_encrypted" text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "access_token" text;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "refresh_token" text;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "access_token_encrypted" text;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "refresh_token_encrypted" text;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."googledrive_tokens" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."home_insight_banner_dismissals" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "banner_key" varchar(40) NOT NULL,
  "hidden_until" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "banner_key" varchar(40);
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "hidden_until" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."home_insight_banner_dismissals" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."import_drafts" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "created_by_user_id" uuid NOT NULL,
  "provider" varchar(20) NOT NULL,
  "status" varchar(20) NOT NULL,
  "source_file_id" varchar(255),
  "source_file_name" varchar(255) NOT NULL,
  "source_mime_type" varchar(120),
  "source_file_kind" varchar(30) NOT NULL,
  "source_byte_size" integer NOT NULL,
  "source_last_modified_at" timestamp with time zone,
  "source_file_base64" text,
  "processing_stage" varchar(30) DEFAULT 'queued' NOT NULL,
  "processing_progress" integer DEFAULT 0 NOT NULL,
  "processing_message" text,
  "preview" jsonb,
  "import_result" jsonb,
  "error_message" text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "provider" varchar(20);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "status" varchar(20);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_file_id" varchar(255);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_file_name" varchar(255);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_mime_type" varchar(120);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_file_kind" varchar(30);
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_byte_size" integer;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_last_modified_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "source_file_base64" text;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "processing_stage" varchar(30) DEFAULT 'queued';
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "processing_progress" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "processing_message" text;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "preview" jsonb;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "import_result" jsonb;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "error_message" text;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."import_drafts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."life_os_days" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "owner_user_id" uuid NOT NULL,
  "local_date" varchar(10) NOT NULL,
  "timezone" varchar(80) DEFAULT 'Asia/Seoul' NOT NULL,
  "mindset" text DEFAULT '' NOT NULL,
  "backlog_text" text DEFAULT '' NOT NULL,
  "entries" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "local_date" varchar(10);
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "timezone" varchar(80) DEFAULT 'Asia/Seoul';
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "mindset" text DEFAULT '';
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "backlog_text" text DEFAULT '';
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "entries" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."life_os_days" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."login_attempts" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "email" varchar(320) NOT NULL,
  "ip_address" varchar(64) NOT NULL,
  "success" boolean NOT NULL,
  "attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."login_attempts" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."login_attempts" ADD COLUMN IF NOT EXISTS "email" varchar(320);
ALTER TABLE IF EXISTS "public"."login_attempts" ADD COLUMN IF NOT EXISTS "ip_address" varchar(64);
ALTER TABLE IF EXISTS "public"."login_attempts" ADD COLUMN IF NOT EXISTS "success" boolean;
ALTER TABLE IF EXISTS "public"."login_attempts" ADD COLUMN IF NOT EXISTS "attempted_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."member_field_definitions" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "created_by_user_id" uuid,
  "tab_id" bigint NOT NULL,
  "name" varchar(80) NOT NULL,
  "source_key" varchar(50),
  "field_type" varchar(30) NOT NULL,
  "options" jsonb,
  "is_required" boolean DEFAULT false NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "tab_id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "name" varchar(80);
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "source_key" varchar(50);
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "field_type" varchar(30);
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "options" jsonb;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "is_required" boolean DEFAULT false;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "display_order" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."member_field_definitions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."member_field_values" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "member_id" bigint NOT NULL,
  "field_definition_id" bigint NOT NULL,
  "value_text" text,
  "value_number" numeric,
  "value_boolean" boolean,
  "value_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "field_definition_id" bigint;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "value_text" text;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "value_number" numeric;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "value_boolean" boolean;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "value_json" jsonb;
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."member_field_values" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."member_tab_definitions" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "created_by_user_id" uuid,
  "tab_type" varchar(20) NOT NULL,
  "system_key" varchar(30),
  "name" varchar(80) NOT NULL,
  "is_visible" boolean DEFAULT true NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "tab_type" varchar(20);
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "system_key" varchar(30);
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "name" varchar(80);
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "display_order" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."member_tab_definitions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."members" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "name" varchar(100) NOT NULL,
  "email" varchar(255),
  "phone" varchar(20),
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "initial_risk_level" varchar(10),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "name" varchar(100);
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "email" varchar(255);
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "phone" varchar(20);
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active';
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "initial_risk_level" varchar(10);
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."members" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."onedrive_tokens" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "access_token_encrypted" text,
  "refresh_token_encrypted" text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "access_token" text;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "refresh_token" text;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "access_token_encrypted" text;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "refresh_token_encrypted" text;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."onedrive_tokens" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."password_credentials" (
  "user_id" uuid NOT NULL PRIMARY KEY,
  "password_hash" text NOT NULL,
  "password_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."password_credentials" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."password_credentials" ADD COLUMN IF NOT EXISTS "password_hash" text;
ALTER TABLE IF EXISTS "public"."password_credentials" ADD COLUMN IF NOT EXISTS "password_updated_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."password_credentials" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
  "token" uuid NOT NULL PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD COLUMN IF NOT EXISTS "token" uuid;
ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD COLUMN IF NOT EXISTS "consumed_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."public_check_sessions" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "title" varchar(120) NOT NULL,
  "public_token" varchar(120) NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "check_mode" varchar(30) DEFAULT 'attendance_and_assignment' NOT NULL,
  "enabled_methods" text[] NOT NULL,
  "verification_method" varchar(40) DEFAULT 'name_phone_last4' NOT NULL,
  "opens_at" timestamp with time zone,
  "closes_at" timestamp with time zone,
  "location_label" varchar(120),
  "latitude" double precision,
  "longitude" double precision,
  "radius_meters" integer,
  "created_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "title" varchar(120);
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "public_token" varchar(120);
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active';
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "check_mode" varchar(30) DEFAULT 'attendance_and_assignment';
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "enabled_methods" text[];
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "verification_method" varchar(40) DEFAULT 'name_phone_last4';
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "opens_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "closes_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "location_label" varchar(120);
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "latitude" double precision;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "longitude" double precision;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "radius_meters" integer;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."public_check_sessions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."public_check_submissions" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "session_id" bigint NOT NULL,
  "space_id" bigint NOT NULL,
  "member_id" bigint,
  "check_method" varchar(20) NOT NULL,
  "verification_status" varchar(30) NOT NULL,
  "submitted_name" varchar(100) NOT NULL,
  "submitted_phone_last4" varchar(4) NOT NULL,
  "assignment_status" varchar(20),
  "assignment_link" varchar(1000),
  "latitude" double precision,
  "longitude" double precision,
  "distance_meters" double precision,
  "metadata" jsonb,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "session_id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "check_method" varchar(20);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "verification_status" varchar(30);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "submitted_name" varchar(100);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "submitted_phone_last4" varchar(4);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "assignment_status" varchar(20);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "assignment_link" varchar(1000);
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "latitude" double precision;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "longitude" double precision;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "distance_meters" double precision;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."public_check_submissions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."sheet_integration_member_snapshots" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "integration_id" bigint NOT NULL,
  "space_id" bigint NOT NULL,
  "member_id" text NOT NULL,
  "base_payload" jsonb NOT NULL,
  "base_payload_hash" text NOT NULL,
  "exported_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "integration_id" bigint;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "member_id" text;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "base_payload" jsonb;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "base_payload_hash" text;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "exported_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."sheet_integration_member_snapshots" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."sheet_integrations" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "provider" varchar(50),
  "sheet_url" text NOT NULL,
  "sheet_id" varchar(200) NOT NULL,
  "data_type" varchar(30) NOT NULL,
  "column_mapping" jsonb,
  "last_synced_at" timestamp with time zone,
  "access_token" text,
  "refresh_token" text,
  "token_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "provider" varchar(50);
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "sheet_url" text;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "sheet_id" varchar(200);
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "data_type" varchar(30);
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "column_mapping" jsonb;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "access_token" text;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "refresh_token" text;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "token_expires_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."sheet_integrations" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."space_member_board_history" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "member_id" bigint NOT NULL,
  "session_id" bigint,
  "attendance_status" varchar(20) DEFAULT 'unknown' NOT NULL,
  "assignment_status" varchar(20) DEFAULT 'unknown' NOT NULL,
  "assignment_link" varchar(1000),
  "source" varchar(30) NOT NULL,
  "updated_by_user_id" uuid,
  "happened_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "session_id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "attendance_status" varchar(20) DEFAULT 'unknown';
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "assignment_status" varchar(20) DEFAULT 'unknown';
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "assignment_link" varchar(1000);
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "source" varchar(30);
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "updated_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "happened_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."space_member_board_history" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."space_member_boards" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "space_id" bigint NOT NULL,
  "member_id" bigint NOT NULL,
  "attendance_status" varchar(20) DEFAULT 'unknown' NOT NULL,
  "attendance_marked_at" timestamp with time zone,
  "attendance_marked_source" varchar(30),
  "assignment_status" varchar(20) DEFAULT 'unknown' NOT NULL,
  "assignment_link" varchar(1000),
  "assignment_marked_at" timestamp with time zone,
  "assignment_marked_source" varchar(30),
  "last_public_check_at" timestamp with time zone,
  "updated_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "space_id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "member_id" bigint;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "attendance_status" varchar(20) DEFAULT 'unknown';
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "attendance_marked_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "attendance_marked_source" varchar(30);
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "assignment_status" varchar(20) DEFAULT 'unknown';
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "assignment_link" varchar(1000);
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "assignment_marked_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "assignment_marked_source" varchar(30);
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "last_public_check_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "updated_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."space_member_boards" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."space_templates" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "created_by_user_id" uuid,
  "name" varchar(80) NOT NULL,
  "description" text,
  "is_system" boolean DEFAULT false NOT NULL,
  "tabs_config" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "name" varchar(80);
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "is_system" boolean DEFAULT false;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "tabs_config" jsonb;
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."space_templates" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."spaces" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "start_date" date,
  "end_date" date,
  "created_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "name" varchar(100);
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "start_date" date;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "end_date" date;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."spaces" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."typing_character_frame_overrides" (
  "character_id" text NOT NULL PRIMARY KEY,
  "frame_slots" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by_user_id" uuid
);

ALTER TABLE IF EXISTS "public"."typing_character_frame_overrides" ADD COLUMN IF NOT EXISTS "character_id" text;
ALTER TABLE IF EXISTS "public"."typing_character_frame_overrides" ADD COLUMN IF NOT EXISTS "frame_slots" jsonb;
ALTER TABLE IF EXISTS "public"."typing_character_frame_overrides" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."typing_character_frame_overrides" ADD COLUMN IF NOT EXISTS "updated_by_user_id" uuid;

CREATE TABLE IF NOT EXISTS "public"."typing_deck_passages" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "deck_id" bigint NOT NULL,
  "title" varchar(120),
  "prompt" text NOT NULL,
  "text_type" varchar(16) NOT NULL,
  "difficulty" varchar(16) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "deck_id" bigint;
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "title" varchar(120);
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "prompt" text;
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "text_type" varchar(16);
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "difficulty" varchar(16);
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0;
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."typing_deck_passages" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."typing_decks" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
  "public_id" text NOT NULL,
  "owner_user_id" uuid,
  "title" varchar(120) NOT NULL,
  "description" text,
  "language_tag" varchar(16) NOT NULL,
  "visibility" varchar(16) NOT NULL,
  "source" varchar(16) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "id" bigint;
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "title" varchar(120);
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "language_tag" varchar(16);
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "visibility" varchar(16);
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "source" varchar(16);
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."typing_decks" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."user_identities" (
  "id" uuid NOT NULL PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "provider" varchar(20) NOT NULL,
  "provider_user_id" varchar(191) NOT NULL,
  "email" varchar(320),
  "display_name" varchar(80),
  "avatar_url" varchar(2048),
  "linked_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_login_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "provider" varchar(20);
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "provider_user_id" varchar(191);
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "email" varchar(320);
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "display_name" varchar(80);
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "linked_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."user_identities" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" uuid NOT NULL PRIMARY KEY,
  "email" varchar(320) NOT NULL,
  "display_name" varchar(80),
  "avatar_url" varchar(2048),
  "role" varchar(32) DEFAULT 'user' NOT NULL,
  "card_study_mode" varchar(24) DEFAULT 'flashcard' NOT NULL,
  "email_verified_at" timestamp with time zone,
  "last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "email" varchar(320);
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "display_name" varchar(80);
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "role" varchar(32) DEFAULT 'user';
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "card_study_mode" varchar(24) DEFAULT 'flashcard';
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp with time zone;
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE IF EXISTS "public"."users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

CREATE OR REPLACE FUNCTION public.__yeon_jsonb_to_text_array(value jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(array_agg(item), ARRAY[]::text[])
  FROM jsonb_array_elements_text(COALESCE(value, '[]'::jsonb)) AS item
$$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'public_check_sessions'
      AND column_name = 'enabled_methods'
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.public_check_sessions
      ALTER COLUMN enabled_methods TYPE text[]
      USING public.__yeon_jsonb_to_text_array(enabled_methods);
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.__yeon_jsonb_to_text_array(jsonb);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sheet_integration_member_snapshots'
      AND column_name = 'member_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.sheet_integration_member_snapshots
      ALTER COLUMN member_id TYPE text
      USING member_id::text;
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."card_deck_items" ADD CONSTRAINT "card_deck_items_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."card_decks" ADD CONSTRAINT "card_decks_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_records" ADD CONSTRAINT "counseling_records_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_transcript_segments" ADD CONSTRAINT "counseling_transcript_segments_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."googledrive_tokens" ADD CONSTRAINT "googledrive_tokens_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."googledrive_tokens" ADD CONSTRAINT "googledrive_tokens_user_id_unique" UNIQUE ("user_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."home_insight_banner_dismissals" ADD CONSTRAINT "home_insight_banner_dismissals_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."import_drafts" ADD CONSTRAINT "import_drafts_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."life_os_days" ADD CONSTRAINT "life_os_days_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_definitions" ADD CONSTRAINT "member_field_definitions_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_definitions" ADD CONSTRAINT "member_field_definitions_space_source_key_unique" UNIQUE ("space_id", "source_key");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_values" ADD CONSTRAINT "member_field_values_member_field_unique" UNIQUE ("member_id", "field_definition_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_values" ADD CONSTRAINT "member_field_values_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_tab_definitions" ADD CONSTRAINT "member_tab_definitions_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_tab_definitions" ADD CONSTRAINT "member_tab_definitions_space_system_key_unique" UNIQUE ("space_id", "system_key");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."members" ADD CONSTRAINT "members_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."onedrive_tokens" ADD CONSTRAINT "onedrive_tokens_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."onedrive_tokens" ADD CONSTRAINT "onedrive_tokens_user_id_unique" UNIQUE ("user_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_sessions" ADD CONSTRAINT "public_check_sessions_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_submissions" ADD CONSTRAINT "public_check_submissions_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integration_member_snapshots" ADD CONSTRAINT "sheet_integration_member_snapshots_integration_member_unique" UNIQUE ("integration_id", "member_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integration_member_snapshots" ADD CONSTRAINT "sheet_integration_member_snapshots_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integrations" ADD CONSTRAINT "sheet_integrations_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_board_history" ADD CONSTRAINT "space_member_board_history_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_boards" ADD CONSTRAINT "space_member_boards_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_templates" ADD CONSTRAINT "space_templates_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."spaces" ADD CONSTRAINT "spaces_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."typing_deck_passages" ADD CONSTRAINT "typing_deck_passages_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."typing_decks" ADD CONSTRAINT "typing_decks_public_id_unique" UNIQUE ("public_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "activity_logs_member_space_recorded_at_idx" ON "public"."activity_logs" USING btree ("member_id" NULLS LAST, "space_id" NULLS LAST, "recorded_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_sessions_token_hash_key" ON "public"."auth_sessions" USING btree ("session_token_hash" NULLS LAST);
CREATE INDEX IF NOT EXISTS "auth_sessions_user_id_idx" ON "public"."auth_sessions" USING btree ("user_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "card_deck_items_deck_created_at_idx" ON "public"."card_deck_items" USING btree ("deck_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "card_deck_items_deck_next_review_idx" ON "public"."card_deck_items" USING btree ("deck_id" NULLS LAST, "next_review_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "card_decks_owner_created_at_idx" ON "public"."card_decks" USING btree ("owner_user_id" NULLS LAST, "created_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_ask_posts_author_created_idx" ON "public"."chat_service_ask_posts" USING btree ("author_id" NULLS LAST, "created_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_ask_votes_post_voter_key" ON "public"."chat_service_ask_votes" USING btree ("post_id" NULLS LAST, "voter_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_auth_challenges_phone_idx" ON "public"."chat_service_auth_challenges" USING btree ("phone_number" NULLS LAST, "created_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_auth_sessions_token_hash_key" ON "public"."chat_service_auth_sessions" USING btree ("session_token_hash" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_blocks_blocker_blocked_key" ON "public"."chat_service_blocks" USING btree ("blocker_id" NULLS LAST, "blocked_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_chat_messages_room_created_idx" ON "public"."chat_service_chat_messages" USING btree ("room_id" NULLS LAST, "created_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_chat_rooms_room_key_key" ON "public"."chat_service_chat_rooms" USING btree ("room_key" NULLS LAST);
CREATE INDEX IF NOT EXISTS "chat_service_chat_rooms_user_a_last_message_idx" ON "public"."chat_service_chat_rooms" USING btree ("user_a_id" NULLS LAST, "last_message_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "chat_service_chat_rooms_user_b_last_message_idx" ON "public"."chat_service_chat_rooms" USING btree ("user_b_id" NULLS LAST, "last_message_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_dm_unlocks_opener_created_idx" ON "public"."chat_service_dm_unlocks" USING btree ("opener_id" NULLS LAST, "created_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_feed_posts_author_created_idx" ON "public"."chat_service_feed_posts" USING btree ("author_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "chat_service_feed_posts_reply_idx" ON "public"."chat_service_feed_posts" USING btree ("reply_to_post_id" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_friend_links_requester_addressee_key" ON "public"."chat_service_friend_links" USING btree ("requester_id" NULLS LAST, "addressee_id" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_service_profiles_phone_number_key" ON "public"."chat_service_profiles" USING btree ("phone_number" NULLS LAST);

CREATE INDEX IF NOT EXISTS "chat_service_reports_reporter_created_idx" ON "public"."chat_service_reports" USING btree ("reporter_id" NULLS LAST, "created_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "counseling_records_member_created_at_idx" ON "public"."counseling_records" USING btree ("member_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "counseling_records_space_created_at_idx" ON "public"."counseling_records" USING btree ("space_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "counseling_records_user_created_at_idx" ON "public"."counseling_records" USING btree ("created_by_user_id" NULLS LAST, "created_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "counseling_transcript_segments_record_index_key" ON "public"."counseling_transcript_segments" USING btree ("record_id" NULLS LAST, "segment_index" NULLS LAST);

CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_idx" ON "public"."email_verification_tokens" USING btree ("user_id" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "home_insight_banner_dismissals_user_banner_key" ON "public"."home_insight_banner_dismissals" USING btree ("user_id" NULLS LAST, "banner_key" NULLS LAST);
CREATE INDEX IF NOT EXISTS "home_insight_banner_dismissals_user_hidden_until_idx" ON "public"."home_insight_banner_dismissals" USING btree ("user_id" NULLS LAST, "hidden_until" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "life_os_days_owner_local_date_unique" ON "public"."life_os_days" USING btree ("owner_user_id" NULLS LAST, "local_date" NULLS LAST);
CREATE INDEX IF NOT EXISTS "life_os_days_owner_updated_at_idx" ON "public"."life_os_days" USING btree ("owner_user_id" NULLS LAST, "updated_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "login_attempts_email_attempted_at_idx" ON "public"."login_attempts" USING btree ("email" NULLS LAST, "attempted_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "login_attempts_ip_attempted_at_idx" ON "public"."login_attempts" USING btree ("ip_address" NULLS LAST, "attempted_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "members_space_created_at_idx" ON "public"."members" USING btree ("space_id" NULLS LAST, "created_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "public"."password_reset_tokens" USING btree ("user_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "public_check_sessions_space_created_at_idx" ON "public"."public_check_sessions" USING btree ("space_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "public_check_sessions_token_idx" ON "public"."public_check_sessions" USING btree ("public_token" NULLS LAST);

CREATE INDEX IF NOT EXISTS "public_check_submissions_session_submitted_at_idx" ON "public"."public_check_submissions" USING btree ("session_id" NULLS LAST, "submitted_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "public_check_submissions_space_member_idx" ON "public"."public_check_submissions" USING btree ("space_id" NULLS LAST, "member_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "sheet_integration_member_snapshots_integration_idx" ON "public"."sheet_integration_member_snapshots" USING btree ("integration_id" NULLS LAST);

CREATE INDEX IF NOT EXISTS "space_member_board_history_member_happened_at_idx" ON "public"."space_member_board_history" USING btree ("member_id" NULLS LAST, "happened_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "space_member_board_history_space_happened_at_idx" ON "public"."space_member_board_history" USING btree ("space_id" NULLS LAST, "happened_at" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "space_member_boards_space_member_key" ON "public"."space_member_boards" USING btree ("space_id" NULLS LAST, "member_id" NULLS LAST);
CREATE INDEX IF NOT EXISTS "space_member_boards_space_updated_at_idx" ON "public"."space_member_boards" USING btree ("space_id" NULLS LAST, "updated_at" NULLS LAST);

CREATE INDEX IF NOT EXISTS "typing_deck_passages_deck_created_at_idx" ON "public"."typing_deck_passages" USING btree ("deck_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "typing_deck_passages_deck_order_idx" ON "public"."typing_deck_passages" USING btree ("deck_id" NULLS LAST, "sort_order" NULLS LAST);

CREATE INDEX IF NOT EXISTS "typing_decks_created_at_idx" ON "public"."typing_decks" USING btree ("created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "typing_decks_owner_created_at_idx" ON "public"."typing_decks" USING btree ("owner_user_id" NULLS LAST, "created_at" NULLS LAST);
CREATE INDEX IF NOT EXISTS "typing_decks_visibility_source_language_idx" ON "public"."typing_decks" USING btree ("visibility" NULLS LAST, "source" NULLS LAST, "language_tag" NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS "user_identities_provider_user_key" ON "public"."user_identities" USING btree ("provider" NULLS LAST, "provider_user_id" NULLS LAST);
CREATE UNIQUE INDEX IF NOT EXISTS "user_identities_user_provider_key" ON "public"."user_identities" USING btree ("user_id" NULLS LAST, "provider" NULLS LAST);

DO $$ BEGIN
  ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."card_deck_items" ADD CONSTRAINT "card_deck_items_deck_id_card_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."card_decks" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."card_decks" ADD CONSTRAINT "card_decks_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_ask_posts" ADD CONSTRAINT "chat_service_ask_posts_author_id_chat_service_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_ask_votes" ADD CONSTRAINT "chat_service_ask_votes_post_id_chat_service_ask_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."chat_service_ask_posts" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_ask_votes" ADD CONSTRAINT "chat_service_ask_votes_voter_id_chat_service_profiles_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_auth_sessions" ADD CONSTRAINT "chat_service_auth_sessions_profile_id_chat_service_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_blocks" ADD CONSTRAINT "chat_service_blocks_blocked_id_chat_service_profiles_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_blocks" ADD CONSTRAINT "chat_service_blocks_blocker_id_chat_service_profiles_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_chat_messages" ADD CONSTRAINT "chat_service_chat_messages_room_id_chat_service_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_service_chat_rooms" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_chat_messages" ADD CONSTRAINT "chat_service_chat_messages_sender_id_chat_service_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_chat_rooms" ADD CONSTRAINT "chat_service_chat_rooms_user_a_id_chat_service_profiles_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_chat_rooms" ADD CONSTRAINT "chat_service_chat_rooms_user_b_id_chat_service_profiles_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_dm_unlocks" ADD CONSTRAINT "chat_service_dm_unlocks_opener_id_chat_service_profiles_id_fk" FOREIGN KEY ("opener_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_dm_unlocks" ADD CONSTRAINT "chat_service_dm_unlocks_room_id_chat_service_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_service_chat_rooms" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_dm_unlocks" ADD CONSTRAINT "chat_service_dm_unlocks_target_id_chat_service_profiles_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_feed_posts" ADD CONSTRAINT "chat_service_feed_posts_author_id_chat_service_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_friend_links" ADD CONSTRAINT "chat_service_friend_links_addressee_id_chat_service_profiles_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_friend_links" ADD CONSTRAINT "chat_service_friend_links_requester_id_chat_service_profiles_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."chat_service_reports" ADD CONSTRAINT "chat_service_reports_reporter_id_chat_service_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."chat_service_profiles" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_records" ADD CONSTRAINT "counseling_records_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_records" ADD CONSTRAINT "counseling_records_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_records" ADD CONSTRAINT "counseling_records_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."counseling_transcript_segments" ADD CONSTRAINT "counseling_transcript_segments_record_id_counseling_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."counseling_records" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."googledrive_tokens" ADD CONSTRAINT "googledrive_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."home_insight_banner_dismissals" ADD CONSTRAINT "home_insight_banner_dismissals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."import_drafts" ADD CONSTRAINT "import_drafts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."life_os_days" ADD CONSTRAINT "life_os_days_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_definitions" ADD CONSTRAINT "member_field_definitions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_definitions" ADD CONSTRAINT "member_field_definitions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_definitions" ADD CONSTRAINT "member_field_definitions_tab_id_member_tab_definitions_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."member_tab_definitions" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_values" ADD CONSTRAINT "member_field_values_field_definition_id_member_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."member_field_definitions" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_field_values" ADD CONSTRAINT "member_field_values_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_tab_definitions" ADD CONSTRAINT "member_tab_definitions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."member_tab_definitions" ADD CONSTRAINT "member_tab_definitions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."members" ADD CONSTRAINT "members_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."onedrive_tokens" ADD CONSTRAINT "onedrive_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."password_credentials" ADD CONSTRAINT "password_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_sessions" ADD CONSTRAINT "public_check_sessions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_sessions" ADD CONSTRAINT "public_check_sessions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_submissions" ADD CONSTRAINT "public_check_submissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_submissions" ADD CONSTRAINT "public_check_submissions_session_id_public_check_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."public_check_sessions" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."public_check_submissions" ADD CONSTRAINT "public_check_submissions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integration_member_snapshots" ADD CONSTRAINT "sheet_integration_member_snapshots_integration_id_sheet_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."sheet_integrations" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integration_member_snapshots" ADD CONSTRAINT "sheet_integration_member_snapshots_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."sheet_integrations" ADD CONSTRAINT "sheet_integrations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_board_history" ADD CONSTRAINT "space_member_board_history_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_board_history" ADD CONSTRAINT "space_member_board_history_session_id_public_check_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."public_check_sessions" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_board_history" ADD CONSTRAINT "space_member_board_history_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_board_history" ADD CONSTRAINT "space_member_board_history_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_boards" ADD CONSTRAINT "space_member_boards_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_boards" ADD CONSTRAINT "space_member_boards_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_member_boards" ADD CONSTRAINT "space_member_boards_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."space_templates" ADD CONSTRAINT "space_templates_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."spaces" ADD CONSTRAINT "spaces_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."typing_character_frame_overrides" ADD CONSTRAINT "typing_character_frame_overrides_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."typing_deck_passages" ADD CONSTRAINT "typing_deck_passages_deck_id_typing_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."typing_decks" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."typing_decks" ADD CONSTRAINT "typing_decks_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
