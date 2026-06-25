-- 내 게임: 찜(즐겨찾기)과 최근 플레이. 둘 다 로그인 사용자 개인 컬렉션.

-- 찜: 1인 1게임 1회.
create table if not exists public.game_service_favorites (
    id uuid primary key,
    user_id uuid not null,
    game_slug varchar(80) not null,
    created_at timestamptz not null default now(),
    unique (user_id, game_slug)
);
create index if not exists idx_game_service_favorites_user
    on public.game_service_favorites (user_id, created_at desc);

-- 최근 플레이: 게임당 마지막 플레이 시각만 유지(무한 증가 방지 upsert).
create table if not exists public.game_service_play_history (
    user_id uuid not null,
    game_slug varchar(80) not null,
    played_at timestamptz not null default now(),
    primary key (user_id, game_slug)
);
create index if not exists idx_game_service_play_history_user
    on public.game_service_play_history (user_id, played_at desc);
