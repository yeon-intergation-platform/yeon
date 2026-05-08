create table if not exists yeon_backend.users (
  id uuid primary key,
  email varchar(320) not null unique,
  display_name varchar(80),
  avatar_url varchar(2048),
  role varchar(32) not null default 'user',
  card_study_mode varchar(24) not null default 'flashcard',
  email_verified_at timestamptz,
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists yeon_backend.space_templates (
  id bigint primary key generated always as identity,
  public_id text not null unique,
  created_by_user_id uuid references yeon_backend.users(id) on delete cascade,
  name varchar(80) not null,
  description text,
  is_system boolean not null default false,
  tabs_config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
