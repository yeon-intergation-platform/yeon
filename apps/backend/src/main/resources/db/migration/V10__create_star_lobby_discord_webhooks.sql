create table if not exists public.star_lobby_discord_webhooks (
  id uuid primary key,
  owner_user_id uuid,
  guest_session_id varchar(128),
  webhook_url_encrypted text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint star_lobby_discord_webhooks_actor_check check (owner_user_id is not null or guest_session_id is not null),
  constraint star_lobby_discord_webhooks_url_check check (char_length(trim(webhook_url_encrypted)) between 1 and 5000)
);

create unique index if not exists star_lobby_discord_webhooks_owner_user_unique_idx
  on public.star_lobby_discord_webhooks (owner_user_id)
  where owner_user_id is not null;

create unique index if not exists star_lobby_discord_webhooks_guest_session_unique_idx
  on public.star_lobby_discord_webhooks (guest_session_id)
  where guest_session_id is not null;
