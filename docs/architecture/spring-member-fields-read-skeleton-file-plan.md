# Spring Member Fields Read Skeleton File Plan

## 문서 목적
- `member-fields` read 1차 파일럿에서 어떤 파일을 어떤 순서로 생성할지 고정한다.
- 이번 문서는 구현 직전의 write set 계획 SSOT다.

## 현재 backend 기준선
이미 있는 기반:
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/*`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/write/*`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/reorder/*`
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/reset/*`
- Spring JPA/JDBC/Flyway/Testcontainers baseline

## 원칙
1. 한 번에 전부 만들지 않는다.
2. **field definition read 최소 파일셋**부터 만든다.
3. values/backfill/write는 금지한다.
4. Next BFF 전환보다 backend read skeleton 생성을 먼저 끝낸다.
5. 테스트 파일도 같은 턴에 최소 1개는 포함한다.

## 목표 패키지 root
- `apps/backend/src/main/java/world/yeon/backend/member_fields/read/`
- `apps/backend/src/test/java/world/yeon/backend/member_fields/read/`

## 최종 생성 후보 파일 목록
### main/java
1. `model/MemberFieldDefinitionEntity.java`
2. `repository/MemberFieldReadRepository.java`
3. `dto/MemberFieldItemResponse.java`
4. `dto/MemberFieldListResponse.java`
5. `mapper/MemberFieldReadMapper.java`
6. `service/MemberFieldReadService.java`
7. `controller/MemberFieldReadController.java`

### test/java
8. `repository/MemberFieldReadRepositoryTests.java`
9. `service/MemberFieldReadServiceTests.java`
10. `controller/MemberFieldReadControllerTests.java`

## 차수 A — model + repository skeleton
### 이번 턴 최소셋
1. `model/MemberFieldDefinitionEntity.java`
2. `repository/MemberFieldReadRepository.java`
3. `repository/MemberFieldReadRepositoryTests.java`

### 이유
- space/tab lookup과 ordered field definition read가 먼저 살아야 service/controller가 의미가 생긴다.
- options JSONB와 deletedAt 필터링을 repository 단계에서 먼저 고정해야 이후 mapper/service drift가 줄어든다.

## 차수 B — dto/mapper/service
1. `dto/MemberFieldItemResponse.java`
2. `dto/MemberFieldListResponse.java`
3. `mapper/MemberFieldReadMapper.java`
4. `service/MemberFieldReadService.java`
5. `service/MemberFieldReadServiceTests.java`

## 차수 C — controller
1. `controller/MemberFieldReadController.java`
2. `controller/MemberFieldReadControllerTests.java`

## 차수 D — Next BFF fetch 전환
1. `apps/web/src/server/member-fields-spring-client.ts`
2. `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts`
3. route test 추가/수정
4. 기존 direct read/backfill/value orchestration 제거 또는 축소

## 각 파일 책임 고정
### `MemberFieldDefinitionEntity.java`
- `public.member_field_definitions` JPA entity
- `options jsonb`는 JSON 타입으로 보존
- `deletedAt` 포함

### `MemberFieldReadRepository.java`
- `findSpaceInternalId(spacePublicId)`
- `findTabLookup(tabPublicId)`
- `findFields(spaceInternalId, tabInternalId)`
- 1차는 `deleted_at is null` + `display_order asc`

### `MemberFieldReadRepositoryTests.java`
- Testcontainers PostgreSQL 기반
- 최소 검증:
  - space lookup
  - tab lookup
  - space/tab 기준 ordered fields read
  - deleted row 제외
  - other tab/space 미오염

## 구현 순서 고정
### 차수 A
- 성공 기준:
  - `./gradlew test --tests '*MemberFieldReadRepositoryTests'`
### 차수 B
- 성공 기준:
  - `./gradlew test --tests '*MemberFieldReadServiceTests'`
### 차수 C
- 성공 기준:
  - `./gradlew test --tests '*MemberFieldReadControllerTests'`
### 차수 D
- 성공 기준:
  - vitest + typecheck + build + runtime smoke

## 금지할 파일 범위
- `member_fields` write/update/delete/reorder
- overview lazy field bootstrap
- values read/join
- auth/session migration

## 다음 1작업 추천
- 다음엔 실제 코드로 들어가서
  **차수 A — model + repository + repo test**
  를 생성하고 검증한다.
