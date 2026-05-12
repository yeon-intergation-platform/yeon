create table if not exists public.card_rooms (
  id bigint primary key generated always as identity,
  public_id text not null,
  title varchar(80) not null,
  deck_title varchar(120) not null,
  source_deck_public_id text,
  owner_user_id uuid,
  owner_guest_id text,
  visibility varchar(16) not null default 'public',
  status varchar(24) not null default 'waiting',
  current_card_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_room_cards (
  id bigint primary key generated always as identity,
  public_id text not null,
  room_id bigint not null,
  order_index int not null,
  front_text text not null,
  back_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.card_room_participants (
  id bigint primary key generated always as identity,
  public_id text not null,
  room_id bigint not null,
  user_id uuid,
  guest_id text,
  nickname varchar(40) not null,
  character_id varchar(80) not null,
  role varchar(24) not null,
  is_host boolean not null default false,
  is_ready boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

create table if not exists public.card_room_messages (
  id bigint primary key generated always as identity,
  public_id text not null,
  room_id bigint not null,
  participant_id bigint,
  content text not null,
  message_type varchar(16) not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.card_room_results (
  id bigint primary key generated always as identity,
  public_id text not null,
  room_id bigint not null,
  card_id bigint not null,
  participant_id bigint not null,
  result varchar(24) not null,
  created_at timestamptz not null default now()
);

create unique index if not exists card_rooms_public_id_unique on public.card_rooms(public_id);
create unique index if not exists card_room_cards_public_id_unique on public.card_room_cards(public_id);
create unique index if not exists card_room_cards_room_order_unique on public.card_room_cards(room_id, order_index);
create unique index if not exists card_room_participants_public_id_unique on public.card_room_participants(public_id);
create unique index if not exists card_room_messages_public_id_unique on public.card_room_messages(public_id);
create unique index if not exists card_room_results_public_id_unique on public.card_room_results(public_id);
create index if not exists card_rooms_lobby_idx on public.card_rooms(visibility, status, created_at desc);
create index if not exists card_room_participants_room_idx on public.card_room_participants(room_id, left_at);
create index if not exists card_room_messages_room_created_idx on public.card_room_messages(room_id, created_at);
create index if not exists card_room_results_room_card_idx on public.card_room_results(room_id, card_id);

DO $$ BEGIN
  ALTER TABLE public.card_room_cards ADD CONSTRAINT card_room_cards_room_fk
    FOREIGN KEY (room_id) REFERENCES public.card_rooms(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_participants ADD CONSTRAINT card_room_participants_room_fk
    FOREIGN KEY (room_id) REFERENCES public.card_rooms(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_messages ADD CONSTRAINT card_room_messages_room_fk
    FOREIGN KEY (room_id) REFERENCES public.card_rooms(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_messages ADD CONSTRAINT card_room_messages_participant_fk
    FOREIGN KEY (participant_id) REFERENCES public.card_room_participants(id) ON DELETE set null NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_results ADD CONSTRAINT card_room_results_room_fk
    FOREIGN KEY (room_id) REFERENCES public.card_rooms(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_results ADD CONSTRAINT card_room_results_card_fk
    FOREIGN KEY (card_id) REFERENCES public.card_room_cards(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.card_room_results ADD CONSTRAINT card_room_results_participant_fk
    FOREIGN KEY (participant_id) REFERENCES public.card_room_participants(id) ON DELETE cascade NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
