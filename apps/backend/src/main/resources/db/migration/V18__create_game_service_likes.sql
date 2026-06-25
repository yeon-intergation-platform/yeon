-- 게임 좋아요. 어뷰징 방지를 위해 로그인 사용자만 좋아요할 수 있고,
-- (game_slug, user_id) 유니크로 1인 1회만 허용한다. 카운트는 누구나 조회 가능.
create table if not exists public.game_service_likes (
    id uuid primary key,
    game_slug varchar(80) not null,
    user_id uuid not null,
    created_at timestamptz not null default now(),
    unique (game_slug, user_id)
);

create index if not exists idx_game_service_likes_slug
    on public.game_service_likes (game_slug);
