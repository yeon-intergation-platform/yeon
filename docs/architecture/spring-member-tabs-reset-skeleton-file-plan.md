# Spring Member Tabs Reset Skeleton File Plan

## 문서 목적
- `member-tabs` bulk mutation 중 **reset lane만 먼저** 구현할 때
  **어떤 파일을 어떤 순서로 생성할지**를 미리 잠근다.
- 이번 문서는 구현 직전의 **write set 계획 SSOT**다.

## 현재 backend 기준선

현재 이미 있는 기반:
- `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java`
- `apps/backend/src/main/java/world/yeon/backend/config/InternalServiceTokenAuthFilter.java`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/*`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/write/*`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/reorder/*`
- `apps/backend` JPA/JDBC/Flyway/Testcontainers baseline

즉 다음 구현 턴은 **member-tabs reset 새 패키지 추가**만 하면 된다.

## 이번 계획의 원칙
1. 한 번에 전부 만들지 않는다.
2. **reset 최소 파일셋**부터 만든다.
3. reorder/fields는 금지한다.
4. Next BFF 전환보다 backend reset skeleton 생성을 먼저 끝낸다.
5. 테스트 파일도 같은 턴에 최소 1개는 포함한다.

## 목표 패키지 root
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/reset/`
- `apps/backend/src/test/java/world/yeon/backend/member_tabs/reset/`

## 최종 생성 후보 파일 목록

### main/java
1. `dto/OkResponse.java`
2. `repository/MemberTabResetRepository.java`
3. `service/MemberTabResetService.java`
4. `controller/MemberTabResetController.java`

### test/java
5. `repository/MemberTabResetRepositoryTests.java`
6. `service/MemberTabResetServiceTests.java`
7. `controller/MemberTabResetControllerTests.java`

## 1차 구현 턴에서 실제로 만들 파일

### 추천 최소셋
1. `dto/OkResponse.java`
2. `repository/MemberTabResetRepository.java`
3. `repository/MemberTabResetRepositoryTests.java`

### 이유
- reset은 결국 `spacePublicId -> internalId` 해석과
  - custom tab bulk delete
  - system tab restore update
  가 먼저 살아야 service/controller가 의미가 생긴다.
- 성공 응답 shape를 먼저 고정해야 이후 계층 drift를 줄일 수 있다.
- write set이 3파일이라 원인 분리가 쉽다.

## 2차 구현 턴에서 만들 파일

1. `service/MemberTabResetService.java`
2. `service/MemberTabResetServiceTests.java`

### 이유
- repository 결과가 안정된 뒤에 transaction/rule을 얹어야
  DB bulk mutation 문제와 정책 문제를 분리할 수 있다.
- 이 턴에서 `space not found`와 reset sequence를 한 번에 테스트할 수 있다.

## 3차 구현 턴에서 만들 파일

1. `controller/MemberTabResetController.java`
2. `controller/MemberTabResetControllerTests.java`

### 이유
- API surface는 가장 마지막에 올리는 편이 안전하다.
- controller test에서
  - header required
  - 200 `{ ok: true }`
  - 404
  - error shape
  를 한 번에 검증할 수 있다.

## 4차 구현 턴에서 만들 파일

1. `apps/web/src/server/member-tabs-spring-client.ts` reset helper 확장
2. `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts` Spring fetch 전환
3. reset route test 파일 추가/수정

### 이유
- backend source of truth가 먼저 살아야 Next 기존 `resetSpaceTabsToDefaults(...)` 직접 호출을 안전하게 제거할 수 있다.
- 이 턴이 실제 cutover 턴이다.

## 각 파일 책임 고정

### `OkResponse.java`
- 성공 응답 `{ ok: true }` 전용 DTO
- reorder lane DTO 재사용 대신 reset lane 내부에 독립 DTO를 둔다.

### `MemberTabResetRepository.java`
- `spacePublicId -> internalId` 해석
- custom tab bulk delete
- system tab 5개 restore update
- 1차에선 missing system row를 새로 만들지 않는다.

### `MemberTabResetRepositoryTests.java`
- Testcontainers PostgreSQL 기반
- 최소 검증:
  - custom tab delete 후 0건
  - system tab restore 반영
  - 다른 space 미오염

### `MemberTabResetService.java`
- repository + transaction orchestration
- `space not found` 정리
- custom tab delete → system tab restore sequence 수행
- 전체 sequence를 하나의 transaction에서 수행

### `MemberTabResetServiceTests.java`
- space not found
- reset 성공 시 repository sequence 호출
- 1차에서는 missing system row 자동 생성 정책 강화는 넣지 않는다.

### `MemberTabResetController.java`
- `POST /spaces/{spaceId}/member-tabs/reset`
- `X-Yeon-User-Id` required
- top-level `{ code, message }` 에러 응답

### `MemberTabResetControllerTests.java`
- header required 400
- 200 success
- 404 not found
- `{ ok: true }` shape

## 구현 순서 고정

### 차수 A — dto + repository skeleton
- write set: 3 files
- 성공 기준:
  - repository test 통과

### 차수 B — service skeleton
- write set: 2 files
- 성공 기준:
  - service test 통과

### 차수 C — controller skeleton
- write set: 2 files
- 성공 기준:
  - controller test 통과

### 차수 D — Next BFF fetch 전환
- 기존 Next `resetSpaceTabsToDefaults(...)` 직접 호출 제거
- 성공 기준:
  - web route test + typecheck + build + runtime smoke 통과

## 이번 단계에서 금지할 파일
- `reorder/*` 재수정
- `fields/*`
- `read/*` 확장 수정
- `write/*` 재수정 확대
- auth/session migration 코드

## 검증 계획

### 차수 A
- `cd apps/backend && ./gradlew test --tests '*MemberTabResetRepositoryTests'`

### 차수 B
- `cd apps/backend && ./gradlew test --tests '*MemberTabResetServiceTests'`

### 차수 C
- `cd apps/backend && ./gradlew test --tests '*MemberTabResetControllerTests'`

### 차수 D
- `pnpm --filter @yeon/web exec vitest run ...member-tabs/reset...`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- backend direct runtime smoke + Next route integration evidence

### 매 차수 공통
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 다음 1작업 추천
- 다음엔 실제 코드로 처음 들어가서
  **차수 A — dto + repository skeleton 3파일만 생성**
  하고 멈추는 게 맞다.
