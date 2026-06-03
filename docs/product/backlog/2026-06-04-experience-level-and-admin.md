# 경험치/레벨 시스템 + 어드민 페이지

작성일: 2026-06-04

## 배경 / 목표

1. **어드민 페이지 강화**: 유저 목록(존재하는 사용자), 각 유저가 만든 카드(덱) 조회.
2. **경험치/레벨**: 우리 서비스를 사용한 사용자가 전역 단일 레벨/경험치를 가진다. 레벨·경험치가 보인다.
3. **이력**: 사용자는 자신의 경험치 증가 이력을 볼 수 있다.

## 확정된 제품 결정 (사용자)

- **전역 단일 레벨**: 유저당 레벨·경험치 하나. 카드·타자·커뮤니티 활동이 같은 경험치로 합산.
- **경험치 소스 4종**: 카드덱/카드방 생성·학습 완료, 타자 레이스 완료, 커뮤니티 활동, 로그인/출석.
- **웹·모바일 동시**(card/typing/community는 Universal UI 공유).
- 동결 counseling/CRM 제외.

## 설계 기준 (추천 기본값 — 추후 튜닝 가능)

- **레벨 커브**(백엔드 SSOT, 순수 함수): 레벨 L→L+1 필요 경험치 = `100 * L`. 누적(레벨 L 도달) = `100 * (L-1)*L/2`.
  표시는 백엔드가 `{ level, xpIntoLevel, xpForNextLevel, totalXp }`로 내려준다(웹/모바일은 커브 미보유).
- **적립량(상수, 튜닝 가능)**: deck_created +20, card_room_finished +50, typing_race_finished +30, community_post +10, daily_login +10.
- **멱등성/어뷰즈 방지**: `experience_log`에 `UNIQUE(user_id, activity_type, reference_id)`.
  reference_id = 덱 publicId / 방 publicId / 레이스 id / 글 id / 로그인 날짜(YYYY-MM-DD).
  적립은 서버 권위적·트랜잭션. 같은 이벤트 재적립·삭제 후 재생성 어뷰즈 차단.

## 스키마 (Flyway V14)

- `public.user_experience(user_id uuid PK→users, total_xp bigint, created_at, updated_at)` — total_xp가 SoT, 레벨은 읽기 시 커브로 계산.
- `public.experience_log(id, user_id uuid→users, activity_type varchar, xp_amount int, reference_id text, total_xp_after bigint, created_at, UNIQUE(user_id, activity_type, reference_id))`.
- 인덱스: `experience_log(user_id, created_at desc)`.

## 차수 계획

### 1차 — 백엔드 경험치 도메인 + 어드민 (이 차수부터 착수)

작업내용:

- Flyway V14 마이그레이션(두 테이블).
- `user_experience` 도메인: LevelCurve(순수), ExperienceRepository(JdbcTemplate), ExperienceService.award(userId, activityType, refId, amount) 멱등 트랜잭션.
- 조회 API: `GET /api/v1/user-experience`(현재 유저), `GET /api/v1/user-experience/history`.
- 적립 훅(백엔드 인프로세스): 카드덱 생성, 카드방 FINISHED, 커뮤니티 글, 로그인/출석(AuthSession). 타자 레이스는 4차.
- 어드민 API: 유저 목록(+레벨/경험치/덱 수), 특정 유저가 만든 카드덱 목록. requireAdmin 재사용.
- 단위 테스트(멱등성·레벨 커브·award).

논의 필요: 적립량/커브 수치(기본값으로 진행, 추후 튜닝). 커뮤니티 글 어뷰즈(일일 상한) — 기본 일일 상한 도입.
선택지: (a) 레벨 저장 vs 계산 — 계산(드리프트 없음) 채택. (b) 적립 동기 호출 vs 이벤트 — 동기 트랜잭션 채택(단순·정합).
추천/사용자 방향: 위 추천대로 진행.

### 2차 — 계약 + 웹 사용자 표시/이력 + 어드민 웹 페이지

- `packages/api-contract/user-experience.ts`(Zod), `packages/api-client` 메서드.
- 웹: ProductHeader 레벨 배지, `/profile` 레벨·경험치 섹션, `/profile`(또는 전용) 경험치 이력 화면.
- 어드민 웹: `/admin` 유저 목록(레벨/덱 수) + 유저별 카드 상세. `getCurrentAdminUser` 가드 재사용.
- TanStack Query 훅 + queryKey SSOT(포트).

### 3차 — 모바일 패리티

- Universal UI(@yeon/ui)로 레벨 배지/프로필/이력 공유. 패리티 레지스트리 등록(queryKey identical-value, repository 포트 shared-contract).
- 모바일 헤더/프로필에 배지·이력.

### 4차 — 타자 레이스 경험치 훅

- race-server(Colyseus) 레이스 완료 → Spring 적립 엔드포인트(내부 토큰) 호출. 멱등 refId=레이스 id.

## 검증

- 차수별 백엔드 단위 테스트 + lint/typecheck. 스키마는 drift 점검. 웹 빌드는 CD 게이트.
- 적립 멱등성(중복 이벤트 1회만), 레벨 커브 경계, 어드민 권한 게이트 테스트로 방어.
