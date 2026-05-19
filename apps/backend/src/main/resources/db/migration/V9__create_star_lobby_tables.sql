create table if not exists public.star_lobby_observed_rooms (
  id uuid primary key,
  room_key varchar(220) not null unique,
  title varchar(160) not null,
  current_players integer,
  max_players integer,
  status varchar(24) not null,
  observed_at timestamptz not null,
  last_seen_at timestamptz not null,
  disappeared_at timestamptz,
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint star_lobby_observed_rooms_title_check check (char_length(trim(title)) between 1 and 160),
  constraint star_lobby_observed_rooms_current_players_check check (current_players is null or current_players between 0 and 12),
  constraint star_lobby_observed_rooms_max_players_check check (max_players is null or max_players between 1 and 12),
  constraint star_lobby_observed_rooms_status_check check (status in ('observed', 'disappeared'))
);

create index if not exists star_lobby_observed_rooms_last_seen_idx
  on public.star_lobby_observed_rooms (last_seen_at desc);

create index if not exists star_lobby_observed_rooms_status_last_seen_idx
  on public.star_lobby_observed_rooms (status, last_seen_at desc);

create table if not exists public.star_lobby_alert_rules (
  id uuid primary key,
  owner_user_id uuid,
  guest_session_id varchar(128),
  name varchar(80) not null,
  include_keywords jsonb not null,
  exclude_keywords jsonb not null default '[]'::jsonb,
  min_players integer,
  max_players integer,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint star_lobby_alert_rules_actor_check check (owner_user_id is not null or guest_session_id is not null),
  constraint star_lobby_alert_rules_name_check check (char_length(trim(name)) between 1 and 80),
  constraint star_lobby_alert_rules_include_keywords_check check (jsonb_typeof(include_keywords) = 'array' and jsonb_array_length(include_keywords) between 1 and 20),
  constraint star_lobby_alert_rules_exclude_keywords_check check (jsonb_typeof(exclude_keywords) = 'array' and jsonb_array_length(exclude_keywords) <= 20),
  constraint star_lobby_alert_rules_min_players_check check (min_players is null or min_players between 0 and 12),
  constraint star_lobby_alert_rules_max_players_check check (max_players is null or max_players between 1 and 12)
);

create index if not exists star_lobby_alert_rules_owner_user_idx
  on public.star_lobby_alert_rules (owner_user_id)
  where owner_user_id is not null;

create index if not exists star_lobby_alert_rules_guest_session_idx
  on public.star_lobby_alert_rules (guest_session_id)
  where guest_session_id is not null;

create table if not exists public.star_lobby_alert_matches (
  id uuid primary key,
  rule_id uuid not null references public.star_lobby_alert_rules(id) on delete cascade,
  room_id uuid not null references public.star_lobby_observed_rooms(id) on delete cascade,
  status varchar(24) not null,
  matched_keyword varchar(80),
  suppressed_keyword varchar(80),
  matched_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint star_lobby_alert_matches_status_check check (status in ('matched', 'suppressed'))
);

create unique index if not exists star_lobby_alert_matches_rule_room_status_idx
  on public.star_lobby_alert_matches (rule_id, room_id, status);

create index if not exists star_lobby_alert_matches_matched_at_idx
  on public.star_lobby_alert_matches (matched_at desc);
