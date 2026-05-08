# Spring Member Field Values Read Pilot Inventory

## 문서 목적
- `member-fields` GET route에서 아직 Next에 남아 있는 `memberId` values 결합 branch를 실제 코드 기준으로 고정한다.
- 이번 문서는 다음 Spring values read 파일럿의 inventory SSOT다.

## 현재 남은 legacy 범위
기준 route:
- `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts`

현재 상태:
- `memberId` 없음 → Spring read로 이미 cutover됨
- `memberId` 있음 → 아직 Next direct orchestration 유지

## 현재 `memberId` branch 흐름
1. `requireAuthenticatedUser(request)`
2. `spaceId`, `tabId`, `memberId` 추출
3. overview tab 여부 판단
   - `getOverviewTab(spaceId)`
   - overview면 `createDefaultOverviewFields(...)` lazy backfill 실행
4. `getFieldsForTab(tabId, spaceId)`
5. `getFieldValuesForDefinitions(memberId, spaceId, fields.map(...))`
6. `{ fields, values }` 반환

## 직접 관련 service inventory
### field definition 쪽
- `getOverviewTab(spaceId)`
- `createDefaultOverviewFields(spaceInternalId, overviewTabInternalId, userId)`
- `getFieldsForTab(tabId, spaceId)`

### values 쪽
기준 파일:
- `apps/web/src/server/services/member-field-values-service.ts`

핵심 함수:
- `getFieldValuesForDefinitions(memberPublicId, spacePublicId, fieldDefinitionPublicIds?)`
- 내부 의존:
  - `requireMemberInternalIdByPublicId(memberPublicId)`
  - `requireSpaceInternalIdByPublicId(spacePublicId)`
  - `member_field_values` + `member_field_definitions` inner join
  - `deletedAt is null` filter

## 현재 values query 특성
- member 기준 + space 기준 + optional fieldDefinitionPublicIds 기준으로 join 조회
- response row는 다음 정보를 함께 담음:
  - `fieldDefinitionPublicId`
  - `fieldName`
  - `fieldType`
  - `valueText/valueNumber/valueBoolean/valueJson`
- 즉 values만이 아니라 **definition metadata 포함 row set**이다.

## 남은 문제
### 1. route 전체가 아직 순수 Spring source of truth가 아님
- `memberId` branch는 여전히 Next가
  - overview lazy backfill
  - definitions read
  - values join
  을 직접 orchestrate 한다.

### 2. values branch와 overview backfill이 섞여 있음
- values read를 옮기려 해도 현재 route는 overview tab이면 write를 유발한다.

## 다음 파일럿 추천 경계
### 1차 values lane 범위
- Spring internal endpoint 신설
  - `GET /spaces/{spaceId}/member-tabs/{tabId}/field-values?memberId=...`
- Spring은
  - tab-space 정합성 확인
  - 이미 있는 definition read 결과 또는 fieldDefinitionIds 기준 values read
  - `{ values: [...] }` 또는 `{ fields, values }` 중 하나
  를 담당

### 추천
- field definition은 기존 Spring `fields` read 결과를 재사용하고,
- values lane은 **member-specific values read만** 맡는 쪽을 추천

## 이유
1. 이미 `fields` definition read는 Spring으로 올라갔다.
2. values lane은 member lookup + value join에만 집중하는 편이 서비스 경계가 선명하다.
3. overview lazy backfill은 values lane과도 분리하는 게 안전하다.

## 다음 문서 추천
- `spring-member-field-values-read-package-plan.md`
- 여기서
  - controller
  - service
  - repository
  - dto
  - Next BFF hop
  을 고정한다.
