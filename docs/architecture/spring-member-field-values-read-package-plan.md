# Spring Member Field Values Read Package Plan

## 문서 목적
- `member-fields` GET route의 남은 `memberId` values branch를 Spring으로 옮기기 위한 내부 구조를 고정한다.
- 이번 문서는 구현 전의 package/계층/호출 경계 SSOT다.

## 1차 파일럿 범위
- Spring backend가 새로 제공할 API
  - `GET /spaces/{spaceId}/member-tabs/{tabId}/field-values?memberId=...`
- Next BFF가 유지할 API
  - 기존 outward `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields?memberId=...`
- 1차 목표:
  - Spring이 member field values source of truth를 담당
  - field definition은 기존 Spring `fields` read 결과와 조합

## 설계 원칙
1. values read만 먼저 옮긴다.
2. overview lazy backfill은 values lane에 넣지 않는다.
3. Next는 auth/BFF와 두 Spring 응답 조합만 담당한다.
4. Spring values lane은 member/space/tab 정합성과 value join만 담당한다.

## 추천 패키지 구조
기준 root:
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/read`

### 1차 생성 패키지
- `controller`
- `service`
- `repository`
- `dto`

## 패키지별 역할
### `read.repository`
- `spaceId -> internalId`
- `tabId -> internalId + spaceId`
- `memberId -> internalId`
- fieldDefinitionIds by tab 조회
- `member_field_values` + `member_field_definitions` join values 조회

### `read.service`
- space/tab/member 존재 여부 확인
- tab-space 정합성 확인
- fieldDefinitions for tab 기준 values row 필터링
- outward values response 매핑

### `read.controller`
- `GET /spaces/{spaceId}/member-tabs/{tabId}/field-values?memberId=...`
- `X-Yeon-User-Id` header 수신
- top-level `{ code, message }` 에러 응답

### `read.dto`
- member field value row 응답 shape
- 추천 1차 응답:
  - `{ values: [...] }`

## Next BFF 조합 계획
- Next route는
  1. `fetchMemberFieldsFromSpring(...)`
  2. `fetchMemberFieldValuesFromSpring(...)`
  를 둘 다 호출
- 최종 outward는 기존처럼
  - `{ fields, values }`
  를 유지

## 1차 금지 사항
- overview lazy backfill 동시 이식 금지
- values write/upsert/bulkUpsert 금지
- route 전체를 한 번에 재설계하려고 하지 않기

## 다음 문서 추천
- `spring-member-field-values-read-api-contract.md`
