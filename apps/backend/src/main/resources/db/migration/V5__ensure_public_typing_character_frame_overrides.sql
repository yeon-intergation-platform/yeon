create table if not exists public.typing_character_frame_overrides (
  character_id text primary key,
  frame_slots jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by_user_id uuid
);

alter table if exists public.typing_character_frame_overrides
  add column if not exists frame_slots jsonb not null default '[]'::jsonb;

alter table if exists public.typing_character_frame_overrides
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.typing_character_frame_overrides
  add column if not exists updated_by_user_id uuid;

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.typing_character_frame_overrides
      ADD CONSTRAINT typing_character_frame_overrides_updated_by_user_id_users_id_fk
      FOREIGN KEY (updated_by_user_id) REFERENCES public.users(id) ON DELETE set null
      NOT VALID;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
