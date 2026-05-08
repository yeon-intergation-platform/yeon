# Spring Member Tabs Write Package Plan

## 문서 목적
- `member-tabs` 1차 write 파일럿(create/update/delete)의 Spring 내부 구조를 미리 고정한다.
- 이번 문서는 **패키지/계층/호출 경계 설계 SSOT**다.
- 구현 전에 “어디에 무엇을 둘지”만 확정한다.

## 1차 파일럿 범위
- Spring backend가 새로 제공할 API
  - `POST /spaces/{spaceId}/member-tabs`
  - `PATCH /spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /spaces/{spaceId}/member-tabs/{tabId}`
- Next BFF가 유지할 API
  - `POST /api/v1/spaces/{spaceId}/member-tabs`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`

## 설계 원칙
1. **create/update/delete만** 먼저 옮긴다.
2. reorder/reset은 같은 aggregate라도 bulk mutation이므로 별도 lane으로 분리한다.
3. JPA entity를 곧바로 API 응답으로 노출하지 않는다.
4. Next outward 응답 shape와 Spring 내부 DTO를 분리한다.
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조

기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_tabs`

### 1차 생성 패키지
- `world.yeon.backend.member_tabs.write.controller`
- `world.yeon.backend.member_tabs.write.service`
- `world.yeon.backend.member_tabs.write.repository`
- `world.yeon.backend.member_tabs.write.dto`

## 패키지별 역할

### `write.controller`
- HTTP endpoint 진입점
- `spaceId`, `tabId` path variable 수신
- 현재 단계에서는 user identity를 **Next가 전달한 값**으로만 받는다
- body parse/validation은 Spring request DTO 수준만 담당한다

예상 클래스:
- `MemberTabWriteController`

### `write.service`
- write use case orchestration
- create/update/delete 규칙 적용
- protected system key / system tab 차단
- create의 `max(displayOrder)+1` 계산 포함

예상 클래스:
- `MemberTabWriteService`

### `write.repository`
- mutation 전용 조회 + 쓰기
- `spaces(public_id)` → internal id lookup
- existing tab 조회
- insert/update/delete

예상 클래스:
- `MemberTabWriteRepository`

### `write.dto`
- Spring request/response DTO
- outward response에 필요한 최소 item DTO

예상 클래스:
- `CreateMemberTabRequest`
- `UpdateMemberTabRequest`
- `MemberTabMutationResponse`

## 클래스 책임 초안

### `MemberTabWriteRepository`
- 메서드 후보:
  - `findSpaceInternalId(String spacePublicId)`
  - `findByPublicIdAndSpaceId(String tabPublicId, Long spaceInternalId)`
  - `findMaxDisplayOrder(Long spaceInternalId)`
  - `insertCustomTab(...)`
  - `updateTab(...)`
  - `deleteTab(...)`

### `MemberTabWriteService`
- 메서드 후보:
  - `createCustomTab(String spacePublicId, UUID userId, CreateMemberTabRequest request)`
  - `updateTab(String tabPublicId, String spacePublicId, UpdateMemberTabRequest request)`
  - `deleteCustomTab(String tabPublicId, String spacePublicId)`
- 책임:
  - space 존재 여부 검증
  - create 이름 trim/80자/빈 문자열 검증
  - create `max(displayOrder)+1` 계산
  - update 시 protected system key 403
  - delete 시 protected key 403 + `tabType=system` 403

### `MemberTabWriteController`
- endpoint 후보:
  - `POST /spaces/{spaceId}/member-tabs`
  - `PATCH /spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /spaces/{spaceId}/member-tabs/{tabId}`
- 에러 shape는 top-level `{ code, message }` 형식 유지

### `MemberTabMutationResponse`
- create/update 성공 시 `{ tab: ... }` response 구성
- delete는 body 없이 `204`

## DB 접근 전략

### 1차 선택
- **JPA entity + custom repository mutation** 조합으로 간다.

이유:
- read lane에서 이미 entity/repository baseline을 깔았음
- create/update/delete 규모는 JPA 기반으로 충분함
- reset/reorder처럼 bulk mutation이 아닌 단건 위주라 구현 폭이 좁다

## 보류
- reorder bulk update
- reset bulk restore
- field cascade verification logic를 service 내부에 과도하게 넣는 것

## Next BFF ↔ Spring 호출 계획

### 유지되는 것
- 프론트는 계속
  - `POST /api/v1/spaces/{spaceId}/member-tabs`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - `createCustomTab` / `updateTab` / `deleteCustomTab` 직접 호출
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
- Next route outward response shape는 유지
- Spring response도 가능하면 같은 shape를 바로 돌려주되, 내부 DTO 이름은 Spring 쪽에서 독립 유지

### create/update
- `{ tab: ... }`

### delete
- `204 No Content`

## 1차 구현 순서
1. `write.dto` 설계
2. `write.repository` lookup + mutation 추가
3. `write.service` 추가
4. `write.controller` 추가
5. backend test 작성
6. 그 다음에야 Next BFF fetch 전환

## 1차 금지 사항
- reorder/reset endpoint 동시 생성 금지
- `fields` mutation 같이 만들기 금지
- `createDefaultSystemTabs`/bootstrap 로직 같이 이식 금지
- auth/session logic를 backend로 옮기기 금지

## 검증 목표
- backend:
  - create 201 / update 200 / delete 204
  - protected system key 403
  - system tab delete 403
  - not found 404
- web:
  - 기존 route contract 유지
  - BFF 연동 smoke
- runtime:
  - create 후 row 생성 확인
  - update 후 name/isVisible/displayOrder 반영 확인
  - delete 후 row 삭제 + 관련 cascade 정리 확인

## 다음 1작업 추천
- 다음엔
  **Spring `member-tabs` write API contract 문서 1개**
  만 만들고 멈춘다.
