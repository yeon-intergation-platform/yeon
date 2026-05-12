# Next.js 백엔드 역할 Spring 전체 이관 백로그 (2026-05-12)

## 배경

`origin/main` 기준 `apps/web/src/app/api`에는 총 140개 route handler가 있고, 이 중 `api/v1` route handler는 122개다. `chat-service/auth`는 이미 Spring 호출 + Next 쿠키 브리지 구조로 전환되어 있으나, 루트 인증과 counseling-records 일부, Google Sheets/export, typing seed/default helpers 등은 아직 Next.js가 DB/도메인/외부 연동 오케스트레이션을 직접 맡고 있다.

이 백로그의 목표는 Next.js를 장기 백엔드 소유자가 아니라 브라우저 호환 BFF/쿠키/리다이렉트/파일 스트림 브리지로만 남기고, 인증을 포함한 DB 쓰기·세션 변이·도메인 규칙·AI/외부 연동 실행의 source of truth를 Spring(`apps/backend`)으로 옮기는 것이다.

## 현재 식별된 Next.js 백엔드 소유권

- 루트 인증
  - `apps/web/src/app/api/auth/**`
  - `apps/web/src/app/api/v1/auth/session/route.ts`
  - `apps/web/src/app/api/v1/mobile/auth/credentials/login/route.ts`
  - `apps/web/src/server/auth/**`
  - 직접 소유: `auth_sessions`, `users`, `user_identities`, credential/password reset/email verification/social OAuth 상태.
- Counseling records
  - `apps/web/src/app/api/v1/counseling-records/**`
  - 직접 소유: record 생성, text memo 생성, transcription retry/schedule, AI 분석/chat/검색, transcript segment 수정.
- Export/Google Sheets BFF
  - `apps/web/src/server/google-sheets-export-service.ts`
  - `apps/web/src/server/sheet-export-bff.ts`
  - 직접 소유: export/import/sync orchestration, 파일 생성 일부.
- Typing/card 보조 백엔드 역할
  - `apps/web/src/server/typing-deck-defaults.ts`
  - `apps/web/src/server/typing-race-seed.ts`
  - 일부 route handler의 서버 기본값/seed 생성.
- 허용 가능한 Next.js 잔존 역할
  - 인증 쿠키 읽기/쓰기/삭제.
  - OAuth 브라우저 redirect/state 전달.
  - Spring 호출 BFF.
  - Spring이 생성한 파일/스트림을 브라우저 응답으로 전달.

## 1차: 루트 인증 세션 Spring 소유 전환

### 작업내용

- Spring에 root auth session 조회/삭제 endpoint를 추가한다.
- Spring이 `auth_sessions` token hash 검증, 만료 세션 삭제, user/identity 조회, `last_accessed_at` 갱신을 맡는다.
- Next.js의 `api/v1/auth/session`, `api/auth/logout`, `api/auth/session/cleanup`은 세션 토큰 추출과 쿠키 삭제만 담당하고 Spring에 위임한다.
- 기존 `@yeon/api-contract/auth` 응답 shape은 유지한다.

### 논의 필요

- `AUTH_SECRET`을 Spring에도 동일하게 주입해야 token hash 호환이 유지된다.
- route path는 기존 root auth와 충돌을 피하기 위해 Spring 내부 API로 `/auth/session`을 우선 사용한다.

### 선택지

1. 세션 조회/삭제만 먼저 Spring으로 이동한다.
2. credential login/register까지 한 번에 이동한다.
3. social OAuth까지 한 번에 이동한다.

### 추천

1번. 세션 조회/삭제는 credential/social 발급 로직보다 작고, 기존 쿠키/계약을 보존하면서 Spring 인증 소유권을 검증하기 쉽다.

### 사용자 방향

추천 기준으로 진행한다.

## 2차: credential 인증 Spring 전환

### 작업내용

- credential login/register/email verification/resend/reset request/reset confirm/set password/mobile login을 Spring으로 이동한다.
- password hash, verification token, password reset token, email 발송 경계를 Spring 서비스로 재정의한다.
- Next route는 form payload 검증과 쿠키/redirect bridge만 유지한다.

### 논의 필요

- 기존 이메일 발송 구현을 Spring에서 직접 소유할지, 임시 내부 adapter를 둘지 결정해야 한다.
- 모바일 로그인 응답의 token/cookie 병행 정책을 유지해야 한다.

### 선택지

1. web credential login/register부터 이동 후 reset/verify를 후속 이동.
2. credential 전체를 한 PR로 이동.
3. 모바일 login만 별도 이동.

### 추천

1번. 로그인/회원가입이 세션 생성 source of truth를 결정하므로 먼저 옮기고, reset/verify는 토큰 만료/메일 발송 검증과 함께 분리한다.

### 사용자 방향

추천 기준으로 진행한다.

## 3차: social OAuth Spring 전환

### 작업내용

- Google/Kakao provider token exchange, profile fetch, user identity upsert, session 생성 책임을 Spring으로 이동한다.
- Next는 authorization URL redirect와 callback code/state 전달, 최종 쿠키 설정만 담당한다.

### 논의 필요

- provider별 client secret은 Spring 런타임 환경변수로 이동해야 한다.
- PKCE/state 저장소를 Spring에서 소유할지, 브라우저 쿠키 bridge로 유지할지 결정해야 한다.

### 선택지

1. callback 처리만 Spring으로 이동하고 start redirect는 Next 유지.
2. provider authorization URL 생성까지 Spring으로 이동.
3. provider별로 Google → Kakao 순차 이동.

### 추천

1번과 3번 조합. 브라우저 redirect UX 리스크를 낮추면서 provider별 회귀를 작게 만든다.

### 사용자 방향

추천 기준으로 진행한다.

## 4차: counseling-records Spring 전환

### 작업내용

- record 생성, text memo 생성, transcription queue/retry, analysis, chat, web search, segment update/bulk update를 Spring으로 이동한다.
- Next streaming route는 Spring stream proxy만 담당하거나 제거한다.

### 논의 필요

- AI 호출 wrapper와 STT/queue 처리의 Spring 구현 순서를 정해야 한다.
- 기존 진행 중 작업/실패 재시도 상태의 DB source of truth를 Spring 서비스로 통일해야 한다.

### 선택지

1. segment update 같은 DB write부터 이동.
2. record 생성/queue부터 이동.
3. AI streaming부터 이동.

### 추천

1번 → 2번 → 3번. 작은 DB write로 Spring repository 경계를 검증한 뒤 queue/AI로 넓힌다.

### 사용자 방향

추천 기준으로 진행한다.

## 5차: export/typing 보조 백엔드 역할 정리

### 작업내용

- Google Sheets export/import/sync orchestration을 Spring으로 이동한다.
- typing deck defaults/race seed 생성 책임을 Spring endpoint 또는 pure shared package + Spring endpoint로 이동한다.
- Next는 파일 응답 proxy와 화면용 BFF만 유지한다.

### 논의 필요

- 파일 생성 라이브러리/Google API credential을 Spring으로 완전히 이동할지 확인해야 한다.
- seed 생성이 pure domain logic이면 `packages/domain`/`packages/typing-race-engine` 재사용 가능성을 먼저 본다.

### 선택지

1. Sheets/export 먼저 이동.
2. typing seed/default 먼저 이동.
3. 사용 빈도/리스크 기준으로 별도 PR 분리.

### 추천

3번. export는 외부 API와 파일 생성 리스크가 크고, typing seed는 사용자 체감 회귀가 크므로 각각 독립 검증한다.

### 사용자 방향

추천 기준으로 진행한다.

## 6차: dead code/dead route cleanup

### 작업내용

- Spring 전환 완료 route의 `apps/web/src/server/**` 서비스/레포지터리/DB 직접 접근을 제거한다.
- route handler에서 `@/server/services/(?!service-error)`, `@/server/repositories`, `@/server/db/schema` 직접 import가 남지 않도록 스캔을 검증 항목으로 고정한다.

### 논의 필요

- migration 완료 전까지 호환 shim을 얼마나 오래 둘지 결정해야 한다.

### 선택지

1. 각 전환 PR마다 해당 dead code를 즉시 제거.
2. 기능 전환 완료 후 cleanup PR로 일괄 제거.

### 추천

1번. 실제 소비자가 사라진 시점에 제거해야 Next 백엔드 역할이 다시 늘어나는 것을 막을 수 있다.

### 사용자 방향

추천 기준으로 진행한다.
