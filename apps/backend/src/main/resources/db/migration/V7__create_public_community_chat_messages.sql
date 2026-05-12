create table if not exists public.community_chat_messages (
  id uuid primary key,
  sender_user_id uuid,
  guest_session_id varchar(128),
  sender_nickname varchar(40) not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint community_chat_messages_actor_check check (
    sender_user_id is not null or guest_session_id is not null
  ),
  constraint community_chat_messages_body_check check (char_length(trim(body)) between 1 and 1000),
  constraint community_chat_messages_nickname_check check (char_length(trim(sender_nickname)) between 1 and 40)
);

create index if not exists community_chat_messages_created_at_idx
  on public.community_chat_messages (created_at desc);

create index if not exists community_chat_messages_sender_user_idx
  on public.community_chat_messages (sender_user_id)
  where sender_user_id is not null;

create index if not exists community_chat_messages_guest_session_idx
  on public.community_chat_messages (guest_session_id)
  where guest_session_id is not null;
