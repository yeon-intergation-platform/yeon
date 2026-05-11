create table if not exists public.card_decks (
  id bigint primary key generated always as identity,
  public_id text not null,
  owner_user_id uuid not null,
  title varchar(120) not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_deck_items (
  id bigint primary key generated always as identity,
  public_id text not null,
  deck_id bigint not null,
  front_text text not null,
  back_text text not null,
  review_difficulty varchar(16),
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  image_storage_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.card_deck_items
  add column if not exists review_difficulty varchar(16);

alter table if exists public.card_deck_items
  add column if not exists last_reviewed_at timestamptz;

alter table if exists public.card_deck_items
  add column if not exists next_review_at timestamptz;

alter table if exists public.card_deck_items
  add column if not exists image_storage_key text;

alter table if exists public.users
  add column if not exists card_study_mode varchar(24) not null default 'flashcard';

create unique index if not exists card_decks_public_id_unique
  on public.card_decks (public_id);

create unique index if not exists card_deck_items_public_id_unique
  on public.card_deck_items (public_id);

create index if not exists card_decks_owner_created_at_idx
  on public.card_decks (owner_user_id, created_at);

create index if not exists card_deck_items_deck_created_at_idx
  on public.card_deck_items (deck_id, created_at);

create index if not exists card_deck_items_deck_next_review_idx
  on public.card_deck_items (deck_id, next_review_at);

DO $$
BEGIN
  ALTER TABLE public.card_decks
    ADD CONSTRAINT card_decks_public_id_not_blank
    CHECK (length(trim(public_id)) > 0) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.card_deck_items
    ADD CONSTRAINT card_deck_items_public_id_not_blank
    CHECK (length(trim(public_id)) > 0) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.card_deck_items
    ADD CONSTRAINT card_deck_items_deck_id_card_decks_id_fk
    FOREIGN KEY (deck_id) REFERENCES public.card_decks(id) ON DELETE cascade
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.card_decks
      ADD CONSTRAINT card_decks_owner_user_id_users_id_fk
      FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE cascade
      NOT VALID;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
