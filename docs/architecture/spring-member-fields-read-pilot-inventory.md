# Spring Member Fields Read Pilot Inventory

## 문서 목적
- `member-fields` read를 다음 Spring 파일럿으로 옮기기 전에
  현재 Next 구현의 route/service/부작용을 실제 코드 기준으로 고정한다.
- 이번 문서는 구현 전에 범위를 잠그는 inventory SSOT다.

## 1차 파일럿 범위
- outward route 유지:
  - `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
- 1차 목표:
  - Spring이 field read source of truth를 담당
  - Next는 auth/BFF만 남김

## 이번 파일럿에서 제외
- `POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
- `PATCH/DELETE /api/v1/spaces/{spaceId}/member-fields/{fieldId}`
- `reorder`
- values write/update
- auth/session migration

## 현재 Next route inventory
기준 파일:
- `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts`

### GET route 현재 책임
1. `requireAuthenticatedUser(request)`
2. `spaceId`, `tabId` 추출
3. `memberId` query param 확인
4. overview tab 여부 판단
   - `getOverviewTab(spaceId)`
   - overview면 `createDefaultOverviewFields(...)` lazy backfill 실행
5. `getFieldsForTab(tabId, spaceId)` 조회
6. `memberId`가 없으면 `{ fields }`
7. `memberId`가 있으면 `getFieldValuesForDefinitions(...)`까지 붙여 `{ fields, values }`

## 현재 service inventory
기준 파일:
- `apps/web/src/server/services/member-fields-service.ts`

### 직접 관련 read 함수
- `getFieldsForTab(tabPublicId, spacePublicId)`
- `getFieldsForTabByInternalIds(tabInternalId, spaceInternalId)`
- `createDefaultOverviewFields(spaceInternalId, overviewTabInternalId, userId)`

### 간접 관련 함수/의존
- `requireSpaceInternalIdByPublicId(spacePublicId)`
- `resolveTabInternalIdByPublicId(tabPublicId)`
- `getOverviewTab(spaceId)`
- `getFieldValuesForDefinitions(memberId, spaceId, fieldPublicIds)`

## 현재 read의 핵심 문제
### 1. 순수 read가 아님
- overview tab GET이 들어오면
  - `createDefaultOverviewFields(...)`
  를 먼저 실행한다.
- 즉 read 요청이 write/backfill을 유발한다.

### 2. field read와 values read가 섞여 있음
- `memberId` query가 있으면
  - field definition read
  - member-specific values read
  를 같은 route에서 함께 처리한다.

## 1차 cutover 추천
### 추천 범위
- **fields definition read만 먼저 Spring으로 이동**
- `memberId`가 없는 케이스를 1차 source of truth로 본다.

### 추천 제외
- `memberId` values 결합 응답은 다음 lane으로 분리
- overview lazy backfill은 read lane에 넣지 않음

## 이유
1. `member-tabs` 다음 인접 read라 패턴 재사용이 쉽다.
2. overview backfill까지 같이 옮기면 read lane이 write lane으로 다시 오염된다.
3. values join까지 같이 옮기면 scope가 커져 원인 분리가 어려워진다.

## 1차 Spring read에서 필요한 데이터
- `public.spaces`
- `public.member_tab_definitions`
- `public.member_field_definitions`

## 예상 response shape
### 1차 internal Spring 응답
- `{ fields: [...] }`

### outward Next 응답
- 그대로 `{ fields: [...] }`

## 정책 잠금
- overview lazy field backfill은 Spring read 1차에 넣지 않는다.
- `memberId` query values 결합은 다음 차수로 미룬다.
- `tabId`가 없거나 매칭되지 않으면 1차는 빈 배열 또는 not found 정책을 별도 계약 문서에서 확정한다.

## 다음 추천
- 다음 문서는
  **`spring-member-fields-read-package-plan.md`**
  - controller
  - service
  - repository
  - dto
  - Next BFF hop
  까지만 고정한다.
