-- 카드방 status 모델 재설계(audit findings 20, 21).
-- 방 status는 방 수준 라이프사이클만 표현하고(WAITING/IN_PROGRESS/FINISHED/CLOSED),
-- 카드 단위 진행 상태(정답 공개)는 별도 컬럼 current_card_revealed로 분리한다.

alter table public.card_rooms
  add column if not exists current_card_revealed boolean not null default false;

-- 정답이 공개된 상태(revealed)였던 진행 중 방은 공개 플래그를 살려둔다.
update public.card_rooms
  set current_card_revealed = true
  where status = 'revealed';

-- 카드 단위 상태로 방 status에 압축돼 있던 값들을 방 수준 IN_PROGRESS로 정리한다.
-- (카드별 결과는 card_room_results에 이미 누적되어 있으므로 손실 없음.)
update public.card_rooms
  set status = 'in_progress'
  where status in ('answering', 'passed', 'given_up', 'revealed');
