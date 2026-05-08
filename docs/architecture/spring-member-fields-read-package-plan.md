# Spring Member Fields Read Package Plan

## 문서 목적
- `member-fields` read 1차 파일럿을 Spring으로 옮기기 위한 내부 구조를 고정한다.
- 이번 문서는 구현 전의 **패키지/계층/호출 경계 설계 SSOT**다.

## 1차 파일럿 범위
- Spring backend가 새로 제공할 API
  - `GET /spaces/{spaceId}/member-tabs/{tabId}/fields`
- Next BFF가 유지할 API
  - `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
- 1차 응답
  - `{ fields: [...] }`

## 1차 제외 범위
- `memberId` query를 통한 values 결합 응답
- overview lazy backfill (`createDefaultOverviewFields(...)`)
- fields write/reorder/delete
- auth/session migration

## 설계 원칙
1. **field definition read만** 먼저 옮긴다.
2. read 요청이 write를 유발하지 않게 한다.
3. Next는 계속 auth/BFF 역할만 담당한다.
4. Spring은 `space/tab/field` read source of truth만 먼저 담당한다.
5. `memberId` values 결합은 다음 lane으로 분리한다.

## 추천 패키지 구조
기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_fields`

### 1차 생성 패키지
- `world.yeon.backend.member_fields.read.controller`
- `world.yeon.backend.member_fields.read.service`
- `world.yeon.backend.member_fields.read.repository`
- `world.yeon.backend.member_fields.read.dto`
- `world.yeon.backend.member_fields.read.mapper`
- `world.yeon.backend.member_fields.read.model`

## 패키지별 역할

### `read.controller`
- HTTP endpoint 진입점
- `spaceId`, `tabId` path variable 수신
- `X-Yeon-User-Id` internal caller header 수신
- 1차에서는 values query param을 받지 않음

예상 클래스:
- `MemberFieldReadController`

### `read.service`
- read use case orchestration
- `spaceId -> internalId` 확인
- `tabId -> internalId` 확인
- 탭이 해당 스페이스에 속하는지 확인
- field definition list 조회 및 outward DTO 매핑

예상 클래스:
- `MemberFieldReadService`

### `read.repository`
- read 전용 lookup + ordered query
- `spaces(public_id)` → internal id lookup
- `member_tab_definitions(public_id)` → internal id + space id lookup
- `member_field_definitions(tab_id, space_id, deleted_at is null)` ordered query

예상 클래스:
- `MemberFieldReadRepository`

### `read.dto`
- outward response shape 정의
- 1차는 `{ fields: [...] }`만 제공

예상 클래스:
- `MemberFieldItemResponse`
- `MemberFieldListResponse`

### `read.mapper`
- entity/query result → outward DTO 변환
- options/sourceKey/isRequired/displayOrder 등 contract 필드만 노출

예상 클래스:
- `MemberFieldReadMapper`

### `read.model`
- `public.member_field_definitions` JPA entity
- 필요 시 tab lookup projection/model 추가

예상 클래스:
- `MemberFieldDefinitionEntity`

## 클래스 책임 초안

### `MemberFieldReadRepository`
- 메서드 후보:
  - `Long findSpaceInternalId(String spacePublicId)`
  - `Optional<TabLookup> findTabLookup(String tabPublicId)`
  - `List<MemberFieldDefinitionEntity> findFields(Long spaceInternalId, Long tabInternalId)`
- 1차 원칙:
  - tab 없으면 빈 배열이 아니라 **not found 여부를 service에서 결정**할 수 있게 lookup을 분리한다.

### `MemberFieldReadService`
- 메서드 후보:
  - `MemberFieldListResponse getFields(String spacePublicId, String tabPublicId)`
- 책임:
  - space 존재 여부 검증
  - tab 존재 여부 검증
  - tab-space 정합성 검증
  - ordered field list 조회
  - mapper 호출

### `MemberFieldReadController`
- endpoint 후보:
  - `GET /spaces/{spaceId}/member-tabs/{tabId}/fields`
- 성공 응답:
  - `{ fields: [...] }`
- 에러 shape:
  - top-level `{ code, message }`

## DB 접근 전략
### 1차 선택
- **space/tab lookup은 native query or minimal projection**
- field list는 JPA entity read

이유:
- member-tabs read lane과 같은 최소 경로 패턴을 재사용하기 쉽다.
- overview/write/value 결합까지 섞지 않아서 read 경계가 단순하다.

## Next BFF ↔ Spring 호출 계획
### 유지되는 것
- 프론트는 계속
  - `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - `getOverviewTab(...)`
  - `createDefaultOverviewFields(...)`
  - `getFieldsForTab(...)`
  - `getFieldValuesForDefinitions(...)`
  직접 orchestration
  → Spring backend fetch
  로 교체한다.

### 임시 identity 전달 원칙
- 인증/세션 판단은 Next가 계속 수행
- Next는 Spring backend 호출 시
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
  을 내부 hop 용도로 전달

## 응답 shape 전략
### 원칙
- outward route 응답은 1차에서 `{ fields: [...] }`만 유지한다.
- values 결합 응답은 다음 lane에서 별도 contract로 연다.

## 1차 구현 순서
1. `read.model` 설계
2. `read.repository` lookup + ordered field read 추가
3. `read.dto/mapper/service` 추가
4. `read.controller` 추가
5. backend test 작성
6. 그 다음에야 Next BFF fetch 전환
7. 마지막으로 runtime smoke로 ordered field read 확인

## 1차 금지 사항
- overview lazy backfill 동시 이식 금지
- values 결합 응답까지 한 번에 옮기기 금지
- write/reorder/delete 수정 금지
- auth/session logic를 backend로 옮기기 금지

## 다음 1작업 추천
- 다음엔
  **Spring `member-fields read` API contract 문서 1개**
  만 만들고 멈춘다.
