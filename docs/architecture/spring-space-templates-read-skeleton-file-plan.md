# Spring Space Templates Read Skeleton File Plan

## 문서 목적
- `space-templates` 1차 파일럿(read-only)을 구현할 때
  **어떤 파일을 어떤 순서로 생성할지**를 미리 잠근다.
- 이번 문서는 구현 직전의 **write set 계획 SSOT**다.

## 현재 backend 기준선

현재 이미 있는 파일:
- `apps/backend/src/main/java/world/yeon/backend/YeonBackendApplication.java`
- `apps/backend/src/main/java/world/yeon/backend/config/JdbcProfileConfig.java`
- `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java`
- `apps/backend/src/test/java/world/yeon/backend/YeonBackendApplicationTests.java`
- `apps/backend/src/test/java/world/yeon/backend/bootstrap/jpa/BootstrapHeartbeatRepositoryTests.java`
- `apps/backend/src/test/java/world/yeon/backend/config/SecurityConfigTests.java`

즉 다음 구현 턴은 **새 패키지 추가**만 하면 된다.

## 이번 계획의 원칙
1. 한 번에 전부 만들지 않는다.
2. **read-only 최소 파일셋**부터 만든다.
3. write API 관련 클래스는 금지한다.
4. Next BFF 전환보다 backend skeleton 생성을 먼저 끝낸다.
5. 테스트 파일도 같은 턴에 최소 1개는 포함한다.

## 목표 패키지 root
- `apps/backend/src/main/java/world/yeon/backend/space_templates/read/`
- `apps/backend/src/test/java/world/yeon/backend/space_templates/read/`

## 최종 생성 후보 파일 목록

### main/java
1. `model/SpaceTemplateEntity.java`
2. `dto/TemplateFieldDto.java`
3. `dto/TemplateTabDto.java`
4. `dto/SpaceTemplateSummaryResponse.java`
5. `dto/SpaceTemplateDetailResponse.java`
6. `repository/SpaceTemplateReadRepository.java`
7. `mapper/SpaceTemplateReadMapper.java`
8. `service/SpaceTemplateReadService.java`
9. `controller/SpaceTemplateReadController.java`

### test/java
10. `repository/SpaceTemplateReadRepositoryTests.java`
11. `service/SpaceTemplateReadServiceTests.java`
12. `controller/SpaceTemplateReadControllerTests.java`

## 1차 구현 턴에서 실제로 만들 파일

### 추천 최소셋
1. `model/SpaceTemplateEntity.java`
2. `repository/SpaceTemplateReadRepository.java`
3. `repository/SpaceTemplateReadRepositoryTests.java`

### 이유
- DB read가 먼저 살아야 service/controller가 의미가 생긴다.
- `tabs_config` 매핑 문제가 제일 먼저 드러나는 위치다.
- write set이 3파일로 작아서 회귀 추적이 쉽다.

## 2차 구현 턴에서 만들 파일

1. `dto/TemplateFieldDto.java`
2. `dto/TemplateTabDto.java`
3. `dto/SpaceTemplateSummaryResponse.java`
4. `dto/SpaceTemplateDetailResponse.java`
5. `mapper/SpaceTemplateReadMapper.java`
6. `service/SpaceTemplateReadService.java`
7. `service/SpaceTemplateReadServiceTests.java`

### 이유
- repository 결과가 안정된 뒤에 DTO/mapper/service를 얹어야
  JSONB shape 문제와 business rule 문제를 분리할 수 있다.

## 3차 구현 턴에서 만들 파일

1. `controller/SpaceTemplateReadController.java`
2. `controller/SpaceTemplateReadControllerTests.java`

### 이유
- API surface는 가장 마지막에 올리는 편이 안전하다.
- controller test에서
  - header required
  - 200/404
  - response shape
  를 한 번에 검증할 수 있다.

## 각 파일 책임 고정

### `SpaceTemplateEntity.java`
- `space_templates` 단일 테이블 매핑
- write method/behavior 금지
- 1차에선 read projection 역할만

### `SpaceTemplateReadRepository.java`
- accessible templates 조회
- single template 조회
- 시스템/사용자 템플릿 접근 조건 캡슐화

### `SpaceTemplateReadRepositoryTests.java`
- Testcontainers PostgreSQL 기반
- Flyway 후 `space_templates` read smoke
- 최소 1개:
  - 목록 조회 또는 단건 조회

### DTO 4종
- outward shape를 만들기 위한 구조
- entity 직접 노출 금지

### `SpaceTemplateReadMapper.java`
- `tabsConfig` 파싱
- summary/detail 계산 로직
- preview names 계산

### `SpaceTemplateReadService.java`
- repository + mapper orchestration
- access denied / not found 의미 정리

### `SpaceTemplateReadServiceTests.java`
- service layer rule smoke
- 404/권한 규칙

### `SpaceTemplateReadController.java`
- `GET /space-templates`
- `GET /space-templates/{templateId}`
- `X-Yeon-User-Id` required

### `SpaceTemplateReadControllerTests.java`
- header required 400
- 200 성공
- 404 not found

## 구현 순서 고정

### 차수 A — repository skeleton
- write set: 3 files
- 성공 기준:
  - repository test 통과

### 차수 B — dto/mapper/service skeleton
- write set: 7 files
- 성공 기준:
  - service test 통과

### 차수 C — controller skeleton
- write set: 2 files
- 성공 기준:
  - controller test 통과

### 차수 D — Next BFF fetch 전환
- 이 문서 범위 밖

## 이번 단계에서 금지할 파일
- `command/*`
- `write/*`
- `create/update/delete` 관련 controller/service
- `apply-template` 관련 클래스
- `snapshot-template` 관련 클래스
- `duplicate-template` 관련 클래스

## 검증 계획

### 차수 A
- `cd apps/backend && ./gradlew test --tests '*SpaceTemplateReadRepositoryTests'`

### 차수 B
- `cd apps/backend && ./gradlew test --tests '*SpaceTemplateReadServiceTests'`

### 차수 C
- `cd apps/backend && ./gradlew test --tests '*SpaceTemplateReadControllerTests'`

### 매 차수 공통
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 다음 1작업 추천
- 다음엔 실제 코드로 처음 들어가서
  **차수 A — repository skeleton 3파일만 생성**
  하고 멈추는 게 맞다.
