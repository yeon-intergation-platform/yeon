-- 댓글 좋아요. 로그인 사용자만, 댓글당 1회(unique). 카운트는 누구나 조회.
create table if not exists public.game_service_comment_likes (
    id uuid primary key,
    comment_id uuid not null,
    user_id uuid not null,
    created_at timestamptz not null default now(),
    unique (comment_id, user_id)
);

create index if not exists idx_game_service_comment_likes_comment
    on public.game_service_comment_likes (comment_id);
