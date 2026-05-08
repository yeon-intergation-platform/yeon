# Spring Member Tabs Write Pilot Inventory

## 문서 목적
- `member-tabs` write lane을 Spring으로 옮기기 전에 현재 Next 구현의 **route / service / mutation rule / DB side effect** 경계를 정리한다.
- 이번 문서는 구현 문서가 아니라 **inventory SSOT**다.

## 1차 write 파일럿 범위
- 포함:
  - `POST /api/v1/spaces/{spaceId}/member-tabs`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- 제외:
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
  - `GET|POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## 현재 route inventory

| 분류 | Route | 파일 | 현재 service 호출 | 1차 포함 |
|---|---|---|---|---|
| create | `POST /api/v1/spaces/{spaceId}/member-tabs` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts` | `createCustomTab` | 예 |
| update | `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/route.ts` | `updateTab` | 예 |
| delete | `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}` | 같은 파일 | `deleteCustomTab` | 예 |
| reorder | `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/route.ts` | `reorderTabs` | 아니오 |
| reset | `POST /api/v1/spaces/{spaceId}/member-tabs/reset` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts` | `resetSpaceTabsToDefaults` | 아니오 |

## 현재 인증/공통 경계
- 모든 route는 Next route layer에서 `requireAuthenticatedUser`를 호출한다.
- body validation은 `@yeon/api-contract/spaces`의 zod schema를 사용한다.
- 공통 에러 응답은 `jsonError`를 사용한다.

## 현재 service inventory

핵심 파일:
- `apps/web/src/server/services/member-tabs-service.ts`

### export 함수 inventory

| 함수 | 역할 | 1차 write 포함 |
|---|---|---|
| `createCustomTab` | 커스텀 탭 생성, max order 계산 | 예 |
| `updateTab` | 이름/가시성/순서 수정, protected system key 차단 | 예 |
| `deleteCustomTab` | custom 탭만 삭제, system/protected 차단 | 예 |
| `reorderTabs` | order 배열 기준 일괄 display order 수정 | 아니오 |
| `resetSpaceTabsToDefaults` | custom 탭 삭제 + system 탭 원상복구 | 아니오 |
| `createDefaultSystemTabs` | bootstrap/backfill용 시스템 탭 생성 | 아니오 |

## 현재 mutation rule inventory

### createCustomTab
- 입력: `spacePublicId`, `userId`, `{ name }`
- 규칙:
  - 이름 trim 후 80자 제한
  - 빈 이름 불가
  - space internal id 해석 필요
  - 기존 탭의 max `displayOrder + 1`로 생성
  - `tabType = custom`, `systemKey = null`, `isVisible = true`

### updateTab
- 입력: `tabPublicId`, `spacePublicId`, patch body
- 규칙:
  - `(tabPublicId, spaceId)`로 existing 조회
  - 미존재시 404
  - protected system key면 403
  - 이름 변경 시 trim + 80자 제한 + 빈 이름 불가
  - `isVisible`, `displayOrder`는 patch 존재 시만 반영

### deleteCustomTab
- 입력: `tabPublicId`, `spacePublicId`
- 규칙:
  - `(tabPublicId, spaceId)`로 existing 조회
  - 미존재시 404
  - protected system key면 403
  - `tabType = system`이면 403
  - 삭제 자체는 탭 row delete 1회

## 현재 DB inventory

### 직접 핵심 테이블

| 테이블 | 역할 | 1차 write 포함 |
|---|---|---|
| `spaces` | `spaceId(public_id)` → internal bigint id 해석 | 예 |
| `member_tab_definitions` | create/update/delete 대상 원본 | 예 |

### 인접 부작용 테이블

| 테이블 | 현재 쓰이는 이유 | 1차 write 포함 |
|---|---|---|
| `member_field_definitions` | custom tab 삭제 시 FK cascade 영향 가능 | 간접만 |

## 1차 cutover target

### Spring backend가 새로 소유할 것
- `POST /spaces/{spaceId}/member-tabs`
- `PATCH /spaces/{spaceId}/member-tabs/{tabId}`
- `DELETE /spaces/{spaceId}/member-tabs/{tabId}`
- create/update/delete command service + repository
- protected/system tab rule

### Next BFF가 당분간 유지할 것
- 인증 확인
- zod body validation
- outward route path 유지
- Spring backend 호출 실패 시 `jsonError` translation

## 위험 포인트
1. create는 `max(displayOrder)+1` 계산이 필요해서 read/write race를 의심해야 한다.
2. update/delete는 protected system key와 `tabType=system` 규칙이 섞여 있어 403 조건을 정확히 맞춰야 한다.
3. custom tab delete가 field cascade를 일으키므로 runtime smoke에서 관련 row 정리까지 확인해야 한다.
4. reorder/reset은 같은 aggregate라도 bulk mutation이라 별도 lane으로 분리해야 원인 분리가 쉽다.

## 다음 1작업 추천
- 다음엔
  **Spring side `member-tabs` write package plan 문서 1개**
  만 만들고 멈춘다.
