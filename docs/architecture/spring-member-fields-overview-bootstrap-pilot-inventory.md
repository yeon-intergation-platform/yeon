# spring member-fields overview bootstrap pilot inventory

## 현재 Next 구현 위치

- route:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts`
- direct service:
  - `apps/web/src/server/services/member-fields-service.ts`
    - `createDefaultOverviewFields(...)`
  - `apps/web/src/server/services/member-tabs-service.ts`
    - `getOverviewTab(...)`

## 현재 부작용 흐름

`memberId` 유무와 무관하게 overview 탭 요청이면:

1. `getOverviewTab(spaceId)`
2. `overviewTab?.publicId === tabId` 확인
3. `requireSpaceInternalIdByPublicId(spaceId)`
4. `createDefaultOverviewFields(spaceInternalId, overviewTab.id, currentUser.id)`
5. 그 뒤 Spring read endpoint 또는 Spring values endpoint 호출

즉 현재 남은 legacy는 **read 이전 lazy bootstrap write**다.

## 1차 cutover 범위

- 포함:
  - overview 탭의 default field bootstrap
  - idempotent insert
  - Next route의 direct `getOverviewTab/createDefaultOverviewFields` 제거
- 제외:
  - overview tab row 생성
  - non-overview 탭용 bootstrap
  - member field write/update/delete

## 권장 Spring 경계

- internal bootstrap endpoint:
  - `POST /spaces/{spaceId}/member-tabs/{tabId}/bootstrap-overview-fields`
- responsibility:
  - space lookup
  - tab lookup
  - overview system tab 확인
  - default overview field rows upsert/idempotent insert
  - `{ ok: true }` 응답

## 현재 source of truth

- 기본 overview 필드 정의:
  - `apps/web/src/lib/member-overview-fields.ts`
- 1차 권장:
  - backend에 Spring 전용 상수로 이식
  - shared SSOT 통합은 별도 lane

## cutover 후 Next에 남길 것

- `requireAuthenticatedUser(...)`
- Spring bootstrap fetch
- Spring fields read fetch
- Spring field-values read fetch
- error translation

## cutover 후 Next에서 제거할 것

- `getOverviewTab(...)`
- `createDefaultOverviewFields(...)`
- `requireSpaceInternalIdByPublicId(...)` (이 route 안에서 overview bootstrap 용도로 쓰는 부분)
