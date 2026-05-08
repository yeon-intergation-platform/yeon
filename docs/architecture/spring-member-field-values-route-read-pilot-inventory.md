# Spring Member Field Values Route Read Pilot Inventory

## 문서 목적
- `GET /api/v1/spaces/{spaceId}/members/{memberId}/field-values`에 남아 있는 Next direct read 로직을 고정한다.

## 현재 route
기준 파일:
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts`

현재 GET 흐름:
1. `requireAuthenticatedUser(request)`
2. `spaceId`, `memberId` 추출
3. optional `fieldDefinitionId[]` query 추출
4. direct Next service 호출
   - `getFieldValues(memberId, spaceId)`
   - 또는 `getFieldValuesForDefinitions(memberId, spaceId, fieldDefinitionIds)`
5. `{ values }` 반환

## 현재 direct dependency
기준 파일:
- `apps/web/src/server/services/member-field-values-service.ts`

사용 함수:
- `getFieldValues(memberPublicId, spacePublicId)`
- `getFieldValuesForDefinitions(memberPublicId, spacePublicId, fieldDefinitionPublicIds?)`

반환 shape:
- `fieldDefinitionPublicId`
- `fieldName`
- `fieldType`
- `valueText/valueNumber/valueBoolean/valueJson`

## 남은 문제
- route GET이 아직 Spring이 아니라 Next DB/service read를 직접 사용한다.
- PATCH는 이미 Spring cutover 완료라 같은 route 안에 read/write source of truth가 갈라져 있다.

## 1차 추천 경계
- Spring internal GET 신설:
  - `GET /spaces/{spaceId}/members/{memberId}/field-values`
- optional query:
  - `fieldDefinitionId=...` 반복 허용
- Spring 응답은 기존 route consumer가 쓰는 메타데이터를 유지한다.

## 다음 구현 원칙
- route direct read 제거가 목표다.
- `google-sheets-export-service.ts` 같은 내부 service 소비자는 이번 lane 비범위다.
