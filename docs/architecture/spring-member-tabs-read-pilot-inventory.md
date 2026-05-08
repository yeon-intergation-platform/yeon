# Spring Member Tabs Read Pilot Inventory

## 문서 목적
- `member-tabs`를 다음 Spring read 파일럿으로 옮기기 전에 현재 Next 구현의 **route / service / DB / consumer / side effect** 경계를 한 번에 정리한다.
- 이번 문서는 구현 문서가 아니라 **inventory SSOT**다.

## 파일럿 1차 범위
- 포함:
  - `GET /api/v1/spaces/{spaceId}/member-tabs`
- 제외:
  - `POST /api/v1/spaces/{spaceId}/member-tabs`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  - `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
  - `GET|POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## 현재 route inventory

| 분류 | Route | 파일 | 현재 service 호출 | 1차 포함 |
|---|---|---|---|---|
| list | `GET /api/v1/spaces/{spaceId}/member-tabs` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts` | `getTabsForSpace`, 조건부 `createDefaultSystemTabs`, `requireSpaceInternalIdByPublicId` | 예 |
| create | `POST /api/v1/spaces/{spaceId}/member-tabs` | 같은 파일 | `createCustomTab` | 아니오 |
| update | `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/route.ts` | `updateTab` | 아니오 |
| delete | `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}` | 같은 파일 | `deleteCustomTab` | 아니오 |
| reorder | `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/route.ts` | `reorderTabs` | 아니오 |
| reset | `POST /api/v1/spaces/{spaceId}/member-tabs/reset` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts` | `resetSpaceTabsToDefaults` | 아니오 |
| fields list | `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts` | `getOverviewTab`, 조건부 `createDefaultOverviewFields`, `getFieldsForTab`, `getFieldValuesForDefinitions` | 아니오 |
| fields create | `POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields` | 같은 파일 | `createField`, 조건부 `createDefaultOverviewFields` | 아니오 |
| fields reorder | `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts` | `reorderFields` 계열 | 아니오 |

## 현재 인증/공통 경계
- 모든 route는 Next route layer에서 `requireAuthenticatedUser`를 호출한다.
- 공통 에러 응답은 `jsonError`를 사용한다.
- 따라서 1차 cutover는 아래 두 레이어로 나뉜다.
  1. **Spring backend**
     - 실제 `member-tabs` read source of truth
  2. **Next BFF route**
     - 기존 쿠키/세션 기반 인증 유지
     - Spring 호출 결과를 기존 `{ tabs }` shape로 중계

## 현재 service inventory

핵심 파일:
- `apps/web/src/server/services/member-tabs-service.ts`

### export 함수 inventory

| 함수 | 역할 | 1차 이전 포함 |
|---|---|---|
| `createDefaultSystemTabs` | 스페이스 생성/백필용 시스템 탭 5개와 overview 기본 필드 생성 | 조건부/분리 필요 |
| `getTabsForSpace` | public space id 기반 탭 목록 조회 | 예 |
| `getTabsForSpaceByInternalId` | internal space id 기반 탭 목록 조회 | 예(내부 구현) |
| `getOverviewTab` | overview 탭 찾기 | 아니오 |
| `getOverviewTabByInternalSpaceId` | overview 탭 찾기(internal id) | 아니오 |
| `createCustomTab` | 커스텀 탭 생성 | 아니오 |
| `updateTab` | 탭 수정 | 아니오 |
| `deleteCustomTab` | 커스텀 탭 삭제 | 아니오 |
| `resetSpaceTabsToDefaults` | 시스템 탭 복구 + 커스텀 탭 삭제 | 아니오 |
| `reorderTabs` | display order 일괄 수정 | 아니오 |

## 현재 read 경로의 중요한 부작용

`GET /member-tabs`는 순수 read가 아니다. 현재 route는 아래 lazy backfill을 포함한다.

1. `getTabsForSpace(spaceId)`로 목록 조회
2. system tab이 하나도 없으면
   - `requireSpaceInternalIdByPublicId(spaceId)`
   - `createDefaultSystemTabs(spaceInternalId, currentUser.id)`
   - 다시 `getTabsForSpace(spaceId)`

즉 1차 cutover에서 먼저 결정해야 할 것은 아래 둘 중 하나다.
- **A. Spring read endpoint도 동일한 lazy backfill 포함**
- **B. backfill은 별도 write/bootstrap lane으로 분리하고 read endpoint는 순수 조회만 담당**

이번 inventory의 추천은 **B**다. read endpoint에 쓰기 부작용을 계속 남기면 Spring read/controller test가 불필요하게 무거워진다.

## 현재 DB inventory

### 직접 핵심 테이블

| 테이블 | 스키마 파일 | 역할 | 1차 읽기 포함 |
|---|---|---|---|
| `spaces` | `apps/web/src/server/db/schema/spaces.ts` | `spaceId(public_id)` → 내부 bigint id 해석 | 예 |
| `member_tab_definitions` | `apps/web/src/server/db/schema/member-tabs.ts` | 스페이스 탭 구조 원본 | 예 |

### 인접 연관 테이블

| 테이블 | 스키마 파일 | 현재 쓰이는 이유 | 1차 읽기 포함 |
|---|---|---|---|
| `member_field_definitions` | `apps/web/src/server/db/schema/member-fields.ts` | overview 기본 필드 백필 / fields route | 아니오 |
| `member_field_values` | `apps/web/src/server/db/schema/member-fields.ts` | fields route + member value 조합 응답 | 아니오 |

## `member_tab_definitions`에서 1차로 읽어야 하는 컬럼
- `public_id`
- `space_id`
- `created_by_user_id`
- `tab_type`
- `system_key`
- `name`
- `is_visible`
- `display_order`
- `created_at`
- `updated_at`

## 현재 응답/소비자 inventory

### route 응답 shape
- route:
  - `GET /api/v1/spaces/{spaceId}/member-tabs`
- shape:
  - `{ tabs: MemberTabDefinition[] }`에 가까운 raw row 기반 응답

실사용 필드:
- `id` (public id)
- `name`
- `tabType`
- `systemKey`
- `isVisible`
- `displayOrder`

### 주요 소비자

| 소비자 | 파일 | 기대 shape/행동 |
|---|---|---|
| student management tabs | `apps/web/src/features/student-management/hooks/use-dynamic-member-tabs.ts` | `{ tabs }` 응답을 받아 `isVisible` 필터 후 `student_board` synthetic tab 보정 |
| space settings API | `apps/web/src/features/space-settings/space-settings-api.ts` | `{ tabs: SpaceTab[] }` 기대 |

## 1차 cutover target

### Spring backend가 새로 소유할 것
- `GET /spaces/{spaceId}/member-tabs` 내부 endpoint
- public space id → internal id 조회
- `member_tab_definitions` read query
- 응답 DTO 매핑(`id/name/tabType/systemKey/isVisible/displayOrder`)

### Next BFF가 당분간 유지할 것
- 인증 확인
- 세션/쿠키 source of truth
- outward route path 유지: `/api/v1/spaces/{spaceId}/member-tabs`
- Spring backend 호출 실패 시 route-level error translation

## 위험 포인트
1. current GET route의 lazy backfill을 read lane에 계속 둘지 분리할지 결정 필요
2. consumer 일부는 `student_board` synthetic tab을 프론트에서 보정하므로, Spring 응답이 현재와 미세하게 달라지면 UX 회귀 가능
3. fields route도 overview backfill 부작용을 갖고 있으므로 member-tabs read 이후 연속 이전 설계가 필요
4. 현재 service가 raw DB row를 곧바로 반환하므로 Spring에서는 DTO shape를 먼저 잠가야 contract drift를 줄일 수 있다

## 다음 1작업 추천
- 다음엔
  **Spring side `member-tabs` read package plan 문서 1개**
  만 만들고 멈춘다.
