# Spring Member Tabs Reorder Package Plan

## 문서 목적
- `member-tabs` bulk mutation 중 **reorder lane만 먼저** Spring으로 옮기기 위한 내부 구조를 고정한다.
- 이번 문서는 구현 전의 **패키지/계층/호출 경계 설계 SSOT**다.
- reset은 같은 aggregate라도 부작용 범위가 더 크므로 이번 문서에서 제외한다.

## 1차 reorder 파일럿 범위
- Spring backend가 새로 제공할 API
  - `PATCH /spaces/{spaceId}/member-tabs/reorder`
- Next BFF가 유지할 API
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`

## 설계 원칙
1. **reorder만** 먼저 옮긴다.
2. reset은 다음 lane으로 분리한다.
3. reorder는 bulk mutation이므로 **transaction 경계**를 service에 명시한다.
4. 1차에서는 Next 현재 동작과 최대한 동일하게 간다.
   - order 배열 완전성/중복/존재성 추가 검증은 보류
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조

기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_tabs`

### 1차 생성 패키지
- `world.yeon.backend.member_tabs.reorder.controller`
- `world.yeon.backend.member_tabs.reorder.service`
- `world.yeon.backend.member_tabs.reorder.repository`
- `world.yeon.backend.member_tabs.reorder.dto`

## 패키지별 역할

### `reorder.controller`
- HTTP endpoint 진입점
- `spaceId` path variable 수신
- `X-Yeon-User-Id` internal caller header 수신
- request body는 Spring request DTO 수준만 파싱

예상 클래스:
- `MemberTabReorderController`

### `reorder.service`
- reorder use case orchestration
- `spaceId -> internalId` 확인
- **하나의 transaction 안에서** order 배열 전체를 반영
- 1차에선 order 배열의 완전성/존재성 추가 검증 없이 현재 Next 동작을 맞춤

예상 클래스:
- `MemberTabReorderService`

### `reorder.repository`
- bulk mutation 전용 조회 + update
- `spaces(public_id)` → internal id lookup
- `tabPublicId + spaceId` 기준 `displayOrder` update
- 필요하면 추후 검증용 count/lookup 메서드 추가

예상 클래스:
- `MemberTabReorderRepository`

### `reorder.dto`
- request/response DTO
- outward response는 최소 `{ ok: true }`

예상 클래스:
- `ReorderMemberTabsRequest`
- `OkResponse`

## 클래스 책임 초안

### `MemberTabReorderRepository`
- 메서드 후보:
  - `findSpaceInternalId(String spacePublicId)`
  - `updateDisplayOrder(String tabPublicId, Long spaceInternalId, int displayOrder)`
- 1차 원칙:
  - update count가 0이어도 바로 에러로 올리지 않는다
  - 현재 Next 구현과 동일하게 best-effort bulk update를 맞춘다

### `MemberTabReorderService`
- 메서드 후보:
  - `reorderTabs(String spacePublicId, List<String> order)`
- 책임:
  - space 존재 여부 검증
  - `order` index를 새 `displayOrder`로 사용
  - 전체 loop를 하나의 transaction에서 수행
  - 추후 정책 강화를 위해 검증 로직 추가 지점을 service에 남김

### `MemberTabReorderController`
- endpoint 후보:
  - `PATCH /spaces/{spaceId}/member-tabs/reorder`
- 성공 응답:
  - `{ ok: true }`
- 에러 shape:
  - top-level `{ code, message }`

### `ReorderMemberTabsRequest`
- 필드:
  - `order: List<String>`
- 상세 zod 수준 검증은 계속 Next가 담당

## DB 접근 전략

### 1차 선택
- **custom repository class + EntityManager/native update** 조합으로 간다.

이유:
- 이미 member-tabs write lane에서 custom repository pattern을 사용 중이다.
- reorder는 단건 JPA save보다 bulk update loop가 핵심이다.
- reset lane과 분리하면 원인 분리가 쉽다.

## Next BFF ↔ Spring 호출 계획

### 유지되는 것
- 프론트는 계속
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - `reorderTabs(...)` 직접 호출
  - → Spring backend fetch
  로 교체

### 임시 identity 전달 원칙
- 인증/세션 판단은 Next가 계속 수행
- Next는 Spring backend 호출 시
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
  을 내부 hop 용도로 전달

## 응답 shape 전략

### 원칙
- outward route 응답은 그대로 유지
- Spring도 1차에서는 `{ ok: true }`를 직접 반환해 변환 로직을 최소화한다.

## 1차 구현 순서
1. `reorder.dto` 설계
2. `reorder.repository` lookup + bulk update 추가
3. `reorder.service` 추가
4. `reorder.controller` 추가
5. backend test 작성
6. 그 다음에야 Next BFF fetch 전환
7. 마지막으로 runtime smoke로 순서 반영 확인

## 1차 금지 사항
- reset endpoint 동시 생성 금지
- `fields` reorder 같이 만들기 금지
- order 배열 완전성/중복성 정책 강화 동시 적용 금지
- auth/session logic를 backend로 옮기기 금지

## 검증 목표
- backend:
  - 200 `{ ok: true }`
  - space not found 404
  - bulk update 후 display order 반영 확인
- web:
  - 기존 route contract 유지
  - BFF 연동 smoke
- runtime:
  - 여러 tab의 `displayOrder`가 새 order대로 바뀌는지 확인
  - rollback 필요 시 partial write 없이 transaction 경계가 유지되는지 추가 관찰

## 다음 1작업 추천
- 다음엔
  **Spring `member-tabs reorder` API contract 문서 1개**
  만 만들고 멈춘다.
