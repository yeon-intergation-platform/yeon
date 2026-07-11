create table if not exists yeon_backend.card_ai_request_usage (
  id uuid primary key,
  user_id uuid not null,
  feature varchar(48) not null,
  idempotency_key varchar(128) not null,
  request_fingerprint varchar(64) not null,
  status varchar(16) not null,
  active_execution_id uuid,
  model varchar(120),
  input_tokens integer,
  output_tokens integer,
  latency_ms bigint,
  response_payload jsonb,
  error_code varchar(80),
  created_at timestamptz not null default now(),
  reservation_started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint card_ai_request_usage_status_check
    check (status in ('pending', 'success', 'failed')),
  constraint card_ai_request_usage_input_tokens_check
    check (input_tokens is null or input_tokens >= 0),
  constraint card_ai_request_usage_output_tokens_check
    check (output_tokens is null or output_tokens >= 0),
  constraint card_ai_request_usage_latency_ms_check
    check (latency_ms is null or latency_ms >= 0),
  constraint card_ai_request_usage_user_fk
    foreign key (user_id) references public.users(id) on delete cascade,
  constraint card_ai_request_usage_idempotency_unique
    unique (user_id, feature, idempotency_key)
);

create index if not exists card_ai_request_usage_rate_limit_idx
  on yeon_backend.card_ai_request_usage (user_id, feature, created_at desc);

create table if not exists yeon_backend.card_ai_request_executions (
  id uuid primary key,
  usage_id uuid not null,
  user_id uuid not null,
  feature varchar(48) not null,
  reserved_tokens integer not null,
  actual_tokens integer,
  started_at timestamptz not null default now(),
  constraint card_ai_request_executions_usage_fk
    foreign key (usage_id) references yeon_backend.card_ai_request_usage(id) on delete cascade,
  constraint card_ai_request_executions_user_fk
    foreign key (user_id) references public.users(id) on delete cascade,
  constraint card_ai_request_executions_reserved_tokens_check
    check (reserved_tokens > 0),
  constraint card_ai_request_executions_actual_tokens_check
    check (actual_tokens is null or actual_tokens >= 0)
);

create index if not exists card_ai_request_executions_rate_limit_idx
  on yeon_backend.card_ai_request_executions (user_id, feature, started_at desc);

create table if not exists yeon_backend.card_deck_bulk_requests (
  owner_user_id uuid not null,
  idempotency_key uuid not null,
  deck_id bigint not null,
  request_fingerprint varchar(64) not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (owner_user_id, idempotency_key),
  constraint card_deck_bulk_requests_owner_fk
    foreign key (owner_user_id) references public.users(id) on delete cascade,
  constraint card_deck_bulk_requests_deck_fk
    foreign key (deck_id) references public.card_decks(id) on delete cascade
);

create table if not exists yeon_backend.card_recall_attempts (
  id bigint primary key generated always as identity,
  public_id text not null,
  owner_user_id uuid not null,
  deck_id bigint not null,
  item_id bigint not null,
  idempotency_key varchar(128) not null,
  question_snapshot text not null,
  answer_snapshot text not null,
  user_answer text not null,
  score smallint not null,
  verdict varchar(8) not null,
  missed_points jsonb not null default '[]'::jsonb,
  feedback text not null,
  review_difficulty varchar(16) not null,
  last_reviewed_at timestamptz not null,
  next_review_at timestamptz not null,
  model varchar(120) not null,
  created_at timestamptz not null default now(),
  constraint card_recall_attempts_score_check check (score between 0 and 100),
  constraint card_recall_attempts_verdict_check check (verdict in ('pass', 'fail')),
  constraint card_recall_attempts_review_difficulty_check
    check (review_difficulty in ('hard', 'good', 'easy')),
  constraint card_recall_attempts_owner_fk
    foreign key (owner_user_id) references public.users(id) on delete cascade,
  constraint card_recall_attempts_deck_fk
    foreign key (deck_id) references public.card_decks(id) on delete cascade,
  constraint card_recall_attempts_item_fk
    foreign key (item_id) references public.card_deck_items(id) on delete cascade,
  constraint card_recall_attempts_public_id_unique unique (public_id),
  constraint card_recall_attempts_idempotency_unique
    unique (owner_user_id, idempotency_key)
);

create index if not exists card_recall_attempts_owner_created_idx
  on yeon_backend.card_recall_attempts (owner_user_id, created_at desc);

create index if not exists card_recall_attempts_deck_created_idx
  on yeon_backend.card_recall_attempts (owner_user_id, deck_id, created_at desc);

create index if not exists card_recall_attempts_item_created_idx
  on yeon_backend.card_recall_attempts (owner_user_id, item_id, created_at desc);
