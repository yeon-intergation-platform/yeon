# Spring Member Field Values Write Pilot Inventory

## 문서 목적
- `member-field-values` write lane를 Spring으로 옮기기 위한 현재 Next 구현 규칙과 부작용을 고정한다.
- 이번 문서는 구현 전의 **source of truth / consumer / cutover 범위** SSOT다.

## 1차 파일럿 범위
- Next outward API
  - `PATCH /api/v1/spaces/{spaceId}/members/{memberId}/field-values`
- Spring internal target API
  - `PATCH /spaces/{spaceId}/members/{memberId}/field-values`

## 현재 Next 구현

### route
- 파일:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts`
- 현재 역할:
  - auth 확인
  - zod body validation (`bulkUpsertMemberFieldValuesBodySchema`)
  - direct `bulkUpsertFieldValues(memberId, spaceId, values)` 호출
  - 직후 `getFieldValuesForDefinitions(...)` 재조회 후 `{ ok: true, values }` 반환

### service
- 파일:
  - `apps/web/src/server/services/member-field-values-service.ts`
- 현재 write source of truth:
  - `bulkUpsertFieldValues(memberPublicId, spacePublicId, values)`
- 현재 규칙:
  1. `memberId -> internalId`
  2. `spaceId -> internalId`
  3. payload 내 fieldDefinitionPublicIds dedupe
  4. definition 존재 여부/space ownership 검증
  5. `buildValueColumns(fieldType, value)`로 컬럼 라우팅
  6. `insert ... onConflictDoUpdate(target: [memberId, fieldDefinitionId])`
  7. `null/undefined`는 clear semantics로 해석

## 현재 소비자
- `apps/web/src/features/student-management/hooks/use-custom-tab-fields.ts`
  - `saveMemberFieldValues(...)`가 PATCH 호출
- `apps/web/src/features/student-management/hooks/use-member-field-actions.tsx`
  - custom field value 편집 시 PATCH 결과의 `values`로 캐시 patch

## 현재 부작용/리스크
1. member field value mutation source of truth가 Next service에 남아 있다.
2. write 후 read-back을 같은 route에서 직접 다시 수행한다.
3. clear semantics(`null`)와 fieldType별 컬럼 매핑 규칙이 Spring으로 옮겨지지 않으면 drift가 생긴다.

## 1차 cutover 목표
- Spring이 bulk upsert mutation source of truth가 된다.
- Next route는 auth/BFF + Spring fetch만 남긴다.
- direct `bulkUpsertFieldValues(...)` 호출은 route에서 제거한다.

## 1차 제외 범위
- GET read lane 재작업
- 별도 delete endpoint 추가
- member patch(member name/email/phone/status) 흐름 변경
- optimistic cache 전략 변경
