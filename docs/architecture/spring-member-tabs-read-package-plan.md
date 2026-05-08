# Spring Member Tabs Read Package Plan

## 문서 목적
- `member-tabs` 1차 파일럿(read-only)의 Spring 내부 구조를 미리 고정한다.
- 이번 문서는 **패키지/계층/호출 경계 설계 SSOT**다.
- 구현 전에 “어디에 무엇을 둘지”만 확정한다.

## 1차 파일럿 범위
- Spring backend가 새로 제공할 API
  - `GET /spaces/{spaceId}/member-tabs`
- Next BFF가 유지할 API
  - `GET /api/v1/spaces/{spaceId}/member-tabs`

## 설계 원칙
1. **read-only 전용 구조**로 시작한다.
2. lazy backfill write는 read package에 넣지 않는다.
3. JPA entity를 곧바로 API 응답으로 노출하지 않는다.
4. Next outward 응답 shape와 Spring 내부 DTO를 분리한다.
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조

기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_tabs`

### 1차 생성 패키지
- `world.yeon.backend.member_tabs.read.controller`
- `world.yeon.backend.member_tabs.read.service`
- `world.yeon.backend.member_tabs.read.repository`
- `world.yeon.backend.member_tabs.read.dto`
- `world.yeon.backend.member_tabs.read.mapper`
- `world.yeon.backend.member_tabs.read.model`

## 패키지별 역할

### `read.controller`
- HTTP endpoint 진입점
- `spaceId` path variable 수신
- 현재 단계에서는 user identity를 **Next가 전달한 값**으로만 받는다
- business rule과 backfill write를 넣지 않는다

예상 클래스:
- `MemberTabReadController`

### `read.service`
- read use case orchestration
- `spacePublicId` → internal id 해석
- 탭 목록 응답 조립
- 1차에서는 **탭이 비어 있어도 write를 유발하지 않는다**

예상 클래스:
- `MemberTabReadService`

### `read.repository`
- DB 조회 전용
- 첫 단계는 `spaces`, `member_tab_definitions` read만 담당
- `member_field_definitions`, `member_field_values`는 아직 접근하지 않는다

예상 클래스:
- `MemberTabReadRepository`
- 또는 역할 분리 시
  - `SpaceLookupRepository`
  - `MemberTabReadRepository`

### `read.dto`
- Spring API 응답 DTO
- 내부 query result DTO

예상 클래스:
- `MemberTabItemResponse`
- `MemberTabListResponse`

### `read.mapper`
- repository/model → response DTO 변환
- 컬럼명 snake/camel 차이 흡수

예상 클래스:
- `MemberTabReadMapper`

### `read.model`
- JPA entity 또는 read projection
- 지금 1차에선 `member_tab_definitions` + `spaces` 최소 범위만

예상 클래스:
- `MemberTabDefinitionEntity`
- `SpaceEntity` 또는 space id lookup projection

## 클래스 책임 초안

### `MemberTabDefinitionEntity`
- `member_tab_definitions` 매핑
- 포함 필드:
  - `publicId`
  - `spaceId`
  - `createdByUserId`
  - `tabType`
  - `systemKey`
  - `name`
  - `isVisible`
  - `displayOrder`
  - `createdAt`
  - `updatedAt`

### `MemberTabReadRepository`
- 메서드 후보:
  - `findSpaceInternalId(String spacePublicId)`
  - `findTabsBySpaceInternalId(Long spaceInternalId)`
- 1차에선 write 메서드 금지
- 정렬은 `displayOrder ASC`로 고정

### `MemberTabReadService`
- 메서드 후보:
  - `listTabs(String spacePublicId)`
- 책임:
  - space 존재 여부 검증
  - repository 호출
  - mapper 호출
  - 현재 단계에서는 **system tab이 없어도 그대로 빈/부분 결과 반환**

### `MemberTabReadMapper`
- 책임:
  - entity → outward DTO 변환
  - 응답 필드 고정
    - `id`
    - `name`
    - `tabType`
    - `systemKey`
    - `isVisible`
    - `displayOrder`

### `MemberTabReadController`
- endpoint 후보:
  - `GET /spaces/{spaceId}/member-tabs`
- Next가 전달한 user id header를 임시 trusted header로 받을 수는 있지만, 1차 read에선 실제 owner filter는 space 존재 확인 이후로 보류 가능
- 에러 shape는 현재 Spring write lane과 같은 top-level `{ code, message }` 형식을 유지한다

## DB 접근 전략

### 1차 선택
- **JPA entity + repository query**로 간다.

이유:
- 이미 JPA baseline을 깔아둠
- 단일 tab table read + space lookup 정도는 JPA로 충분함
- 이후 member-tabs write 이전 시 같은 aggregate 범위에서 재사용 가능

## 보류
- Querydsl
- jOOQ
- fields/value join이 필요한 richer projection

## Next BFF ↔ Spring 호출 계획

### 유지되는 것
- 프론트는 계속
  - `GET /api/v1/spaces/{spaceId}/member-tabs`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - `getTabsForSpace` 직접 호출
  - 조건부 `createDefaultSystemTabs`
  - → Spring backend fetch
  로 교체

### 임시 identity 전달 원칙
- 인증/세션 판단은 Next가 계속 수행
- Next는 Spring backend 호출 시
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
  을 내부 hop 용도로 전달

## lazy backfill 분리 원칙

### 이번 문서에서 고정하는 것
- `GET /member-tabs` Spring read endpoint는 **탭 생성 부작용을 가지지 않는다**
- system tab/backfill은 후속 write/bootstrap lane으로 분리한다

### 이유
1. read controller/service test를 단순하게 유지할 수 있다
2. member-tabs read cutover 실패 원인을 write/backfill 문제와 분리할 수 있다
3. apply-template 이후 state를 그대로 읽는 source of truth 역할과 잘 맞는다

## 응답 shape 전략

### 원칙
- Next outward response shape는 유지
- Spring response도 가능하면 같은 shape를 바로 돌려주되, 내부 DTO 이름은 Spring 쪽에서 독립 유지

### 목록
- `{ tabs: [...] }`

### item
- `id`
- `name`
- `tabType`
- `systemKey`
- `isVisible`
- `displayOrder`

## 1차 구현 순서
1. `read.model` 설계
2. `read.repository` space lookup + tab read query 추가
3. `read.dto` / `read.mapper` 추가
4. `read.service` 추가
5. `read.controller` 추가
6. backend test 작성
7. 그 다음에야 Next BFF fetch 전환

## 1차 금지 사항
- `createDefaultSystemTabs` Spring 이식 동시 진행 금지
- fields route 같이 만들기 금지
- write/reset/reorder route 같이 만들기 금지
- auth/session logic를 backend로 옮기기 금지

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
  **Spring `member-tabs` read API contract 초안 문서 1개**
  만 만들고 멈춘다.
