# Spring Member Tabs Read Skeleton File Plan

## 문서 목적
- `member-tabs` 1차 파일럿(read-only)을 구현할 때
  **어떤 파일을 어떤 순서로 생성할지**를 미리 잠근다.
- 이번 문서는 구현 직전의 **write set 계획 SSOT**다.

## 현재 backend 기준선

현재 이미 있는 기반:
- `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java`
- `apps/backend/src/main/java/world/yeon/backend/config/InternalServiceTokenAuthFilter.java`
- `apps/backend` JPA/JDBC/Flyway/Testcontainers baseline
- `space_templates` read/write lane 예시 구현

즉 다음 구현 턴은 **새 패키지 추가**만 하면 된다.

## 이번 계획의 원칙
1. 한 번에 전부 만들지 않는다.
2. **read-only 최소 파일셋**부터 만든다.
3. lazy backfill 관련 write 클래스는 금지한다.
4. Next BFF 전환보다 backend skeleton 생성을 먼저 끝낸다.
5. 테스트 파일도 같은 턴에 최소 1개는 포함한다.

## 목표 패키지 root
- `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/`
- `apps/backend/src/test/java/world/yeon/backend/member_tabs/read/`

## 최종 생성 후보 파일 목록

### main/java
1. `model/MemberTabDefinitionEntity.java`
2. `dto/MemberTabItemResponse.java`
3. `dto/MemberTabListResponse.java`
4. `repository/MemberTabReadRepository.java`
5. `mapper/MemberTabReadMapper.java`
6. `service/MemberTabReadService.java`
7. `controller/MemberTabReadController.java`

### test/java
8. `repository/MemberTabReadRepositoryTests.java`
9. `service/MemberTabReadServiceTests.java`
10. `controller/MemberTabReadControllerTests.java`

## 1차 구현 턴에서 실제로 만들 파일

### 추천 최소셋
1. `model/MemberTabDefinitionEntity.java`
2. `repository/MemberTabReadRepository.java`
3. `repository/MemberTabReadRepositoryTests.java`

### 이유
- `spaces(public_id)` → internal id 해석과 `member_tab_definitions` 조회가 먼저 살아야 service/controller가 의미가 생긴다.
- 정렬/컬럼 매핑 문제를 제일 먼저 분리할 수 있다.
- write set이 3파일로 작아서 회귀 추적이 쉽다.

## 2차 구현 턴에서 만들 파일

1. `dto/MemberTabItemResponse.java`
2. `dto/MemberTabListResponse.java`
3. `mapper/MemberTabReadMapper.java`
4. `service/MemberTabReadService.java`
5. `service/MemberTabReadServiceTests.java`

### 이유
- repository 결과가 안정된 뒤에 DTO/mapper/service를 얹어야
  DB mapping 문제와 응답 shape 문제를 분리할 수 있다.

## 3차 구현 턴에서 만들 파일

1. `controller/MemberTabReadController.java`
2. `controller/MemberTabReadControllerTests.java`

### 이유
- API surface는 가장 마지막에 올리는 편이 안전하다.
- controller test에서
  - internal token/header required
  - 200/404
  - response shape
  를 한 번에 검증할 수 있다.

## 각 파일 책임 고정

### `MemberTabDefinitionEntity.java`
- `member_tab_definitions` 단일 테이블 매핑
- write behavior 금지
- 1차에선 read projection 역할만

### `MemberTabReadRepository.java`
- `spacePublicId -> internalId` 해석
- space 기준 tab 목록 조회
- `displayOrder ASC` 정렬 고정
- lazy backfill/write 금지

### `MemberTabReadRepositoryTests.java`
- Testcontainers PostgreSQL 기반
- Flyway 후 `spaces`, `member_tab_definitions` read smoke
- 최소 1개:
  - 목록 조회 성공
  - space not found 또는 empty list 경계 중 1개

### DTO 2종
- outward shape를 만들기 위한 구조
- entity 직접 노출 금지

### `MemberTabReadMapper.java`
- entity → `MemberTabItemResponse` 변환
- 필드명 고정
  - `id/name/tabType/systemKey/isVisible/displayOrder`

### `MemberTabReadService.java`
- repository + mapper orchestration
- `space not found` 의미 정리
- 현재 단계에서는 **system tab이 없어도 그대로 반환**

### `MemberTabReadServiceTests.java`
- service layer rule smoke
- 404/빈 결과 경계

### `MemberTabReadController.java`
- `GET /spaces/{spaceId}/member-tabs`
- `X-Yeon-User-Id` / `X-Yeon-Internal-Token` required
- top-level `{ code, message }` 에러 응답

### `MemberTabReadControllerTests.java`
- header required 400/401
- 200 성공
- 404 not found

## 구현 순서 고정

### 차수 A — repository skeleton
- write set: 3 files
- 성공 기준:
  - repository test 통과

### 차수 B — dto/mapper/service skeleton
- write set: 5 files
- 성공 기준:
  - service test 통과

### 차수 C — controller skeleton
- write set: 2 files
- 성공 기준:
  - controller test 통과

### 차수 D — Next BFF fetch 전환
- 이 문서 범위 밖

## 이번 단계에서 금지할 파일
- `write/*`
- `bootstrap/*`
- `reset/reorder` 관련 클래스
- `fields` 관련 클래스
- `createDefaultSystemTabs` 이식용 클래스

## 검증 계획

### 차수 A
- `cd apps/backend && ./gradlew test --tests '*MemberTabReadRepositoryTests'`

### 차수 B
- `cd apps/backend && ./gradlew test --tests '*MemberTabReadServiceTests'`

### 차수 C
- `cd apps/backend && ./gradlew test --tests '*MemberTabReadControllerTests'`

### 매 차수 공통
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 다음 1작업 추천
- 다음엔 실제 코드로 처음 들어가서
  **차수 A — repository skeleton 3파일만 생성**
  하고 멈추는 게 맞다.
