-- 카드방 동시성/무결성 보강 (감사 수정)

-- 동일 사용자/게스트의 활성 중복 참가자 방지(동시 입장 TOCTOU 방어).
create unique index if not exists card_room_participants_active_user_unique
  on public.card_room_participants(room_id, user_id)
  where left_at is null and user_id is not null;
create unique index if not exists card_room_participants_active_guest_unique
  on public.card_room_participants(room_id, guest_id)
  where left_at is null and guest_id is not null;

-- 방마다 활성 호스트 1명 유일성 강제(유령/중복 호스트로 인한 행 복제 방지).
create unique index if not exists card_room_participants_active_host_unique
  on public.card_room_participants(room_id)
  where left_at is null and is_host = true;

-- 같은 참가자가 같은 카드에 결과를 여러 번 제출하는 중복 방지(IDX 25/105).
-- 서로 다른 참가자는 같은 카드에 각자 결과를 남길 수 있어야 하므로 participant_id 까지 포함한다.
create unique index if not exists card_room_results_room_card_participant_unique
  on public.card_room_results(room_id, card_id, participant_id);

-- IDX 107: card_rooms.owner_user_id 에 public.users(id) FK 추가 + 소유자 조회용 부분 인덱스.
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.card_rooms
      ADD CONSTRAINT card_rooms_owner_user_id_users_id_fk
      FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE set null
      NOT VALID;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

create index if not exists card_rooms_owner_user_id_idx
  on public.card_rooms(owner_user_id)
  where owner_user_id is not null;

-- IDX 81: SheetIntegrationRepository.findMemberInternalIdByName 의 space_id+name 조회 대응 인덱스.
create index if not exists members_space_name_idx
  on public.members(space_id, name);

-- IDX 82: existsActivityLog 의 (member_id, recorded_at, type) 중복 검사 대응 인덱스.
create index if not exists activity_logs_member_type_recorded_at_idx
  on public.activity_logs(member_id, type, recorded_at);

-- IDX 177: member_field_definitions 의 (space_id, tab_id) 필터 및 tab 삭제 cascade 대응 인덱스.
create index if not exists member_field_definitions_space_tab_idx
  on public.member_field_definitions(space_id, tab_id);

-- IDX 41: 피드 루트/답글 목록 정렬(created_at desc)에 부합하는 인덱스.
-- 루트 피드: where reply_to_post_id is null order by created_at desc limit 30
create index if not exists chat_service_feed_posts_root_created_idx
  on public.chat_service_feed_posts(created_at desc)
  where reply_to_post_id is null;
-- 답글 목록: where reply_to_post_id = :postId order by created_at desc limit 50
create index if not exists chat_service_feed_posts_reply_created_idx
  on public.chat_service_feed_posts(reply_to_post_id, created_at desc);
