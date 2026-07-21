# YEON Today 서버 기반 개편 구현 백로그

## 0. 문서 정보

| 항목           | 값                                                                         |
| -------------- | -------------------------------------------------------------------------- |
| 상태           | 구현 대기                                                                  |
| 작성일         | 2026-07-22                                                                 |
| 제품 정의 SSOT | [`../yeon-today-screen-definition.md`](../yeon-today-screen-definition.md) |
| 대상           | Spring 백엔드, API 계약·클라이언트, Next.js 웹, 후속 Expo 패리티           |
| 제외           | 이번 문서 작성 턴의 실제 기능 코드 변경                                    |
| 대체하는 결정  | 기존 Today MVP 백로그의 `localStorage` 장기 저장 결정                      |

이 백로그는 사용자가 제공한 5개 화면과 화면 정의서를 서버 기반 제품으로 구현하기 위한 실행 순서다. 구현 중 제품 행동을 바꾸면 화면 정의서와 이 백로그를 같은 PR에서 갱신한다.

기존 `today-service-mvp-20260629.md`, `today-service-calendar-navigation-20260629.md`, `today-service-design-system-board-20260630.md`는 이미 완료된 브라우저 MVP의 역사적 근거다. 앞으로 저장소·라우트·화면을 개편할 때는 이 문서의 Spring 단일 원본 결정을 우선한다.

## 1. 요구사항 요약

- YEON Today를 `할 일 보드`와 `하루 기록`으로 분리한다.
- 할 일 보드는 메인, 빈 상태, 활성 사용, 추가, 다른 날짜 선택의 5개 상태를 지원한다.
- `/today`와 `/today/record`가 `date=YYYY-MM-DD`를 공유한다.
- Today, Inbox, Done, 완료율, 월간 캘린더, 날짜 요약은 같은 사용자별 서버 데이터에서 계산한다.
- 할 일 추가·수정·이동·완료·완료 취소·삭제는 Spring 서비스가 규칙과 소유권을 검증한다.
- 로그인 사용자의 장기 상태 원본은 PostgreSQL이며 브라우저 `localStorage`가 아니다.
- 기존 `yeon.todo-service.state.v1`은 동의 기반 일회성 이관에만 사용한다.
- 웹은 TanStack Query로 서버 상태를 소비하며 Next route handler는 인증 쿠키 브리지와 Spring 호출만 담당한다.
- 데스크톱, 태블릿, 모바일 웹의 레이아웃과 접근성 요구를 충족한다.
- 하루 기록은 24개 시간 슬롯과 사용자 활동 항목을 서버에 저장한다.

## 2. 현재 상태와 변경 근거

| 현재 상태                                                             | 근거                                                                                               | 변경 방향                                                                     |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 할 일 전체 상태를 브라우저에서 읽고 쓴다.                             | `apps/web/src/features/todo-service/todo-service-storage.ts:6-20`                                  | 서버 조회·mutation으로 교체하고 이관 전용 reader만 한시 유지                  |
| 상태와 날짜·추천 계산이 단일 프론트 모델에 있다.                      | `apps/web/src/features/todo-service/todo-service-model.ts:1-95`, `206-220`                         | 계약 DTO, 서버 도메인 규칙, 순수 표시 계산으로 책임 분리                      |
| 화면이 1,407줄 단일 컴포넌트다.                                       | `apps/web/src/features/todo-service/todo-service-screen.tsx`                                       | 화면 shell, query hooks, 입력, 목록, 캘린더, 요약 컴포넌트로 분리             |
| 현재 App Router 진입점은 `/todo-service`와 `/todo-service/focus`다.   | `apps/web/src/app/todo-service/page.tsx:1-64`, `apps/web/src/app/todo-service/focus/page.tsx:1-42` | 제품 URL `/today`, `/today/record`를 추가하고 구 URL은 호환 리다이렉트        |
| subdomain 내부 경로는 `/todo-service`로 매핑된다.                     | `apps/web/src/lib/subdomain-routing.ts:27`                                                         | `todo.yeon.world` 공개 경로와 내부 App Router 매핑을 명시적으로 갱신          |
| Spring DB migration이 Flyway SSOT다.                                  | `.claude/skills/omc/context/yeon-project-context.md:85-96`                                         | 신규 DDL은 `apps/backend/src/main/resources/db/migration/`에만 추가           |
| Spring 신규 도메인은 Controller → Service → Repository 구조를 따른다. | `docs/agent-rules/server-services.md:15-38`                                                        | `today` 도메인을 동일 구조로 추가하고 `JdbcTemplate`을 사용                   |
| Today는 현재 유지보수 3종 목록에 없다.                                | `AGENTS.md:58`                                                                                     | 코드 구현 전에 Today 재활성화 범위와 web/mobile 패리티를 프로젝트 정책에 반영 |
| 공용 DTO와 queryKey는 동일 값 SSOT가 필요하다.                        | `AGENTS.md:59-63`, `docs/architecture/universal-ui-parity-registry.yaml:106-148`                   | Today 계약·queryKey·route identity를 공용 위치와 패리티 레지스트리에 등록     |

## 3. 핵심 결정

### 3.1 원칙

1. 서버 데이터가 사용자 상태의 유일한 장기 원본이다.
2. 한 상태 전이는 한 Spring 서비스 유스케이스에서 검증하고 저장한다.
3. 진행률, 탭 수, 캘린더, 요약은 동일 원본에서 파생한다.
4. 화면 상태와 네트워크 상태를 구분하고 거짓 성공을 남기지 않는다.
5. 하루 기록을 할 일 보드 안에 섞지 않고 날짜만 공유한다.

### 3.2 주요 선택지와 결정

#### 저장 방식

| 선택지                              | 장점                          | 단점                                      |
| ----------------------------------- | ----------------------------- | ----------------------------------------- |
| A. localStorage 유지                | 구현량이 작음                 | 기기 간 동기화·복구·소유권·서버 통계 불가 |
| B. localStorage + 서버 이중 쓰기    | 점진 전환처럼 보임            | 두 원본 충돌, 부분 실패, 중복 이관 위험   |
| C. Spring 단일 원본 + 일회성 import | 동기화·소유권·일관성이 명확함 | 초기 백엔드·이관 구현 필요                |

**결정: C.** 사용자가 서버 사용을 명시했고, 현재 프로젝트도 신규 장기 상태를 Spring이 소유하도록 규정한다. 운영 중 이중 쓰기는 만들지 않는다.

#### 보드 조회 방식

| 선택지                                    | 장점                             | 단점                                 |
| ----------------------------------------- | -------------------------------- | ------------------------------------ |
| A. 목록·진행률·요약을 각각 조회           | 엔드포인트가 단순함              | 레이스 시 수치가 서로 달라질 수 있음 |
| B. 선택 날짜 보드 snapshot을 한 번에 조회 | 수치 정합성과 초기 렌더가 안정적 | 응답 DTO가 조금 큼                   |

**결정: B.** `GET /api/v1/today/board?date=...`가 선택 날짜 tasks, Inbox 수, 진행률, 요약을 한 snapshot으로 반환한다. 월간 캘린더만 별도 월 조회로 분리한다.

#### 하루 기록 저장 단위

| 선택지                      | 장점                              | 단점                                     |
| --------------------------- | --------------------------------- | ---------------------------------------- |
| A. 24개 고정 시간 슬롯      | 화면·중복 방지·합계 계산이 단순함 | 30분 단위 확장 시 migration 필요         |
| B. 임의 start/duration 구간 | 향후 확장성이 큼                  | 겹침, 자정 경계, 부분 수정 규칙이 복잡함 |

**결정: A.** 첫 구현은 `0~23`시 고정 슬롯으로 시작한다. `기록 단위` 설정은 후속 ADR과 migration 없이 활성화하지 않는다.

### 3.3 URL 결정

- 공개 제품 경로: `/today`, `/today/record`
- 선택 날짜: `?date=YYYY-MM-DD`
- `todo.yeon.world/`은 오늘의 `/today`로 진입한다.
- 기존 `/todo-service`는 쿼리를 보존해 `/today`로 리다이렉트한다.
- 기존 `/todo-service/focus`는 할 일 관리 책임에서 제외한다. 별도 실행 작업대와 연결이 확정되기 전에는 `/today`로 리다이렉트하고 신규 기능을 추가하지 않는다.

## 4. 서버 도메인·DB 초안

실제 migration 번호는 구현 시작 시 `apps/backend/src/main/resources/db/migration/`의 최신 버전 다음 번호로 확정한다.

### 4.1 `public.today_tasks`

| 필드                       | 타입/제약                                                     | 의미                               |
| -------------------------- | ------------------------------------------------------------- | ---------------------------------- |
| `id`                       | `uuid primary key`                                            | 할 일 ID                           |
| `owner_user_id`            | `uuid not null references public.users(id) on delete cascade` | 로그인 사용자 소유권               |
| `title`                    | `varchar(200) not null`                                       | trim 후 1~200자                    |
| `priority`                 | `varchar(16)` check `high/normal/low`                         | 우선순위                           |
| `estimated_minutes`        | `integer` check `1..1440`                                     | 예상 시간                          |
| `category_label`           | `varchar(40)` nullable                                        | v1의 간단한 카테고리               |
| `status`                   | `varchar(16)` check `inbox/planned/done`                      | 서버 상태                          |
| `planned_date`             | `date` nullable                                               | Inbox는 null, 날짜 할 일은 값 보유 |
| `completed_at`             | `timestamptz` nullable                                        | 완료 시각                          |
| `version`                  | `bigint not null default 0`                                   | 낙관적 동시성 제어                 |
| `created_at`, `updated_at` | `timestamptz not null`                                        | 감사·정렬 기준                     |

불변조건:

- `inbox`: `planned_date is null`, `completed_at is null`
- `planned`: `planned_date is not null`, `completed_at is null`
- `done`: `planned_date is not null`, `completed_at is not null`
- 완료 취소는 `done → planned`, Inbox 이동은 완료를 취소한 뒤 `planned_date`를 null로 만든다.
- 수정·완료·삭제 쿼리는 항상 `owner_user_id`와 `id`를 함께 조건으로 사용한다.

필수 인덱스:

- `(owner_user_id, planned_date, status, created_at)`
- `(owner_user_id, status, created_at)`
- `(owner_user_id, updated_at)`

### 4.2 `public.today_local_imports`

| 필드             | 타입/제약               | 의미                              |
| ---------------- | ----------------------- | --------------------------------- |
| `id`             | `uuid primary key`      | import 실행 ID                    |
| `owner_user_id`  | `uuid not null` FK      | 소유 사용자                       |
| `migration_id`   | `varchar(120) not null` | 클라이언트가 생성한 재시도 식별자 |
| `imported_count` | `integer not null`      | 생성된 task 수                    |
| `skipped_count`  | `integer not null`      | 유효성 때문에 제외된 수           |
| `created_at`     | `timestamptz not null`  | 완료 시각                         |

- `(owner_user_id, migration_id)` unique로 재시도 중복 생성을 막는다.
- task 생성과 import 이력 기록은 하나의 transaction에서 성공하거나 함께 rollback한다.

### 4.3 `public.today_activity_types`

| 필드                       | 타입/제약              | 의미                  |
| -------------------------- | ---------------------- | --------------------- |
| `id`                       | `uuid primary key`     | 활동 ID               |
| `owner_user_id`            | `uuid not null` FK     | 소유 사용자           |
| `name`                     | `varchar(40) not null` | 활동 이름             |
| `color_token`              | `varchar(64) not null` | 허용된 디자인 토큰 키 |
| `icon_key`                 | `varchar(40) not null` | 허용된 아이콘 키      |
| `sort_order`               | `integer not null`     | 사용자 정렬           |
| `active`                   | `boolean not null`     | 숨김 여부             |
| `created_at`, `updated_at` | `timestamptz not null` | 변경 시각             |

- 사용자별 이름 중복 정책은 대소문자와 앞뒤 공백을 정규화한 뒤 검증한다.
- raw CSS 색상이나 임의 SVG/URL은 저장하지 않는다.

### 4.4 `public.today_activity_slots`

| 필드                       | 타입/제약                | 의미        |
| -------------------------- | ------------------------ | ----------- |
| `id`                       | `uuid primary key`       | 기록 ID     |
| `owner_user_id`            | `uuid not null` FK       | 소유 사용자 |
| `record_date`              | `date not null`          | 선택 날짜   |
| `hour`                     | `smallint` check `0..23` | 시간 슬롯   |
| `activity_type_id`         | `uuid not null` FK       | 활동 항목   |
| `note`                     | `varchar(200)` nullable  | 선택 메모   |
| `created_at`, `updated_at` | `timestamptz not null`   | 변경 시각   |

- `(owner_user_id, record_date, hour)` unique로 시간당 하나만 저장한다.
- 활동 항목 삭제는 기록 손실을 막기 위해 hard delete 대신 `active=false`를 기본으로 한다.

### 4.5 로컬 데이터 이관 매핑

| 기존 값                       | 서버 값                  |
| ----------------------------- | ------------------------ |
| `important / normal / light`  | `high / normal / low`    |
| `5m / 15m / 30m / 60m / 120m` | `5 / 15 / 30 / 60 / 120` |
| `inbox`                       | `inbox`                  |
| `planned / active / deferred` | `planned`                |
| `done`                        | `done`                   |
| `plannedFor`                  | `planned_date`           |
| `completedAt`                 | `completed_at`           |

- 클라이언트가 기존 JSON을 계약 스키마로 먼저 정제하고, 서버가 다시 검증한다.
- `migrationId`와 `owner_user_id`를 unique로 기록해 같은 데이터가 두 번 생성되지 않게 한다.
- 사용자가 미리보기에서 가져올 개수와 제외 개수를 확인한 뒤 동의해야 실행한다.
- import 성공 후에도 브라우저 원본은 즉시 삭제하지 않고, 서버 재조회와 개수 대조가 끝난 뒤 `importedAt` 표식만 남긴다. 실제 삭제는 별도 사용자 선택으로 둔다.

## 5. API 계약 초안

공용 Zod 계약은 `packages/api-contract/src/today.ts`, HTTP 호출은 `packages/api-client/src/today.ts`가 소유한다. wire value는 raw 문자열을 각 소비자에서 재선언하지 않는다.

### 5.1 할 일 보드 API

| Method   | Spring 경로                             | 역할                                  |
| -------- | --------------------------------------- | ------------------------------------- |
| `GET`    | `/api/v1/today/board?date=YYYY-MM-DD`   | 선택 날짜 board snapshot              |
| `GET`    | `/api/v1/today/calendar?month=YYYY-MM`  | 월별 total/open/done 요약             |
| `POST`   | `/api/v1/today/tasks`                   | 날짜 할 일 또는 Inbox 생성            |
| `PATCH`  | `/api/v1/today/tasks/{taskId}`          | 제목·우선순위·시간·카테고리·날짜 수정 |
| `POST`   | `/api/v1/today/tasks/{taskId}/complete` | 완료 전이                             |
| `POST`   | `/api/v1/today/tasks/{taskId}/reopen`   | 완료 취소 전이                        |
| `DELETE` | `/api/v1/today/tasks/{taskId}`          | 사용자 소유 할 일 삭제                |
| `POST`   | `/api/v1/today/imports/local-storage`   | 일회성 기존 데이터 이관               |

`TodayBoardResponse` 최소 구성:

```text
date
tasks[]
inboxCount
summary { totalCount, completedCount, completionRate, estimatedMinutes }
recommendation | null
serverTime
```

- `summary.completedCount`, Done 탭 수, 진행률 분자는 같은 값이다.
- 조회 응답은 서버에서 owner 조건을 적용한 결과만 포함한다.
- mutation은 `version`을 받아 stale update를 `409`로 거절하고 최신 항목을 다시 조회하게 한다.
- 다른 사용자 ID는 존재 여부를 노출하지 않도록 `404`로 처리한다.

### 5.2 하루 기록 API

| Method   | Spring 경로                                     | 역할                          |
| -------- | ----------------------------------------------- | ----------------------------- |
| `GET`    | `/api/v1/today/records/{date}`                  | 24개 슬롯과 날짜 요약 조회    |
| `PUT`    | `/api/v1/today/records/{date}/slots/{hour}`     | 시간 슬롯 생성·교체           |
| `DELETE` | `/api/v1/today/records/{date}/slots/{hour}`     | 시간 슬롯 비우기              |
| `GET`    | `/api/v1/today/activity-types`                  | 활성·비활성 활동 목록 조회    |
| `POST`   | `/api/v1/today/activity-types`                  | 활동 생성                     |
| `PATCH`  | `/api/v1/today/activity-types/{activityTypeId}` | 이름·색·아이콘·순서·활성 변경 |

### 5.3 인증과 BFF 경계

- 웹의 `apps/web/src/app/api/today/**/route.ts`는 세션에서 사용자 ID를 읽고, 입력을 Zod로 검증한 뒤 Spring client를 호출한다.
- `apps/web/src/server/today-spring-client.ts`는 내부 토큰과 신뢰된 `X-Yeon-User-Id`를 Spring에 전달하고 응답 계약을 검증한다.
- route handler에는 완료율 계산, 상태 전이, 소유권 판정, DB 접근을 넣지 않는다.
- Spring controller는 요청 파싱, service 호출, 응답만 담당한다.
- Spring service가 상태 전이·동시성·소유권을 검증하고 repository가 owner 조건 SQL을 수행한다.

## 6. 프론트엔드 구조 초안

```text
apps/web/src/features/today/
├─ today-board-screen.tsx
├─ today-record-screen.tsx
├─ today-route-state.ts
├─ today-view-state.ts
├─ components/
│  ├─ today-header.tsx
│  ├─ today-mode-tabs.tsx
│  ├─ today-progress-card.tsx
│  ├─ today-quick-add.tsx
│  ├─ today-recommendation.tsx
│  ├─ today-task-tabs.tsx
│  ├─ today-task-list.tsx
│  ├─ today-calendar.tsx
│  └─ today-date-summary.tsx
└─ hooks/
   ├─ use-today-board.ts
   ├─ use-today-calendar.ts
   └─ use-today-task-mutations.ts
```

- 서버 조회 상태는 `loading | error | empty | ready` discriminated union으로 렌더한다.
- queryKey는 공용 SSOT에서 `todayKeys.board(userScope, date)`, `todayKeys.calendar(userScope, month)`, `todayKeys.record(userScope, date)` 형태로 제공한다.
- mutation 성공 시 서버 응답으로 board/calendar 캐시를 갱신하고, 낙관적 업데이트를 쓰면 `onMutate` snapshot과 `onError` rollback을 반드시 둔다.
- 선택 날짜는 별도 localStorage가 아니라 URL `date`에서 파싱한다.
- 달력 표시 월은 화면 로컬 상태로 둘 수 있으나 선택 날짜를 바꾸지 않는다.
- quick-add 입력값만 클라이언트 폼 상태이며 저장 성공 전 서버 상태로 취급하지 않는다.

## 7. 차수별 실행 계획

### 0차 — 정책·계약·라우트 경계 확정

#### 작업내용

- `AGENTS.md:58`의 유지보수 대상에 Today를 명시하고 네이티브 모바일 UI의 단계적 도입 범위를 적는다.
- `docs/architecture/universal-ui-parity-registry.yaml`에 Today DTO, queryKey, route identity, repository 계약의 parity를 추가한다.
- `/today`, `/today/record`, 구 `/todo-service`, `/todo-service/focus`의 리다이렉트 표를 테스트 가능한 형태로 확정한다.
- 이 백로그의 DB/API 초안을 ADR로 확정하고 변경 사항을 화면 정의서에 동기화한다.

#### 논의 필요

- Today를 유지보수 4번째 서비스로 상시 포함할지, 이번 명시 지시에 한정할지 결정해야 한다.
- Expo 네이티브 화면을 web v1과 동시에 만들지, 서버 계약 안정화 뒤 차수로 분리할지 결정해야 한다.

#### 선택지

1. web과 Expo를 동시에 구현한다.
2. 공용 계약·queryKey·repository 포트까지 동일하게 만들고 web UI 후 Expo UI를 구현한다.
3. web에만 raw DTO와 queryKey를 선언한다.

#### 추천

2번. silent drift를 막는 SSOT는 먼저 만들되, 5개 상세 이미지는 웹 기준이므로 웹 사용성을 먼저 검증한다.

#### 사용자 방향

추천 기준으로 진행한다. 사용자가 Expo 동시 구현을 명시하면 1번으로 변경한다.

#### 완료 조건

- 정책과 패리티 레지스트리가 Today의 소유권을 모순 없이 설명한다.
- 모든 신규·구 route의 입력 URL과 최종 URL이 표와 테스트로 고정된다.
- 화면 정의서와 구현 백로그 사이의 용어가 일치한다.

### 1차 — Spring task 도메인, Flyway, API 계약

#### 작업내용

- 최신 Flyway 번호로 `today_tasks`와 import 이력 테이블을 추가한다.
- `apps/backend/.../today/controller`, `service`, `repository`, `dto`를 추가한다.
- board snapshot, calendar summary, create/update/complete/reopen/delete/import API를 구현한다.
- `packages/api-contract/src/today.ts`와 package export를 추가한다.
- `packages/api-client/src/today.ts`에 typed public client를 추가한다.
- 소유권, 입력 경계, 상태 전이, 동시성 충돌, 집계 정합성 테스트를 작성한다.

#### 논의 필요

- category를 v1 단순 문자열로 둘지 사용자 정의 category table을 만들지 결정해야 한다.
- 추천 결과를 board snapshot에 null 필드로 먼저 둘지 계약 자체를 2차에 추가할지 결정해야 한다.

#### 선택지

1. category table과 추천 저장값을 함께 만든다.
2. `category_label` nullable과 `recommendation: null`로 최소 계약을 만든다.

#### 추천

2번. 화면에 필요한 값을 충족하면서 사용자 정의 taxonomy와 추천 영속화를 조기에 만들지 않는다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- 사용자 A의 task ID로 사용자 B가 조회·수정·완료·삭제할 수 없다.
- 공백 제목, 0분, 1,441분, 잘못된 날짜·priority·status가 400으로 거절된다.
- 같은 `version`의 동시 수정 두 건 중 하나는 409가 되고 데이터가 조용히 덮어써지지 않는다.
- board의 total/completed/rate/estimate와 task 목록이 같은 transaction snapshot에서 일치한다.
- Spring context와 Flyway가 실제 테스트 DB에서 부팅된다.

### 2차 — Next BFF, URL 날짜 상태, 서버 조회 전환

#### 작업내용

- `/today`와 `/today/record` App Router 진입점을 만든다.
- 기존 경로 리다이렉트와 `todo.yeon.world` rewrite/canonical/SEO를 갱신한다.
- 얇은 `/api/today/**` BFF와 `today-spring-client.ts`를 구현한다.
- 공용 queryKey와 TanStack Query hooks를 연결한다.
- `date` 파서가 잘못된 값이면 오늘 날짜로 정규화하고 URL을 교정한다.
- 보드와 하루 기록 탭이 동일한 date 쿼리를 보존하게 한다.

#### 논의 필요

- `todo.yeon.world/` 주소창을 `/today`로 바꿀지 내부 rewrite만 사용할지 결정해야 한다.
- 비로그인 사용자를 로그인 화면으로 보낼지 read-only 안내를 보일지 결정해야 한다.

#### 선택지

1. 로그인 필수로 두고 인증 후 원래 `date`로 복귀한다.
2. 게스트 localStorage 보드를 계속 제공하고 로그인 후 병합한다.

#### 추천

1번. 운영 원본을 서버 하나로 고정하고 이중 저장 분기를 만들지 않는다. 기존 로컬 데이터는 로그인 후 import로만 처리한다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- `/today?date=2026-07-24` 새로고침 뒤에도 7월 24일이 유지된다.
- 보드에서 하루 기록으로 이동하고 돌아와도 date가 유지된다.
- BFF에서 임의 사용자가 `X-Yeon-User-Id`를 주입해 다른 계정으로 호출할 수 없다.
- 화면 코드에서 신규 `window.localStorage.setItem`으로 task를 저장하지 않는다.

### 3차 — 할 일 보드 5개 화면 상태 구현

#### 작업내용

- 화면 정의서의 공통 헤더, 상위 탭, 진행률, quick-add, 추천, 목록 탭, 캘린더, 날짜 요약을 컴포넌트로 분리한다.
- 메인, 빈, 활성 사용, 추가 드롭다운, 다른 날짜 선택 상태를 구현한다.
- create/update/complete/reopen/delete/date move mutation과 rollback을 연결한다.
- 정렬 기본 옵션과 우선순위·완료·예상 시간 필터를 구현한다.
- 데스크톱, 태블릿, 모바일 웹 반응형과 키보드·스크린리더 접근성을 구현한다.
- 이미지 5개와 Playwright 결과를 비교한 before/after 증거를 남긴다.

#### 논의 필요

- 추천 규칙이 1차 UI에 반드시 실제 결과를 내야 하는지, 추천 영역 empty/disabled 상태만 먼저 제공할지 결정해야 한다.
- 완료 항목을 Today 하단에 유지할지 Today에서는 숨기고 Done에서만 보일지 결정해야 한다.

#### 선택지

1. 화면 정의서대로 Today에 완료 항목을 하단 표시하고 Done은 완료 전용 필터로 둔다.
2. Today에서 완료 항목을 즉시 제거한다.

#### 추천

1번. 진행률 변화와 완료 시각을 같은 화면에서 확인할 수 있고, 정의서의 활성 사용 상태와 일치한다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- 5개 화면 ID의 진입 데이터를 fixture로 재현하고 시각 증거를 저장한다.
- 진행률 완료 수, Done 수, 요약 완료 수가 모든 fixture에서 동일하다.
- 다른 날짜의 제목·진행률·추가 버튼·요약이 날짜를 직접 표시한다.
- 제목 공백은 저장되지 않고, 저장 실패 시 폼이 유지되며 목록의 거짓 항목이 제거된다.
- 키보드로 탭, 날짜, select/menu, 체크박스, 더보기, 삭제 확인을 조작할 수 있다.

### 4차 — 기존 localStorage 일회성 이관과 운영 전환

#### 작업내용

- `yeon.todo-service.state.v1`을 읽고 정제하는 import adapter를 기존 모델에서 분리한다.
- 로그인 후 기존 데이터가 있으면 자동 실행하지 않고 import 배너와 미리보기를 제공한다.
- idempotent import API로 전송하고 서버 재조회·개수 대조 후 완료 처리한다.
- 이관 성공 사용자에게는 배너를 다시 표시하지 않는다.
- 이관 기간 종료 조건과 legacy reader 삭제 백로그를 작성한다.

#### 논의 필요

- 브라우저 데이터와 서버에 같은 제목·날짜가 있을 때 중복으로 볼지 병합할지 결정해야 한다.
- 이관 기능을 몇 번의 릴리즈 동안 유지할지 결정해야 한다.

#### 선택지

1. 제목·날짜가 같으면 자동 병합한다.
2. 각 로컬 ID를 서버 import key로 보존해 전부 가져오고, import 자체만 중복 방지한다.

#### 추천

2번. 제목이 같은 별도 할 일을 잘못 합치는 데이터 손실을 피한다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- 같은 import를 네트워크 재시도로 두 번 보내도 서버 task 수가 한 번만 증가한다.
- 손상된 로컬 항목은 제외 개수와 이유를 보여주고 유효 항목 이관을 막지 않는다.
- 서버 조회 대조가 실패하면 로컬 데이터를 삭제하거나 import 완료로 표시하지 않는다.
- 신규 task mutation은 localStorage에 이중 쓰기하지 않는다.

### 5차 — 하루 기록 24시간 화면과 활동 관리

#### 작업내용

- activity type과 24개 slot Flyway migration을 추가한다.
- Spring record/activity API, 계약, client, query hooks를 구현한다.
- `/today/record`에 24개 슬롯, 날짜 요약, 활동 선택, 활동 관리 진입을 구현한다.
- 기본 활동 seed는 사용자 최초 진입 시 서버에서 idempotent하게 생성한다.
- 색상과 아이콘은 허용된 토큰/키 목록만 저장한다.

#### 논의 필요

- 최초 기본 활동을 DB migration으로 공용 생성할지 사용자별 lazy seed로 만들지 결정해야 한다.
- 시간 슬롯 메모를 1차에 포함할지 결정해야 한다.

#### 선택지

1. 사용자별 최초 조회 시 service가 기본 활동을 idempotent 생성한다.
2. 클라이언트가 기본 활동을 POST한다.

#### 추천

1번. 여러 클라이언트가 접속해도 기본 데이터 생성 규칙을 서버 하나에서 보장한다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- 같은 날짜와 hour에는 활동 슬롯이 하나만 존재한다.
- 활동 수정·숨김 후 과거 기록의 이름·색 참조가 깨지지 않는다.
- 보드와 기록 탭 사이에서 date가 유지된다.
- 채운 시간 수와 기록률, 활동별 시간 합계가 서버 응답과 일치한다.

### 6차 — 추천·고급 필터·통계와 네이티브 패리티

#### 작업내용

- 우선순위, 예상 시간, 미룬 기간, 선택 날짜를 이용한 설명 가능한 추천 점수를 구현한다.
- 추천 이유를 응답에 포함하고 자동 실행·자동 완료는 하지 않는다.
- 상세 통계, 월간 활동 분석, 계획 대비 실제 시간 비교를 구현한다.
- Expo Today 화면 또는 공용 화면을 연결하고 공용 계약·queryKey·repository 포트를 그대로 소비한다.
- 이후 드래그 날짜 이동, 주간 리포트, 패턴 분석을 독립 백로그로 분리한다.

#### 논의 필요

- 추천을 Spring에서 계산할지 클라이언트 순수 함수로 계산할지 결정해야 한다.
- 통계 보관 기간과 삭제 정책을 결정해야 한다.

#### 선택지

1. 추천을 저장하지 않고 서버 응답 시 결정론적으로 계산한다.
2. 추천 점수와 순위를 task 테이블에 저장한다.

#### 추천

1번. 추천은 원본이 아니라 파생값이며 저장하면 stale 상태가 생긴다.

#### 사용자 방향

추천 기준으로 진행한다.

#### 완료 조건

- 같은 snapshot 입력은 같은 추천 순서와 이유를 반환한다.
- 추천은 사용자의 명시적 선택 없이 task 상태를 변경하지 않는다.
- web/mobile이 DTO, queryKey, route identity를 중복 선언하지 않는다.
- 통계 수치가 원본 task/activity 합계와 대조 테스트에서 일치한다.

## 8. 테스트 가능한 전체 인수 조건

1. 로그인 사용자가 브라우저 A에서 만든 할 일을 브라우저 B에서 같은 날짜로 조회할 수 있다.
2. 로그아웃·재로그인과 캐시 삭제 후에도 서버 저장 데이터가 유지된다.
3. 사용자 A의 ID를 알고 있어도 사용자 B가 A의 할 일을 변경하거나 존재 여부를 확인할 수 없다.
4. `/today?date=2026-07-24`와 `/today/record?date=2026-07-24`가 같은 날짜를 표시한다.
5. Today 수, 완료 수, Done 수, 진행률, 날짜 요약이 단일 snapshot에서 모순되지 않는다.
6. 할 일 제목은 trim 후 1~200자, 예상 시간은 1~1,440분만 저장된다.
7. mutation 실패 시 폼 입력은 유지되고 낙관적으로 바뀐 목록·수치가 rollback된다.
8. 기존 localStorage import를 같은 `migrationId`로 반복해도 중복 task가 생기지 않는다.
9. 메인·빈·활성·추가·날짜 선택 상태가 저장된 5개 기준 이미지의 위계와 동작을 충족한다.
10. 24시간 기록에서 한 사용자·날짜·시간에는 최대 하나의 활동만 저장된다.
11. 데스크톱, 태블릿, 모바일 웹에서 가로 스크롤 없이 주요 행동을 수행할 수 있다.
12. 키보드와 화면 읽기 도구가 활성 탭, 선택 날짜, 오늘, 완료, 오류 상태를 인식한다.
13. `/todo-service` 기존 링크는 date를 잃지 않고 `/today`로 이동한다.
14. task 장기 상태를 쓰는 localStorage 코드는 이관 adapter 외에는 남지 않는다.

## 9. 검증 계획

### 9.1 단위 테스트

- contract: 날짜, 제목, priority, estimate, partial update, 응답 snapshot 스키마
- Spring service: 생성, 날짜 이동, Inbox 이동, 완료, 완료 취소, stale version, 소유권
- repository: owner 조건, 집계, 정렬, 월간 경계, unique slot
- web 순수 함수: URL date, 완료율 0/100, 표시 문구, 필터·정렬

### 9.2 통합 테스트

- Flyway migration + Spring ApplicationContext 부팅
- 실제 PostgreSQL에서 board snapshot과 calendar summary 대조
- BFF 세션 → 내부 헤더 → Spring owner 경계
- localStorage import idempotency와 부분 손상 입력
- activity type 비활성 후 과거 slot 조회

### 9.3 E2E·시각 검증

- Playwright로 5개 화면 상태를 fixture 계정에 구성한다.
- 1440px 데스크톱, 태블릿, 390px 모바일 웹 스크린샷을 저장한다.
- 추가 → 완료 → 완료 취소 → 다른 날짜 이동 → Inbox 이동 → 삭제 흐름을 검증한다.
- 보드 ↔ 하루 기록 탭 전환과 새로고침에서 date 보존을 검증한다.
- 키보드 전용 흐름과 axe 접근성 검사를 실행한다.

### 9.4 구현 시 기본 명령

실제 스크립트 존재 여부를 각 차수 시작 시 다시 확인한다.

```bash
cd apps/backend && ./gradlew test --tests '*Today*'
cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'
pnpm --filter @yeon/api-contract typecheck
pnpm --filter @yeon/api-client typecheck
pnpm --filter @yeon/web lint
pnpm --filter @yeon/web typecheck
pnpm --filter @yeon/mobile typecheck
pnpm verify:parity
```

라우팅, API route, migration, 환경 경계를 변경하는 차수는 배포 전 `pnpm --filter @yeon/web build`와 관련 backend image/build gate까지 수행한다.

## 10. 위험과 완화

| 위험                                     | 사용자 영향                                     | 완화                                                                   |
| ---------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| Today가 현재 유지보수 정책에서 빠져 있음 | 후속 에이전트가 변경을 거부하거나 패리티를 누락 | 0차에서 정책과 레지스트리를 먼저 갱신                                  |
| localStorage와 서버 이중 원본            | 중복·유실·기기별 다른 상태                      | 운영 이중 쓰기 금지, 동의 기반 idempotent import만 허용                |
| BFF 사용자 헤더 spoof                    | 다른 사용자 데이터 접근                         | 외부 헤더 무시, 세션에서 user ID 재구성, 내부 토큰 검증                |
| 여러 API 응답 간 수치 drift              | 진행률·Done·요약 불일치                         | board snapshot 단일 응답과 서버 집계 사용                              |
| 날짜·시간대 오해                         | 다른 날짜에 저장·완료 표시                      | 계획 날짜는 명시적 `date`, 완료 시각은 서버 timestamp, URL 파서 단일화 |
| 1,407줄 화면에 기능 추가                 | 상태 결합·회귀 증가                             | 컴포넌트·query hook·view state로 책임 분리 후 상태 연결                |
| 하루 기록 범위가 보드 출시를 지연        | 5개 화면도 끝나지 않음                          | 보드 1~4차 완료 뒤 5차로 분리                                          |
| 이미지 예시 숫자 불일치                  | 구현마다 다른 해석                              | 화면 정의서의 수치 의미를 SSOT로 사용                                  |
| 낙관적 mutation rollback 누락            | 저장 실패 후 거짓 완료 상태                     | query snapshot/rollback 테스트와 실패 E2E 추가                         |

## 11. 배포·관찰·롤백

- migration은 additive하게 배포하고 기존 localStorage UI를 즉시 삭제하지 않는다.
- backend/API가 정상 응답하는 것을 확인한 뒤 새 `/today` UI를 활성화한다.
- 초기 릴리즈는 오류율, 401/403/409/5xx, mutation latency, import 성공·제외·중복 차단 수를 구조화 로그로 관찰한다.
- 심각한 UI 문제가 있으면 새 route 노출을 이전 화면으로 되돌릴 수 있지만, 서버에 저장된 신규 데이터와 migration은 삭제하지 않는다.
- import 장애 시 import CTA만 비활성화하고 task CRUD는 유지한다.
- 롤백 과정에서도 localStorage로 다시 이중 쓰기하지 않는다.

## 12. 문서 갱신 규칙

- 화면 문구, 숫자 의미, 상태 전이가 바뀌면 `docs/product/yeon-today-screen-definition.md`를 같은 PR에서 수정한다.
- API/DB 결정이 바뀌면 이 문서의 핵심 결정과 해당 차수에 변경 이유를 남긴다.
- 구현 완료 차수는 체크리스트와 검증 증거 링크를 추가하고, 전체 완료 후 파일명에 `(완)`을 붙여 history로 이동한다.
- 원본 5개 이미지는 기준 자료로 보존한다. 새 시안이 승인되면 버전을 구분해 추가하고 기존 파일을 조용히 덮어쓰지 않는다.
