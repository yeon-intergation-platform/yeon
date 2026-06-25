-- 게임 허브(game.yeon.world) 각 게임 상세의 댓글.
-- 로그인 사용자는 author_user_id + display_name/avatar_url(세션 스냅샷)로,
-- 게스트는 display_name(닉네임) + guest_password_hash(BCrypt)로 작성한다.
-- 비밀댓글(is_secret)은 작성자/운영자만 열람, 게스트는 비밀번호로 확인한다.
create table if not exists public.game_service_comments (
    id uuid primary key,
    game_slug varchar(80) not null,
    author_user_id uuid null,
    display_name varchar(80) not null,
    avatar_url varchar(2048) null,
    guest_password_hash varchar(255) null,
    content text not null,
    is_secret boolean not null default false,
    created_at timestamptz not null default now(),
    deleted_at timestamptz null
);

create index if not exists idx_game_service_comments_slug_created
    on public.game_service_comments (game_slug, created_at desc);
