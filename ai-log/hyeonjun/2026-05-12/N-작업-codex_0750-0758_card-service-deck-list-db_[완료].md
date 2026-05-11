# card-service deck list db stability 작업 로그

- 요청: 카드서비스에서 “내 덱 목록을 불러오지 못했습니다”가 뜨는 문제 해결. 로컬 DB 원인 여부와 운영 영향 판단.
- 초기 판단: `/api/v1/card-decks`는 Next route가 Spring `/card-decks`를 호출하고, Spring repository는 `public.card_decks` / `public.card_deck_items` / `public.users`를 조회한다. Spring Flyway에는 해당 public card schema 보장 migration이 없어 로컬 DB에서 relation missing 가능성이 높다.
- 목표: Spring 기동 시 card-service public schema 객체를 안전하게 보장하고 운영 기존 데이터에는 비파괴적으로 적용한다.

## 진행

- Spring Flyway `V4__ensure_public_card_decks_tables.sql` 추가:
  - `public.card_decks`, `public.card_deck_items` 생성 보장.
  - SRS 컬럼(`review_difficulty`, `last_reviewed_at`, `next_review_at`)과 이미지 컬럼 보강.
  - `public.users.card_study_mode`는 users 테이블이 있을 때만 보강.
  - FK/constraint는 중복 시 무시하고, 운영 기존 데이터 검증을 강제하지 않도록 `NOT VALID` 사용.
- 로컬 `yeon-local-db/yeon_local`에 같은 SQL을 수동 적용해 즉시 복구 가능 상태로 보강.
- 검증:
  - `cd apps/backend && ./gradlew test --tests '*CardDeck*'` 성공.
  - disposable Postgres DB에서 migration 2회 반복 적용 성공.
  - 로컬 DB에서 card deck list SQL 조회 성공.
- 참고: `BootstrapHeartbeatRepositoryTests` 단독 실행은 `CounselingRecordAudioStorage` env 누락으로 실패했으며, 이번 migration SQL 실패와 무관하다.
