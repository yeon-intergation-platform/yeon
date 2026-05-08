# Spring Member Tabs Reorder/Reset Pilot Inventory

## 문서 목적
- `member-tabs` aggregate의 남은 bulk mutation인 `reorder` / `reset`을 Spring으로 옮기기 전에
  현재 Next 구현의 **route / service / mutation rule / DB side effect** 경계를 고정한다.
- 이번 문서는 구현 문서가 아니라 **inventory SSOT**다.

## 1차 bulk 파일럿 범위
- 포함:
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
- 제외:
  - `GET|POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`
  - `member-tabs` create/update/delete (이미 Spring 이전 완료)

## 현재 route inventory

| 분류 | Route | 파일 | 현재 service 호출 | 1차 포함 |
|---|---|---|---|---|
| reorder | `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/route.ts` | `reorderTabs` | 예 |
| reset | `POST /api/v1/spaces/{spaceId}/member-tabs/reset` | `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts` | `resetSpaceTabsToDefaults` | 예 |

## 현재 인증/공통 경계
- 두 route 모두 Next route layer에서 `requireAuthenticatedUser`를 호출한다.
- reorder body validation은 `@yeon/api-contract/spaces`의 `reorderMemberTabsBodySchema`를 사용한다.
- reset은 body가 없다.
- 공통 에러 응답은 `jsonError`를 사용한다.

## 현재 service inventory

핵심 파일:
- `apps/web/src/server/services/member-tabs-service.ts`

### export 함수 inventory

| 함수 | 역할 | 1차 bulk 포함 |
|---|---|---|
| `reorderTabs` | order 배열 기준 일괄 `displayOrder` 수정 | 예 |
| `resetSpaceTabsToDefaults` | custom 탭 삭제 + system 탭 원상복구 | 예 |
| `createCustomTab` | custom create | 아니오 |
| `updateTab` | 단건 update | 아니오 |
| `deleteCustomTab` | 단건 delete | 아니오 |
| `createDefaultSystemTabs` | bootstrap/backfill | 아니오 |

## 현재 mutation rule inventory

### reorderTabs
- 입력: `spacePublicId`, `order: string[]`
- 규칙:
  - `spacePublicId` → internal bigint id 해석 필요
  - 배열 index를 그대로 새 `displayOrder`로 사용
  - 구현상 모든 `tabPublicId`에 대해 병렬 update 수행
  - 존재하지 않는 `tabPublicId`가 섞여도 현재 구현은 별도 404를 내지 않는다
  - 현재 구현은 order 배열의 완전성/중복 여부를 service에서 추가 검증하지 않는다

### resetSpaceTabsToDefaults
- 입력: `spacePublicId`
- 규칙:
  - `spacePublicId` → internal bigint id 해석 필요
  - `tabType != system`인 custom 탭 전부 삭제
  - custom 탭에 매달린 `member_field_definitions`는 FK cascade로 함께 삭제
  - 이후 `DEFAULT_SYSTEM_TABS` 기준으로 system 탭 5개의
    - `name`
    - `displayOrder`
    - `isVisible = true`
    - `updatedAt`
    를 원상복구
  - system 탭이 없을 때 새로 생성하지는 않고, 기존 row를 update만 한다

## 현재 DB inventory

### 직접 핵심 테이블

| 테이블 | 역할 | 1차 bulk 포함 |
|---|---|---|
| `spaces` | `spaceId(public_id)` → internal bigint id 해석 | 예 |
| `member_tab_definitions` | reorder/reset 대상 원본 | 예 |

### 인접 부작용 테이블

| 테이블 | 현재 쓰이는 이유 | 1차 bulk 포함 |
|---|---|---|
| `member_field_definitions` | reset에서 custom tab 삭제 시 cascade 삭제 | 간접 포함 |
| `member_field_values` | field definition 삭제 시 하위 cascade 가능성 검증 필요 | 간접 포함 |

## 1차 cutover target

### Spring backend가 새로 소유할 것
- `PATCH /spaces/{spaceId}/member-tabs/reorder`
- `POST /spaces/{spaceId}/member-tabs/reset`
- reorder/reset bulk command service + repository
- reset 기본 system tab restore rule
- reset cascade smoke 책임

### Next BFF가 당분간 유지할 것
- 인증 확인
- reorder body zod validation
- outward route path 유지
- Spring backend 호출 실패 시 `jsonError` translation

## 위험 포인트
1. reorder는 현재 구현상 **order 배열의 완전성/중복/존재성 검증이 약하다**. Spring으로 옮길 때 이 동작을 유지할지, 강화할지 먼저 결정해야 한다.
2. reorder는 bulk update라서 partial failure 시 상태가 어중간해질 수 있으므로 transaction 경계를 명확히 해야 한다.
3. reset은 custom tab 삭제와 system tab 복원이 한 사이클에 묶여 있어 **원자성**이 중요하다.
4. reset은 `member_field_definitions` cascade까지 확인하지 않으면 다음 cycle에서 잔존 row 오염이 남을 수 있다.
5. system tab row가 일부 없는 비정상 데이터에서 현재 Next 구현은 새 row를 만들지 않는다. Spring도 1차에서는 동일 동작을 맞출지 판단이 필요하다.

## 추천 구현 순서
1. reorder/reset inventory 함께 고정
2. **reorder 먼저** package plan / contract / skeleton / cutover
3. 그 다음 reset package plan / contract / skeleton / cutover

## 다음 1작업 추천
- 다음엔
  **Spring side `member-tabs reorder` package plan 문서 1개**
  만 만들고 멈춘다.
