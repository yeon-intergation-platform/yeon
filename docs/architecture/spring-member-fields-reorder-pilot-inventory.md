# Spring Member Fields Reorder Pilot Inventory

## 문서 목적
- `member-fields` bulk mutation 중 **reorder lane**만 먼저 Spring으로 옮기기 위한 현재 Next 구현 규칙을 고정한다.
- 이번 문서는 구현 전의 **현재 source of truth / 부작용 / cutover 범위** SSOT다.

## 1차 파일럿 범위
- Next outward API
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`
- Spring internal target API
  - `PATCH /spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## 현재 Next 구현
### route
- 파일:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts`
- 현재 역할:
  - auth 확인
  - zod body validation
  - direct `reorderFields(spaceId, order)` 호출

### service
- 파일:
  - `apps/web/src/server/services/member-fields-service.ts`
- 현재 함수:
  - `reorderFields(spacePublicId, order)`
- 현재 규칙:
  1. `spacePublicId -> internalId`
  2. `order[]` index를 새 `displayOrder`로 사용
  3. 각 fieldPublicId마다 update를 독립 실행
  4. `tabId` path param은 route에 존재하지만 실제 reorder query에는 사용하지 않음
  5. order 완전성/중복/존재성 추가 검증은 없음

## 현재 부작용/리스크
1. bulk mutation source of truth가 Next service에 남아 있다.
2. path에 `tabId`가 있지만 실제 DB update는 `spaceId + fieldPublicId`만 사용한다.
3. 잘못된 order가 들어와도 best-effort로 일부만 반영될 수 있다.

## 1차 cutover 목표
- Spring이 reorder bulk mutation source of truth가 된다.
- Next route는 auth/BFF + Spring fetch만 남긴다.
- direct `reorderFields(...)` 호출은 route에서 제거한다.

## 1차 제외 범위
- create/update/delete 재작업
- field values write
- order 배열 완전성/중복/존재성 강화 검증
- tabId와 field 소속 일치성 강화 검증
