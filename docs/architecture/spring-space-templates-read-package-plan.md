# Spring Space Templates Read Package Plan

## 문서 목적
- `space-templates` 1차 파일럿(read-only)의 Spring 내부 구조를 미리 고정한다.
- 이번 문서는 **패키지/계층/호출 경계 설계 SSOT**다.
- 구현 전에 “어디에 무엇을 둘지”만 확정한다.

## 1차 파일럿 범위
- Spring backend가 새로 제공할 API
  - `GET /space-templates`
  - `GET /space-templates/{templateId}`
- Next BFF가 유지할 API
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`

## 설계 원칙
1. **read-only 전용 구조**로 시작한다.
2. write command와 같은 패키지에 섞지 않는다.
3. JPA entity를 곧바로 API 응답으로 노출하지 않는다.
4. Next 응답 shape와 Spring 내부 DTO를 분리한다.
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조

기준 root:
- `apps/backend/src/main/java/world/yeon/backend/space_templates`

### 1차 생성 패키지
- `world.yeon.backend.space_templates.read.controller`
- `world.yeon.backend.space_templates.read.service`
- `world.yeon.backend.space_templates.read.repository`
- `world.yeon.backend.space_templates.read.dto`
- `world.yeon.backend.space_templates.read.mapper`
- `world.yeon.backend.space_templates.read.model`

## 패키지별 역할

### `read.controller`
- HTTP endpoint 진입점
- request param/path variable 수신
- 현재 단계에서는 user identity를 **Next가 전달한 값**으로만 받는다
- business rule은 넣지 않는다

예상 클래스:
- `SpaceTemplateReadController`

### `read.service`
- read use case orchestration
- 접근 제어 규칙 적용
- summary/detail 응답 조립

예상 클래스:
- `ListSpaceTemplatesService`
- `GetSpaceTemplateDetailService`
- 또는 파일 수를 줄이려면
  - `SpaceTemplateReadService`

### `read.repository`
- DB 조회 전용
- 첫 단계는 `space_templates` 단일 테이블 read만 담당
- snapshot/apply에 관련된 탭/필드 테이블은 아직 접근하지 않는다

예상 클래스:
- `SpaceTemplateReadRepository`

### `read.dto`
- Spring API 응답 DTO
- 내부 query result DTO
- `tabs_config` 파싱용 typed DTO

예상 클래스:
- `SpaceTemplateSummaryResponse`
- `SpaceTemplateDetailResponse`
- `TemplateTabDto`
- `TemplateFieldDto`

### `read.mapper`
- repository/model → response DTO 변환
- preview name, tabCount, fieldCount 계산 로직 위치

예상 클래스:
- `SpaceTemplateReadMapper`

### `read.model`
- JPA entity 또는 read projection
- 지금 1차에선 `space_templates`만

예상 클래스:
- `SpaceTemplateEntity`

## 클래스 책임 초안

### `SpaceTemplateEntity`
- `space_templates` 매핑
- 포함 필드:
  - `publicId`
  - `createdByUserId`
  - `name`
  - `description`
  - `isSystem`
  - `tabsConfig`
  - `createdAt`
  - `updatedAt`

### `SpaceTemplateReadRepository`
- 메서드 후보:
  - `findAccessibleTemplates(UUID userId)`
  - `findAccessibleTemplate(String templatePublicId, UUID userId)`
- 1차에선 write 메서드 금지

### `SpaceTemplateReadService`
- 메서드 후보:
  - `listTemplates(UUID userId)`
  - `getTemplateDetail(String templatePublicId, UUID userId)`
- 책임:
  - 시스템 템플릿/사용자 템플릿 접근 규칙 반영
  - mapper 호출

### `SpaceTemplateReadMapper`
- 책임:
  - summary/detail 응답 조립
  - `tabCount`, `fieldCount`, `tabPreviewNames`, `fieldPreviewNames` 계산

### `SpaceTemplateReadController`
- endpoint 후보:
  - `GET /space-templates`
  - `GET /space-templates/{templateId}`
- Next가 전달한 user id를 header로 받는 임시 경계 사용 가능

## DB 접근 전략

## 1차 선택
- **JPA entity + repository query**로 간다.

이유:
- 이미 JPA baseline을 깔아둠
- 첫 파일럿은 단일 테이블 read라 복잡한 native query가 필요 없음
- 추후 write 이전 시 동일 aggregate 안에서 재사용 가능

## 보류
- Querydsl
- jOOQ
- custom native JSON projection

## `tabs_config` 처리 전략

### 1차 추천
- DB 컬럼은 JSONB 그대로 유지
- Spring entity에서는 `String` 또는 JSON node 성격으로 받고
- mapper 단계에서 typed DTO로 변환

### 지금 확정하지 않는 것
- JSONB를 JPA custom type으로 바로 강결합하는 방식
- domain object를 entity field에 직접 넣는 방식

## Next BFF ↔ Spring 호출 계획

### 유지되는 것
- 프론트는 계속
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - Drizzle service 직접 호출
  - → Spring backend fetch
  로 교체

### 임시 identity 전달 원칙
- 인증/세션 판단은 Next가 계속 수행
- Next는 Spring backend 호출 시
  - user public id 또는 internal auth id
  를 trusted header로 전달

예시 후보:
- `X-Yeon-User-Id`

주의:
- 이 header는 외부 클라이언트가 직접 치는 public contract가 아니다
- Next BFF → Spring 내부 hop 용도다

## 응답 shape 전략

### 원칙
- Next route outward response shape는 유지
- Spring response도 가능하면 같은 shape를 바로 돌려주되,
  내부 DTO 이름은 Spring 쪽에서 독립 유지

### 목록
- `{ templates: [...] }`

### 상세
- `{ template: {...} }`

## 1차 구현 순서
1. `read.model` 설계
2. `read.repository` read query 추가
3. `read.dto` / `read.mapper` 추가
4. `read.service` 추가
5. `read.controller` 추가
6. backend test 작성
7. 그 다음에야 Next BFF fetch 전환

## 1차 금지 사항
- write command 패키지 동시 생성 금지
- duplicate/apply/snapshot 메서드 같이 만들기 금지
- auth/session logic를 backend로 옮기기 금지
- member tab/field 테이블까지 한 번에 연결 금지

## 검증 목표
- backend:
  - controller integration test
  - repository/service smoke
  - response shape fixture 비교
- web:
  - 기존 route contract 유지
  - BFF 연동 smoke

## 다음 1작업 추천
- 다음엔
  **Spring `space-templates` read API contract 초안 문서 1개**
  만 만들고 멈춘다.
