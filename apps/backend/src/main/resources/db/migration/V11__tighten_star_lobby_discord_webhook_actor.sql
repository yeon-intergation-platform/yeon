update public.star_lobby_discord_webhooks
set guest_session_id = null,
    updated_at = now()
where owner_user_id is not null
  and guest_session_id is not null;

alter table public.star_lobby_discord_webhooks
  drop constraint if exists star_lobby_discord_webhooks_actor_check;

alter table public.star_lobby_discord_webhooks
  add constraint star_lobby_discord_webhooks_actor_check
  check ((owner_user_id is not null) <> (guest_session_id is not null));
