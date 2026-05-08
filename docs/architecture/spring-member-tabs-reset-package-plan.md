# Spring Member Tabs Reset Package Plan

## 문서 목적
- `member-tabs` bulk mutation 중 **reset lane만 따로** Spring으로 옮기기 위한 내부 구조를 고정한다.
- 이번 문서는 구현 전의 **패키지/계층/호출 경계 설계 SSOT**다.
- reorder는 이미 cutover가 끝났으므로 이번 문서에서 제외한다.

## 1차 reset 파일럿 범위
- Spring backend가 새로 제공할 API
  - `POST /spaces/{spaceId}/member-tabs/reset`
- Next BFF가 유지할 API
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`

## 설계 원칙
1. **reset만** 먼저 옮긴다.
2. reset은 custom tab 삭제 + system tab 복원이 같이 묶이는 bulk mutation이므로 **transaction 경계**를 service에 명시한다.
3. 1차에서는 Next 현재 동작과 최대한 동일하게 간다.
   - system tab row가 없어도 새로 생성하지 않음
   - 기존 row update만 수행
4. reset의 핵심 검증은 `member_field_definitions` cascade까지 포함한다.
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조

기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_tabs`

### 1차 생성 패키지
- `world.yeon.backend.member_tabs.reset.controller`
- `world.yeon.backend.member_tabs.reset.service`
- `world.yeon.backend.member_tabs.reset.repository`
- `world.yeon.backend.member_tabs.reset.dto`

## 패키지별 역할

### `reset.controller`
- HTTP endpoint 진입점
- `spaceId` path variable 수신
- `X-Yeon-User-Id` internal caller header 수신
- body 없는 reset 요청 처리

예상 클래스:
- `MemberTabResetController`

### `reset.service`
- reset use case orchestration
- `spaceId -> internalId` 확인
- **하나의 transaction 안에서**
  - custom tab bulk delete
  - system tab restore
  를 함께 수행

예상 클래스:
- `MemberTabResetService`

### `reset.repository`
- reset 전용 조회 + bulk mutation
- `spaces(public_id)` → internal id lookup
- `tabType != system` custom tab bulk delete
- `DEFAULT_SYSTEM_TABS` 기준 system tab restore update
- 필요 시 검증용 count query 추가

예상 클래스:
- `MemberTabResetRepository`

### `reset.dto`
- 성공 응답 DTO
- outward response는 최소 `{ ok: true }`

예상 클래스:
- `OkResponse`

## 클래스 책임 초안

### `MemberTabResetRepository`
- 메서드 후보:
  - `findSpaceInternalId(String spacePublicId)`
  - `deleteCustomTabs(Long spaceInternalId)`
  - `restoreSystemTab(Long spaceInternalId, String systemKey, String name, int displayOrder)`
  - `countRemainingCustomTabs(Long spaceInternalId)` (검증용)
- 1차 원칙:
  - system tab row가 없으면 update count 0이어도 새 row를 만들지 않는다
  - Next 현재 동작과 동일하게 existing row restore만 수행한다

### `MemberTabResetService`
- 메서드 후보:
  - `resetTabs(String spacePublicId)`
- 책임:
  - space 존재 여부 검증
  - custom tab bulk delete
  - 기본 system tab 5개 name/displayOrder/isVisible restore
  - 전체 sequence를 하나의 transaction에서 수행

### `MemberTabResetController`
- endpoint 후보:
  - `POST /spaces/{spaceId}/member-tabs/reset`
- 성공 응답:
  - `{ ok: true }`
- 에러 shape:
  - top-level `{ code, message }`

### `OkResponse`
- reset 성공 시 `{ ok: true }`
- reorder lane의 DTO를 재사용할지, reset lane 별도 DTO를 둘지는 구현 시 선택 가능
  - 기본 추천: **기존 `member_tabs.reorder.dto.OkResponse` 재사용 금지**
  - lane 독립성을 위해 reset 패키지 안에 같은 이름의 DTO를 둔다

## DB 접근 전략

### 1차 선택
- **custom repository class + EntityManager/native bulk mutation** 조합으로 간다.

이유:
- reset은 JPA entity save보다 bulk delete/update 조합이 핵심이다.
- cascade 부작용을 명시적으로 테스트하기 쉽다.
- reorder lane과 동일한 패턴으로 맞추면 운영 일관성이 좋다.

## Next BFF ↔ Spring 호출 계획

### 유지되는 것
- 프론트는 계속
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
  를 호출

### 바뀌는 것
- Next route 내부 구현만
  - `resetSpaceTabsToDefaults(...)` 직접 호출
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
1. `reset.dto` 설계
2. `reset.repository` lookup + custom delete + system restore 추가
3. `reset.service` 추가
4. `reset.controller` 추가
5. backend test 작성
6. 그 다음에야 Next BFF fetch 전환
7. 마지막으로 runtime smoke로
   - custom tab 삭제
   - system tab restore
   - field cascade
   를 확인

## 1차 금지 사항
- reorder 로직 재수정 금지
- `fields` reset 같이 만들기 금지
- missing system tab 자동 생성 동시 적용 금지
- auth/session logic를 backend로 옮기기 금지

## 검증 목표
- backend:
  - 200 `{ ok: true }`
  - space not found 404
  - custom tab 0건 확인
  - system tab name/displayOrder/isVisible restore 확인
- web:
  - 기존 route contract 유지
  - BFF 연동 smoke
- runtime:
  - custom tab 삭제 + `member_field_definitions` cascade 확인
  - 다른 space 오염 없는지 확인

## 다음 1작업 추천
- 다음엔
  **Spring `member-tabs reset` API contract 문서 1개**
  만 만들고 멈춘다.
