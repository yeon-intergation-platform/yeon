# Spring Member Tabs Write Skeleton File Plan

## 문서 목적
- `member-tabs` 1차 write 파일럿(create/update/delete)을 구현할 때
  **어떤 파일을 어떤 순서로 생성할지**를 미리 잠근다.
- 이번 문서는 구현 직전의 **write set 계획 SSOT**다.

## 현재 backend 기준선

현재 이미 있는 기반:
- `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java`
- `apps/backend/src/main/java/world/yeon/backend/config/InternalServiceTokenAuthFilter.java`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/*`
- `apps/backend` JPA/JDBC/Flyway/Testcontainers baseline
- `space_templates` read/write lane 예시 구현

즉 다음 구현 턴은 **member-tabs write 새 패키지 추가**만 하면 된다.

## 이번 계획의 원칙
1. 한 번에 전부 만들지 않는다.
2. **create/update/delete 최소 파일셋**부터 만든다.
3. reorder/reset/fields는 금지한다.
4. Next BFF 전환보다 backend write skeleton 생성을 먼저 끝낸다.
5. 테스트 파일도 같은 턴에 최소 1개는 포함한다.

## 목표 패키지 root
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/write/`
- `apps/backend/src/test/java/world/yeon/backend/member_tabs/write/`

## 최종 생성 후보 파일 목록

### main/java
1. `dto/CreateMemberTabRequest.java`
2. `dto/UpdateMemberTabRequest.java`
3. `dto/MemberTabMutationItemResponse.java`
4. `dto/MemberTabMutationResponse.java`
5. `repository/MemberTabWriteRepository.java`
6. `service/MemberTabWriteService.java`
7. `controller/MemberTabWriteController.java`

### test/java
8. `repository/MemberTabWriteRepositoryTests.java`
9. `service/MemberTabWriteServiceTests.java`
10. `controller/MemberTabWriteControllerTests.java`

## 1차 구현 턴에서 실제로 만들 파일

### 추천 최소셋
1. `dto/CreateMemberTabRequest.java`
2. `dto/UpdateMemberTabRequest.java`
3. `dto/MemberTabMutationItemResponse.java`
4. `dto/MemberTabMutationResponse.java`
5. `repository/MemberTabWriteRepository.java`
6. `repository/MemberTabWriteRepositoryTests.java`

### 이유
- create/update/delete의 source of truth는 결국 mutation repository 동작이다.
- request/response DTO shape를 먼저 고정해야 service/controller에서 contract drift가 줄어든다.
- protected tab 조회, max display order 계산, delete 대상 판별을 repository 단계에서 먼저 분리할 수 있다.

## 2차 구현 턴에서 만들 파일

1. `service/MemberTabWriteService.java`
2. `service/MemberTabWriteServiceTests.java`

### 이유
- repository가 안정된 뒤에 service rule을 얹어야
  DB mutation 문제와 도메인 규칙 문제를 분리할 수 있다.
- 이 턴에서 create/update/delete 검증 규칙을 한 번에 테스트할 수 있다.

## 3차 구현 턴에서 만들 파일

1. `controller/MemberTabWriteController.java`
2. `controller/MemberTabWriteControllerTests.java`

### 이유
- API surface는 가장 마지막에 올리는 편이 안전하다.
- controller test에서
  - header required
  - 201/200/204
  - 403/404
  - error shape
  를 한 번에 검증할 수 있다.

## 4차 구현 턴에서 만들 파일

1. `apps/web/src/server/member-tabs-spring-client.ts` 확장
2. `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts` POST 전환
3. `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/route.ts` PATCH/DELETE 전환
4. 해당 route test 파일

### 이유
- backend source of truth가 먼저 살아야 Next 기존 로직을 안전하게 제거할 수 있다.
- 이 턴이 실제 cutover 턴이다.

## 각 파일 책임 고정

### `CreateMemberTabRequest.java`
- create body shape 수신
- `name` 필드만 받는다.
- 상세 business validation은 service가 담당한다.

### `UpdateMemberTabRequest.java`
- patch body shape 수신
- nullable `name`, `isVisible`, `displayOrder`만 받는다.
- patch semantics는 service가 해석한다.

### `MemberTabMutationItemResponse.java`
- outward tab item과 동일한 최소 필드만 담는다.
- 필드:
  - `id`
  - `name`
  - `tabType`
  - `systemKey`
  - `isVisible`
  - `displayOrder`

### `MemberTabMutationResponse.java`
- create/update 성공 응답 `{ tab: ... }` 구성
- delete는 사용하지 않는다.

### `MemberTabWriteRepository.java`
- `spacePublicId -> internalId` 해석
- target tab 조회
- `max(displayOrder)` 조회
- custom tab insert/update/delete
- reorder/reset bulk mutation 금지

### `MemberTabWriteRepositoryTests.java`
- Testcontainers PostgreSQL 기반
- 최소 검증:
  - create용 max order 조회
  - tab public id + space 기준 대상 조회
  - custom delete mutation

### `MemberTabWriteService.java`
- repository + rule orchestration
- create:
  - trim
  - 빈 문자열 금지
  - 80자 제한
  - `displayOrder = max + 1`
- update:
  - patch 필드만 반영
  - protected system key 403
- delete:
  - protected system key 403
  - system tab 403
  - custom만 허용

### `MemberTabWriteServiceTests.java`
- create/update/delete 성공 케이스
- protected/system/not-found/invalid-name 경계

### `MemberTabWriteController.java`
- `POST /spaces/{spaceId}/member-tabs`
- `PATCH /spaces/{spaceId}/member-tabs/{tabId}`
- `DELETE /spaces/{spaceId}/member-tabs/{tabId}`
- `X-Yeon-User-Id` required
- top-level `{ code, message }` 에러 응답

### `MemberTabWriteControllerTests.java`
- header required 400
- create 201
- update 200
- delete 204
- 403/404/error shape

## 구현 순서 고정

### 차수 A — dto + repository skeleton
- write set: 6 files
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
- 기존 Next 직접 `createCustomTab` / `updateTab` / `deleteCustomTab` 호출 제거
- 성공 기준:
  - web route test + typecheck + build + runtime smoke 통과

## 이번 단계에서 금지할 파일
- `read/*` 수정 확대
- `reorder/*`
- `reset/*`
- `fields/*`
- `createDefaultSystemTabs` 관련 bootstrap 로직
- auth/session migration 코드

## 검증 계획

### 차수 A
- `cd apps/backend && ./gradlew test --tests '*MemberTabWriteRepositoryTests'`

### 차수 B
- `cd apps/backend && ./gradlew test --tests '*MemberTabWriteServiceTests'`

### 차수 C
- `cd apps/backend && ./gradlew test --tests '*MemberTabWriteControllerTests'`

### 차수 D
- `pnpm --filter @yeon/web exec vitest run ...member-tabs...`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- backend direct runtime smoke + Next route integration evidence

### 매 차수 공통
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 다음 1작업 추천
- 다음엔 실제 코드로 처음 들어가서
  **차수 A — dto + repository skeleton 6파일만 생성**
  하고 멈추는 게 맞다.
