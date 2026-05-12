# Next 백엔드 역할 제거 및 Spring Flyway 단일화 계획

## 배경

현재 `apps/web`의 Next.js API route는 Spring 전환이 많이 진행되었지만, 보수 기준으로 아직 16개 route가 백엔드 역할을 남기고 있다.

- 현재 기준: `97 / 113 = 85.8%`
- 목표 기준: `113 / 113 = 100%`
- 같은 DB를 Next/Drizzle과 Spring/Flyway가 함께 바라보는 전환 구간이므로, DB schema 변경 경로를 최종적으로 Spring Flyway 하나로 수렴시킨다.

## 최종 원칙

- DB schema 변경은 Spring Flyway만 담당한다.
- DB 직접 접근은 Spring만 담당한다.
- 도메인 read/write, 권한 판정, 세션/인증 상태 원천, 장기 상태 저장은 Spring만 담당한다.
- Next.js는 화면, 라우팅, SEO, Spring API 호출, 얇은 호환/브리지 역할만 담당한다.
- CI에 무거운 boundary gate를 새로 만들기보다, 자동 migration 제거와 코드 구조 정리로 실수유발요인을 먼저 제거한다.

## Next.js가 최종적으로 맡는 역할

- App Router 기반 화면 렌더링
- Client Component / RSC 조합 UI
- 폼/로딩/optimistic UI 같은 UX 상태
- Spring API client 호출
- 기존 프론트 계약 유지를 위한 얇은 `/api/v1` 호환 proxy
- 인증 쿠키 전달/교환 bridge
- OAuth callback, 파일/스트림 전달처럼 브라우저 제약이 있는 BFF adapter
- SEO metadata, sitemap, robots, redirect

## Next.js가 맡지 않는 역할

- DB migration 실행 또는 생성
- DB schema의 source of truth
- DB read/write 직접 접근
- repository/service 기반 도메인 로직
- 권한 판정의 원천
- 세션/인증 상태의 원천
- 장기 상태 저장
- 외부 AI 호출의 도메인 orchestration 원천

## 1차 — Next 자동 DB migration 중지

### 작업내용

- `apps/web` 개발 서버 시작 시 `drizzle-kit migrate`가 자동 실행되지 않게 한다.
- `apps/web`의 README에 Next 책임을 UI/BFF 중심으로 재정의한다.
- `db:generate`, `db:migrate`는 Spring 전환 중 실수 방지를 위해 실패 메시지로 바꾼다.
- Drizzle migration 파일은 즉시 삭제하지 않고 legacy evidence로 보존한다.

### 논의 필요

- Drizzle 파일과 의존성을 언제 삭제할지 결정해야 한다.

### 선택지

- A. 자동/수동 Drizzle write 명령만 차단하고 파일은 보존한다.
- B. Drizzle 관련 파일과 의존성을 즉시 삭제한다.
- C. CI boundary gate까지 추가한다.

### 추천

A를 먼저 적용한다. 같은 DB를 쓰는 상황에서 migration 실행은 즉시 위험하지만, 기존 migration 파일은 Spring Flyway 이관 대조의 증거로 필요하다. 사용자가 CI gate는 필요 없다고 했으므로 C는 이번 계획의 기본 경로에서 제외한다.

### 사용자 방향

사용자 방향이 비어 있으면 A로 진행한다.

## 2차 — Drizzle migration 이관 지도 작성

### 작업내용

- `apps/web/src/server/db/migrations/0000~0038`을 도메인별로 분류한다.
- Spring Flyway `V1~V4`와 중복되거나 이미 보정된 DDL을 표시한다.
- 기존 DB에 적용된 Drizzle 이력과 신규 환경에 필요한 Flyway DDL을 분리한다.

### 논의 필요

- 기존 운영 DB의 Flyway baseline 지점을 어디로 둘지 확인해야 한다.

### 선택지

- A. 기존 DB는 baseline 처리하고 신규 DDL부터 Flyway 관리한다.
- B. 기존 Drizzle DDL을 모두 idempotent Flyway migration으로 재작성한다.
- C. 잔여 Spring route 전환에 필요한 테이블부터 도메인별로 보정 migration을 추가한다.

### 추천

C를 기본으로 하되, 운영/스테이징 DB baseline 확인 뒤 A를 병행한다. 이미 같은 DB에 적용된 DDL을 무리하게 재실행하지 않는다.

### 사용자 방향

사용자 방향이 비어 있으면 C+A 병행으로 진행한다.

## 3차 — 작은 잔여 route부터 100% 전환

### 작업내용

보수 기준 잔여 16개를 작은 단위부터 Spring으로 옮긴다.

1. `typing-character-frames` 2개
   - Next repository 직접 접근 제거
   - Spring read/write API 추가
2. `public-check-sessions` 3개
   - token 조회, verify, submit 판정과 저장을 Spring으로 이동
   - Next는 공개 페이지와 Spring 호출 bridge만 유지
3. `card-decks/assets` 2개
   - asset metadata/권한/저장키 관리를 Spring으로 이동
   - Next는 필요한 경우 stream/proxy만 유지
4. `integrations/local` 2개
   - local import draft 상태와 분석 결과를 Spring으로 이동
5. `counseling-records` 잔여 7개
   - 분석, 채팅, 세그먼트, 전사 orchestration을 Spring으로 이동
   - 외부 AI 호출 wrapper도 Spring 경계에 맞춘다.

### 논의 필요

- 상담 분석/전사는 외부 AI 호출과 파일 처리까지 얽혀 있어 마지막 묶음으로 두는 것이 안전한지 확인한다.

### 선택지

- A. 작은 route부터 순차 전환한다.
- B. counseling-records를 먼저 큰 PR로 전환한다.
- C. 서비스별 병렬 전환을 한다.

### 추천

A를 추천한다. 진행률을 안전하게 올리고, 큰 상담 도메인은 앞선 패턴이 검증된 뒤 처리한다.

### 사용자 방향

사용자 방향이 비어 있으면 A로 진행한다.

## 4차 — Next server 디렉터리 정리

### 작업내용

- `apps/web/src/server/db/**`는 Spring Flyway 이관 대조 완료 후 archive 또는 삭제한다.
- `apps/web/src/server/repositories/**`는 route 의존이 0이 되면 삭제한다.
- `apps/web/src/server/services/**`는 Spring client, auth cookie bridge, file/stream bridge, BFF adapter만 남긴다.
- 모호한 `service`, `repository`, `db` 이름을 줄이고 `*-spring-client`, `*-bff`, `*-bridge`로 역할을 드러낸다.

### 논의 필요

- Drizzle schema 파일을 참조하는 테스트/문서가 남아 있을 때 삭제 시점을 어떻게 잡을지 결정한다.

### 선택지

- A. route 100% 후 즉시 삭제
- B. Spring Flyway 이관 대조와 앱 빌드 확인 후 삭제
- C. 장기 archive

### 추천

B를 추천한다. 삭제는 강한 정리지만, DB 이력 대조 전 삭제는 위험하다.

### 사용자 방향

사용자 방향이 비어 있으면 B로 진행한다.

## 5차 — 완료 판정

### 100% 기준

- `apps/web/src/app/api/v1/**/route.ts`에서 도메인 `@/server/services/*` import 0개
- `apps/web/src/app/api/v1/**/route.ts`에서 `@/server/repositories/*` import 0개
- `apps/web/src/app/api/v1/**/route.ts`에서 `@/server/db/*` runtime import 0개
- `apps/web` dev/start에서 DB migration 자동 실행 0개
- `db:generate`, `db:migrate`가 Spring Flyway 안내와 함께 실패
- 신규 DDL은 `apps/backend/src/main/resources/db/migration`만 사용
- Next route는 Spring proxy, auth bridge, file/stream bridge, OAuth callback bridge, UI-adjacent utility 중 하나로 설명 가능

### 검증

- route import scan
- `apps/web/package.json` script scan
- Spring Flyway migration directory 확인
- `pnpm --filter @yeon/web typecheck`
- route 전환 PR마다 해당 Spring test 또는 web route compatibility test
- web 영향이 있는 변경은 `pnpm --filter @yeon/web build`

## 이번 차수 범위

이번 차수는 1차만 수행한다.

- 계획 문서 작성
- Next `dev` 자동 Drizzle migration 제거
- `db:generate`, `db:migrate` write 명령 차단
- `apps/web/README.md`의 책임 설명 정정
- 검증 후 별도 PR로 main에 반영
